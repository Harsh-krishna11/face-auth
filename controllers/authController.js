import { log } from "@tensorflow/tfjs";
import User from "../models/User.js";
import { getFaceEmbedding } from "../utils/faceUtils.js";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { username, email } = req.body;
    console.log("user registering : ", req.file);
    console.log("user details : ", req.body);

    // Check if photo is uploaded
    const imageUrl = req.file?.path; // safe navigation
    if (!imageUrl) {
      return res
        .status(400)
        .json({ error: "Photo upload failed", success: false });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(401).json({
        error: "User already registered with this email",
        success: false,
      });
    }

    // Generate face embedding
    const embedding = await getFaceEmbedding(imageUrl);
    console.log("Face embedding generated:", embedding);

    // Create new user
    const user = new User({
      username,
      email,
      faceEmbedding: embedding,
      photoUrl: imageUrl,
    });

    await user.save();

    res.json({
      message: "User registered successfully!",
      user,
      success: true,
    });
  } catch (err) {
    console.error("Error in register:", err);
    res.status(400).json({ error: err.message, success: false });
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
    console.log("embedding : ", embedding);

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
    console.log("embedding login : ", embedding);

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

// import User from "../models/User.js";
// import { getFaceEmbedding } from "../utils/faceUtils.js";
// import jwt from "jsonwebtoken";

// export const register = async (req, res) => {
//   try {
//     const { username, email } = req.body;
//     const imagePath = req.file?.path;
//     if (!imagePath)
//       return res.status(400).json({ error: "Photo upload failed" });

//     const embedding = await getFaceEmbedding(imagePath);

//     const user = new User({
//       username,
//       email,
//       faceEmbedding: embedding,
//       photoUrl: imagePath,
//     });

//     await user.save();

//     res.json({ message: "User registered successfully!", user });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

// export const login = async (req, res) => {
//   try {
//     const imagePath = req.file?.path;
//     if (!imagePath)
//       return res.status(400).json({ error: "Photo upload failed" });

//     const embedding = await getFaceEmbedding(imagePath);

//     const users = await User.find();
//     const matchedUser = users.find((user) => {
//       const distance = Math.sqrt(
//         user.faceEmbedding.reduce(
//           (acc, val, i) => acc + (val - embedding[i]) ** 2,
//           0
//         )
//       );
//       return distance < 0.6;
//     });

//     if (!matchedUser)
//       return res.status(401).json({ error: "Face not recognized" });

//     const token = jwt.sign({ id: matchedUser._id }, process.env.JWT_SECRET, {
//       expiresIn: "1h",
//     });

//     res.json({ message: "Login successful", token, user: matchedUser });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };
