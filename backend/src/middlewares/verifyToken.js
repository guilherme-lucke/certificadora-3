import User from "../models/User.js";
import jwt from "jsonwebtoken";

const verifyToken = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized, no token provided",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({
          message: "User not found",
        });
      }

      req.user = {
        id: user._id,
        role: user.role,
      };

      next();
    } catch (error) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }
  } catch (error) {
    next(error);
  }
};

export default verifyToken;
