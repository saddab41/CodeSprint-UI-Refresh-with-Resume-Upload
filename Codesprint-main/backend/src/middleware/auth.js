import jwt from "jsonwebtoken";

export const auth = (roles = []) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({
          message: "Authentication required. Please login.",
        });
      }

      if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          message: "Invalid authentication format. Please login again.",
        });
      }

      const token = authHeader.slice(7);

      if (!token) {
        return res.status(401).json({
          message: "Authentication token is missing.",
        });
      }

      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is missing");

        return res.status(500).json({
          message: "Server configuration error.",
        });
      }

      const user = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      if (
        roles.length > 0 &&
        !roles.includes(user.role)
      ) {
        return res.status(403).json({
          message:
            "You do not have permission to perform this action.",
        });
      }

      req.user = user;

      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          message:
            "Your login session has expired. Please login again.",
        });
      }

      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          message:
            "Invalid login token. Please login again.",
        });
      }

      console.error("Authentication error:", error);

      return res.status(401).json({
        message:
          "Authentication failed. Please login again.",
      });
    }
  };
};