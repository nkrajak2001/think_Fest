import { useEffect, useState } from "react";
import API from "../../services/api";
import { toast } from "react-toastify";

export default function Bookings() {

  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    const res = await API.get("/bookings/my");
    setBookings(res.data);
  };

  const cancelBooking = async (id) => {

    try {

      await API.patch(`/bookings/${id}/cancel`);

      toast.success("Booking cancelled");

      loadBookings();

    } catch (err) {

      toast.error(err.response.data.message);

    }
  };

  return (
    <div>

      <h1 className="text-2xl font-bold mb-6">
        My Bookings
      </h1>

      <table className="w-full text-left">

        <thead className="text-zinc-400 text-sm">
          <tr>
            <th>Slot</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>

          {bookings.map((b) => (

            <tr key={b._id} className="border-b border-zinc-800">

              <td className="py-3">
                {b.slotId.slotNumber}
              </td>

              <td>{b.status}</td>

              <td>

                {b.status === "pending" && (

                  <button
                    onClick={() => cancelBooking(b._id)}
                    className="text-red-400"
                  >
                    Cancel
                  </button>

                )}

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}