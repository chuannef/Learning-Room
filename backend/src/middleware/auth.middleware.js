import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized - User not found" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.log("Error in protectRoute middleware", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Lightweight auth: verify JWT and expose userId without hitting MongoDB.
// Useful for endpoints that only need the authenticated user's id.
export const requireJwtUserId = (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!decoded?.userId) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.log("Error in requireJwtUserId middleware", error);
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};
