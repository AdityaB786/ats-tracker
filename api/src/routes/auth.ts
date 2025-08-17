import { Router, Request, Response } from "express";
import User, { IUserDocument } from "../models/User";
import { generateToken } from "../utils/auth";
import { registerSchema, loginSchema } from "../utils/validators";

const router = Router();

// Register new user
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      res.status(409).json({ error: "User already exists with this email" });
      return;
    }

    // Create new user
    const user: IUserDocument = new User({
      ...validatedData,
      passwordHash: validatedData.password,
    }) as IUserDocument;

    await user.save();

    res.status(201).json({
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      res
        .status(400)
        .json({ error: "Validation error", details: error.errors });
      return;
    }
    res.status(500).json({ error: "Failed to register user" });
  }
});

// Login user
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = loginSchema.parse(req.body);

    // Find user by email
    const user = (await User.findOne({
      email: validatedData.email,
    })) as IUserDocument | null;

    if (!user) {
      res.status(404).json({ error: "User with this email does not exist" });
      return;
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(validatedData.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid password" });
      return;
    }

    // Generate JWT token
    const token = generateToken(user._id.toString(), user.role);

    // Set HttpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      token,
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      res
        .status(400)
        .json({ error: "Validation error", details: error.errors });
      return;
    }
    res.status(500).json({ error: "Failed to login" });
  }
});

// Logout user
router.post("/logout", (req: Request, res: Response): void => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

export default router;
