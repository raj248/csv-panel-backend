import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET!; // add to .env

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hashed: string) => {
  return await bcrypt.compare(password, hashed);
};

export const generateToken = (user_token: string) => {
  console.log("user_token", user_token);
  console.log("JWT_SECRET", JWT_SECRET);
  return jwt.sign({ user_token }, JWT_SECRET, { expiresIn: "1d" });
};

export const verifyToken = (token: string) => {
  // console.log("token", token);
  // console.log("JWT_SECRET", JWT_SECRET);
  return jwt.verify(token, JWT_SECRET as string) as { user_token: string };
};
