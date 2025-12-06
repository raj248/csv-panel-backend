import express, { Router } from "express";
import { comparePassword, generateToken, hashPassword } from "../utils/auth";
import * as cookie from "cookie";
import { verifyAdmin, verifyUser } from "../middleware/auth.middleware";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router: Router = express.Router();

// -------------------- LOGIN --------------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await comparePassword(password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = generateToken(user.id.toLocaleString());

  res.setHeader(
    "Set-Cookie",
    cookie.serialize("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })
  );

  return res.json({ success: true });
});

// -------------------- CHECK USER SESSION --------------------
router.get("/check", verifyUser, async (req, res) => {
  const userId = (req as any).user_token;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (user.role === "ADMIN") {
    return res.json({ success: true, data: { isUser: true, isAdmin: true } });
  }

  return res.json({ success: true, data: { isUser: true, isAdmin: false } });
});

// -------------------- LOGOUT --------------------
router.post("/logout", (req, res) => {
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      expires: new Date(0), // expire immediately
    })
  );

  return res.json({ success: true });
});

// new user creation
router.post("/create-user", verifyAdmin, async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res
      .status(409)
      .json({ error: "User with this email already exists" });
  }

  const hashedPassword = await hashPassword(password);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  return res.status(201).json({ success: true, data: { adminId: newUser.id } });
});

// reset user password to 1234567890
router.post("/reset-password", verifyAdmin, async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const newHashedPassword = await hashPassword("1234567890");

  await prisma.user.update({
    where: { email },
    data: { password: newHashedPassword },
  });

  return res
    .status(200)
    .json({ success: true, message: "Password reset to 1234567890" });
});

// update a user password
router.post("/update-password", verifyUser, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .json({ error: "Old password and new password are required" });
  }

  const userId = (req as any).user_token;
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !(await comparePassword(oldPassword, user.password))) {
    return res.status(401).json({ error: "Invalid old password" });
  }

  const newHashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { password: newHashedPassword },
  });

  return res
    .status(200)
    .json({ success: true, message: "Password updated successfully" });
});

// delete a user
router.delete("/delete-user/:id", verifyAdmin, async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({ where: { id: id } });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  await prisma.user.delete({ where: { id: id } });

  return res
    .status(200)
    .json({ success: true, message: "User deleted successfully" });
});

// get all users
router.get("/users", verifyAdmin, async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return res.status(200).json({ success: true, data: users });
});

// update user role
router.put("/update-role/:id", verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role || (role !== "ADMIN" && role !== "USER")) {
    return res.status(400).json({ error: "Invalid role provided" });
  }

  const user = await prisma.user.findUnique({ where: { id: id } });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const updatedUser = await prisma.user.update({
    where: { id: id },
    data: { role },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return res.status(200).json({ success: true, data: updatedUser });
});

export default router;
