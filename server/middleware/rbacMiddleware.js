class RBAC {

  static authorize(...allowedRoles) {
    return (req, res, next) => {
      try {
        const userRole = req.user?.role;

        if (!userRole) {
          return res.status(401).json({
            message: "Unauthorized: No role found"
          });
        }

        if (!allowedRoles.includes(userRole)) {
          return res.status(403).json({
            message: "Forbidden: Insufficient permissions"
          });
        }

        next();

      } catch (error) {
        return res.status(500).json({
          message: "RBAC Middleware Error",
          error: error.message
        });
      }
    };
  }

}

module.exports = RBAC;