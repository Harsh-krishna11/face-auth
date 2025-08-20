import User from "../models/User.js";
import { getFaceEmbedding } from "../utils/faceUtils.js";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { username, email } = req.body;
    // console.log("File received:", req.file);

    const imageUrl = req.file.path; // use path instead of secure_url
    if (!imageUrl)
      return res.status(400).json({ error: "Photo upload failed" });

    const embedding = await getFaceEmbedding(imageUrl);

    const user = new User({
      username,
      email,
      faceEmbedding: embedding,
      photoUrl: imageUrl,
    });

    await user.save();

    res.json({ message: "User registered successfully!", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    console.log("File received:", req.file);

    const imageUrl = req.file?.path;
    if (!imageUrl)
      return res.status(400).json({ error: "Photo upload failed" });
    const embedding = await getFaceEmbedding(imageUrl);

    const users = await User.find();

    const matchedUser = users.find((user) => {
      const distance = Math.sqrt(
        user.faceEmbedding.reduce(
          (acc, val, i) => acc + (val - embedding[i]) ** 2,
          0
        )
      );
      return distance < 0.6;
    });

    if (!matchedUser) {
      return res.status(401).json({ error: "Face not recognized" });
    }

    const token = jwt.sign({ id: matchedUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ message: "Login successful", token, user: matchedUser });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// In authController.js

export const registerEmbedding = async (req, res) => {
  try {
    const { username, email, embedding } = req.body;
    if (!embedding)
      return res.status(400).json({ error: "No embedding provided" });

    const user = new User({ username, email, faceEmbedding: embedding });
    await user.save();

    res.json({ message: "Registered successfully!" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const loginEmbedding = async (req, res) => {
  try {
    const { embedding } = req.body;
    if (!embedding)
      return res.status(400).json({ error: "No embedding provided" });

    const users = await User.find();
    const matchedUser = users.find((user) => {
      const distance = Math.sqrt(
        user.faceEmbedding.reduce(
          (acc, val, i) => acc + (val - embedding[i]) ** 2,
          0
        )
      );
      return distance < 0.6;
    });

    if (!matchedUser)
      return res.status(401).json({ error: "Face not recognized" });

    const token = jwt.sign({ id: matchedUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ message: "Login successful", token, user: matchedUser });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
