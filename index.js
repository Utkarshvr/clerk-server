import express from "express";
import jwt from "jsonwebtoken";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import connectToDB from "./utils/connectToDB.js";
import User from "./User.js";
import isAuthByClerk from "./middlewares/isAuthByClerk.js";
import isAuthByJWT from "./middlewares/isAuthByJWT.js";

const app = express();
connectToDB();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.get("/", (req, res) => {
  res.json("WORKING ✅");
});

const jwtSecretkey = process.env.JWT_SECRET_KEY;

app.post("/auth/login", isAuthByClerk, async (req, res) => {
  const user = req.user;
  const { username, email, picture, clerkID } = req.body;
  console.log({ user, body: req.body });
  // Check if the user who is trying to store user is the same

  if (!user) return res.status(400).json({ msg: "User is not present" });

  if (clerkID !== user?.sub)
    return res
      .status(403)
      .json({ msg: "You are trying to save some other user. BADDD🚩" });

  const existingUser = await User.findOne({ clerkID: user?.sub, email }).lean();

  if (existingUser) {
    const jwtToken = jwt.sign({ user: existingUser }, jwtSecretkey);

    // TODO: Send cookie too, and handle cookies for website, and headers for mobile
    return res
      .status(200)
      .json({ user: existingUser, msg: "Logged in", jwtToken });
  }

  // Create
  const newUser = await User.create({ clerkID, username, email, picture });
  const jwtToken = jwt.sign({ user: newUser }, jwtSecretkey);

  return res.status(201).json({ user: newUser, msg: "Signed up", jwtToken });
});

app.get("/my-profile", isAuthByClerk, isAuthByJWT, (req, res) => {
  const profile = req.userDB;
  if (!profile) return res.status(404).json({ msg: " Profile not found " });
  return res.status(200).json({ profile });
});

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");

  app.listen(5000, () => {
    console.log("Listening on Port: 5000 👂");
  });
});

mongoose.connection.on("error", (err) => {
  console.log(err);
});
