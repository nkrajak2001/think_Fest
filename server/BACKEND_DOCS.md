# Smart Campus Parking — Backend Controller Documentation

## Requirements Checklist

| # | Requirement | Status | Where |
|---|-------------|--------|-------|
| 1 | User registration/login | ✅ | AuthController.register, AuthController.login |
| 2 | Secure authentication (JWT) | ✅ | authMiddleware.js, generateToken.js (cookie + Bearer) |
| 3 | Role-Based Access Control (Admin, Staff, User) | ✅ | rbacMiddleware.js (RBAC.authorize) |
| 4 | Parking slot viewing | ✅ | SlotController.getAvailableSlots, getSlotById |
| 5 | Slot booking | ✅ | BookingController.bookSlot |
| 6 | Prevent double booking | ✅ | user.hasActiveBooking flag + slot status check |
| 7 | One active booking per user | ✅ | hasActiveBooking check in bookSlot |
| 8 | Cancellation before check-in | ✅ | BookingController.cancelBooking (only pending) |
| 9 | Staff-based check-in | ✅ | StaffController.checkIn |
| 10 | Staff-based check-out | ✅ | StaffController.checkOut |
| 11 | Automated time-based billing | ✅ | StaffController.checkOut (calculates duration) |
| 12 | Minimum 1-hour charge | ✅ | Math.max(1, Math.ceil(durationMinutes / 60)) |
| 13 | Slot status flow (Available→Booked→Occupied→Available) | ✅ | bookSlot→checkIn→checkOut updates status |
| 14 | Admin dashboard (slot/pricing/revenue) | ✅ | AdminController.getDashboardStats, getRevenue |
| 15 | Admin slot management (CRUD) | ✅ | AdminController.createSlot/updateSlot/deleteSlot |
| 16 | Admin pricing management | ✅ | AdminController.setPricing, getPricing |
| 17 | OOP principles (classes) | ✅ | All controllers and RBAC use ES6 classes |
| 18 | Middleware-based authorization | ✅ | authMiddleware + RBAC.authorize on every route |
| 19 | Input validation | ✅ | validateMiddleware.js on routes |
| 20 | Expired booking cleanup | ✅ | bookingCleanup.js (runs every 2 min) |

---

## Controller-by-Controller Breakdown

---

### 1. AuthController.js

Handles all user account operations.

