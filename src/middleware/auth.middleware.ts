import { Request, Response, NextFunction } from "express";
import * as cookie from "cookie";
import { verifyToken } from "../utils/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const verifyUser = (req: Request, res: Response, next: NextFunction) => {
  const cookiesHeader = req.headers.cookie || "";
  const cookies = cookiesHeader ? cookie.parse(cookiesHeader) : {};
  const token = cookies.token;
  if (!token) {
    // if (process.env.NODE_ENV === "development") {
    //   return next();
    // }
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = verifyToken(token);
    (req as any).user_token = decoded.user_token;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
};

export const verifyAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const cookiesHeader = req.headers.cookie || "";
  const cookies = cookiesHeader ? cookie.parse(cookiesHeader) : {};
  const token = cookies.token;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = verifyToken(token);
    const admin = await prisma.user.findUnique({
      where: { id: decoded.user_token, role: "ADMIN" },
    });
    if (!admin || admin.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }
    (req as any).user_token = decoded.user_token;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
};