#### `register(req, res)`
- **What it does**: Creates a new user account
- **Logic**:
  1. Takes `name`, `email`, `password`, `vehicleNumber` from request body
  2. Checks if a user with the same email already exists → returns 400 if yes
  3. Hashes the password using bcrypt with 12 salt rounds
  4. Creates the user in DB with `role: 'user'` (hardcoded — users can't self-assign roles)
  5. Generates a JWT token and sets it as an httpOnly cookie
  6. Returns the token + user info (without password)

#### `login(req, res)`
- **What it does**: Authenticates a user and issues a session token
- **Logic**:
  1. Finds user by email
  2. Compares the provided password against the stored bcrypt hash
  3. If match → generates JWT, sets cookie, returns token + user info
  4. If no match → returns 400 "Invalid credentials" (same message for both wrong email and wrong password to prevent user enumeration)

#### `logout(req, res)`
- **What it does**: Clears the auth cookie to end the session
- **Logic**: Sets the `token` cookie to empty string with `expires: new Date(0)` (past date = browser deletes it)

#### `getMe(req, res)`
- **What it does**: Returns the currently logged-in user's profile
- **Logic**: Uses `req.user.id` (set by authMiddleware from JWT) to find the user, excludes passwordHash from response

#### `updateProfile(req, res)`
- **What it does**: Lets a user update their name or vehicle number
- **Logic**: Only updates fields that are provided (partial update). Uses `findByIdAndUpdate` with `runValidators: true`

#### `changePassword(req, res)`
- **What it does**: Lets a user change their password
- **Logic**:
  1. Verifies old password matches using bcrypt.compare
  2. If correct → hashes new password and saves
  3. If incorrect → returns 400

---

### 2. BookingController.js

Handles the user's booking lifecycle.

#### `bookSlot(req, res)`
- **What it does**: Books a parking slot for the user
- **Logic**:
  1. Checks `user.hasActiveBooking` — if `true`, rejects (one booking per user rule)
  2. Finds the slot by ID, checks if `status === 'available'` — if not, rejects (prevents double booking)
  3. Creates a Booking document with `status: 'pending'`
  4. Updates the slot: `status → 'booked'`, stores the booking ID in `currentBookingId`
  5. Sets `user.hasActiveBooking = true`
- **Business rules enforced**: No double booking, one active booking per user

#### `cancelBooking(req, res)`
- **What it does**: Cancels a pending booking before check-in
- **Logic**:
  1. Finds booking, verifies it belongs to the requesting user
  2. Checks `status === 'pending'` — only pending bookings can be cancelled (not active/completed)
  3. Sets booking `status → 'cancelled'`, removes TTL expiry
  4. Reverts slot to `status → 'available'`, clears `currentBookingId`
  5. Sets `user.hasActiveBooking = false` so user can book again

#### `payBill(req, res)`
- **What it does**: Marks a bill as paid by the user
- **Logic**:
  1. Verifies booking belongs to user and is `completed`
  2. Finds the linked Bill document
  3. Checks if already paid → rejects if yes
  4. Sets `bill.paidAt = new Date()`

#### `getMyBookings(req, res)`
- **What it does**: Returns all bookings for the logged-in user
- **Logic**: Queries bookings by userId, populates slot details and bill info, sorts newest first

#### `getAllBookings(req, res)`
- **What it does**: Returns all bookings with pagination (admin/staff only)
- **Logic**:
  1. Supports `?page=1&limit=20&status=pending` query params
  2. Uses `Promise.all` to run the query and count in parallel for performance
  3. Returns bookings + pagination metadata (total, page, pages)

---

### 3. StaffController.js

Handles staff operations for parking management.

#### `findBookings(req, res)`
- **What it does**: Search bookings by vehicle number, slot number, or status
- **Logic**:
  1. Accepts query params: `vehicleNumber`, `slotId` (slot number), `status`
  2. If `slotId` is provided, looks up the ParkingSlot by slotNumber to get its ObjectId
  3. Returns matching bookings with populated user, slot, and bill data

#### `checkIn(req, res)`
- **What it does**: Staff checks in a user who arrives at their booked slot
- **Logic**:
  1. Finds booking by ID, verifies `status === 'pending'`
  2. Sets `status → 'active'`, records `checkInTime = new Date()`
  3. Removes `expiresAt` (so MongoDB TTL index doesn't auto-delete this booking)
  4. Updates slot `status → 'occupied'`
- **Slot flow**: Booked → Occupied

#### `checkOut(req, res)` ⭐ (Most complex function)
- **What it does**: Staff checks out a user and generates the bill
- **Logic**:
  1. Finds booking (must be `status === 'active'`), populates slot data
  2. **Calculates duration**: `checkOutTime - checkInTime` in minutes
  3. **Looks up pricing**: Finds active Pricing for the slot's type (regular/ev/handicap/vip)
  4. **Applies minimum 1-hour rule**: `Math.max(1, Math.ceil(durationMinutes / 60))`
     - 0-60 min = 1 hour billed
     - 61-120 min = 2 hours billed
     - etc.
  5. **Calculates total**: `billableHours × hourlyRate`
  6. **Creates Bill document** with duration, billableHours, hourlyRate, totalAmount
  7. **Updates booking**: `status → 'completed'`, stores checkOutTime and billId
  8. **Resets slot**: `status → 'available'`, `currentBookingId → null`
  9. **Resets user**: `hasActiveBooking → false`
- **Slot flow**: Occupied → Available

---

### 4. AdminController.js

Admin-only operations for system management.

#### `createSlot(req, res)`
- **What it does**: Creates a new parking slot
- **Logic**: Checks for duplicate slot number (case-insensitive), creates with `slotNumber`, `type`, `floor`, `section`

#### `updateSlot(req, res)`
- **What it does**: Updates slot properties (type, floor, section)
- **Logic**: Uses `findByIdAndUpdate` with validators

#### `deleteSlot(req, res)`
- **What it does**: Deletes a slot permanently
- **Logic**: Only allows deletion if `status === 'available'` (can't delete booked/occupied slots)

#### `getAllSlots(req, res)`
- **What it does**: Lists all slots with optional filters
- **Logic**: Supports `?status=available&type=ev&floor=1` query params

#### `setMaintenance(req, res)`
- **What it does**: Puts a slot into maintenance mode
- **Logic**: Only available slots can go to maintenance (not booked/occupied ones)

#### `activateSlot(req, res)`
- **What it does**: Brings a slot back from maintenance
- **Logic**: Only maintenance slots can be activated back to available

#### `setPricing(req, res)`
- **What it does**: Sets or updates the hourly rate for a slot type
- **Logic**: Uses `findOneAndUpdate` with `upsert: true` — creates pricing if it doesn't exist, updates if it does

#### `getPricing(req, res)`
- **What it does**: Returns all active pricing rules

#### `getRevenue(req, res)`
- **What it does**: Returns revenue statistics
- **Logic**:
  1. Supports date filtering: `?from=2026-01-01&to=2026-03-01`
  2. Uses MongoDB aggregation pipeline to calculate total revenue, total collected (paid), total bills, paid bills

#### `getDashboardStats(req, res)`
- **What it does**: Returns a dashboard overview
- **Logic**: Runs 3 aggregation queries in parallel:
  1. Slot count by status (available: X, booked: Y, occupied: Z)
  2. Booking count by status (pending: X, active: Y, completed: Z)
  3. Total revenue and bill count

#### `getAllUsers(req, res)`
- **What it does**: Lists all registered users (without passwords)

#### `updateUserRole(req, res)`
- **What it does**: Changes a user's role (user ↔ staff ↔ admin)
- **Logic**: Validates role is one of ['user', 'staff', 'admin'] before updating

#### `confirmPayment(req, res)`
- **What it does**: Admin/staff confirms a bill payment
- **Logic**: Sets `bill.paidAt = new Date()` if not already paid

---

### 5. SlotController.js

Public slot viewing for all authenticated users.

#### `getAvailableSlots(req, res)`
- **What it does**: Lists slots with optional filters
- **Logic**: Supports `?status=available&type=regular&floor=1` query params. Sorted by slot number.

#### `getSlotById(req, res)`
- **What it does**: Returns a single slot with its current booking details
- **Logic**: Populates `currentBookingId` to show active booking info if any

---

## Middleware Breakdown

---

### 1. authMiddleware.js

- **What it does**: Protects routes by verifying the user's JWT token
- **Logic**:
  1. First checks for a token in `req.cookies.token` (cookie-based auth)
  2. If no cookie, checks `Authorization: Bearer <token>` header (API-based auth)
  3. Uses `jwt.verify()` to decode the token using `JWT_SECRET`
  4. If valid → sets `req.user = { id, role }` (decoded from token payload) and calls `next()`
  5. If invalid/expired → returns 401
- **Why both cookie and Bearer**: Cookie works for browser-based frontend, Bearer header works for API testing tools like Postman/Thunder Client

---

### 2. rbacMiddleware.js (RBAC Class)

- **What it does**: Restricts routes to specific roles (admin, staff, user)
- **Logic**:
  1. `RBAC.authorize('admin', 'staff')` returns a middleware function
  2. That middleware reads `req.user.role` (set by authMiddleware)
  3. Checks if the role is in the allowed list → calls `next()` if yes
  4. Returns 403 "Forbidden" if the role is not allowed
- **OOP**: Uses a class with a static factory method pattern — `authorize()` returns a closure (middleware function) that captures the allowed roles
- **Usage in routes**: Always chained after `authMiddleware`:
  ```
  router.post('/', authMiddleware, RBAC.authorize('user'), handler)
  ```

---

### 3. validateMiddleware.js

- **What it does**: Validates request body before it reaches the controller
- **Helper**: Uses a `fail(res, msg)` helper that returns `res.status(400).json({ message })` 

#### Exported Validators:

| Validator | Used On | What It Checks |
|-----------|---------|----------------|
| `validateRegister` | POST /api/auth/register | name ≥ 2 chars, valid email format, password ≥ 6 chars |
| `validateLogin` | POST /api/auth/login | email and password both present |
| `validateBooking` | POST /api/bookings | slotId present and is a valid MongoDB ObjectId |
| `validatePricing` | POST /api/admin/pricing | slotType is one of [regular, ev, handicap, vip], hourlyRate > 0 |
| `validateSlot` | POST /api/admin/slots | slotNumber, type, floor, section all present and valid |
| `validateProfileUpdate` | PATCH /api/auth/me | name ≥ 2 chars if provided, vehicleNumber not empty if provided |
| `validatePasswordChange` | POST /api/auth/change-password | both oldPassword and newPassword present, newPassword ≥ 6 chars |

- **Why middleware validation**: Catches bad input early before hitting the database. Returns clear error messages. Keeps controller logic clean.

---

## Utils Breakdown

---

### 1. generateToken.js

- **What it does**: Creates a signed JWT token for a user
- **Logic**:
  1. Takes a `user` object (must have `_id` and `role`)
  2. Signs a payload `{ id: user._id, role: user.role }` using `jwt.sign()`
  3. Uses `JWT_SECRET` from environment and expiry from `JWT_EXPIRES_IN` (defaults to '1d')
- **Where it's used**: Called in `AuthController.register()` and `AuthController.login()` after successful authentication
- **What's in the token**: Only `id` and `role` — this is what `authMiddleware` decodes into `req.user`

---

### 2. bookingCleanup.js

- **What it does**: Automatically expires pending bookings that weren't checked in within 15 minutes
- **Logic**:
  1. Finds all bookings where `status === 'pending'` AND `expiresAt <= now`
  2. For each expired booking:
     - Sets `booking.status → 'expired'`
     - Resets slot `status → 'available'`, clears `currentBookingId`
     - Resets `user.hasActiveBooking → false`
  3. Logs how many bookings were cleaned up
- **How it runs**: Called once on server startup + runs every 2 minutes via `setInterval` in `app.js`
- **Why it exists**: The Booking model has `expiresAt` set to `bookingTime + 15 minutes` (via pre-save hook). This cleanup ensures that if a user books but never shows up for check-in, the slot is freed automatically. Without this, booked slots would stay blocked forever.

---

## Complete API Flow

```
1. Register → POST /api/auth/register
2. Login → POST /api/auth/login (get JWT cookie)
3. Admin seeds pricing → POST /api/admin/pricing
4. Admin creates slots → POST /api/admin/slots
5. User views available slots → GET /api/slots?status=available
6. User books a slot → POST /api/bookings { slotId, vehicleNumber }
   - Slot: available → booked
   - User: hasActiveBooking = true
7. User arrives, staff checks in → PATCH /api/staff/:bookingId/checkin
   - Slot: booked → occupied
   - Booking: pending → active
8. User leaves, staff checks out → PATCH /api/staff/:bookingId/checkout
   - Auto-calculates bill (min 1-hour)
   - Slot: occupied → available
   - Booking: active → completed
   - User: hasActiveBooking = false
9. User pays bill → PATCH /api/bookings/:id/pay
10. Admin views stats → GET /api/admin/dashboard
```
