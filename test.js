import path from "path";
import { fileURLToPath } from "url";
import { loadModels, getFaceEmbedding } from "./utils/faceUtils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  try {
    console.log("Loading models...");
    await loadModels();
    console.log("Models loaded successfully!");

    const imagePath = path.join(__dirname, "test.jpg"); // your test image
    const embedding = await getFaceEmbedding(imagePath);

    console.log("Face embedding (length 128):", embedding);
    console.log("✅ Test completed successfully!");
  } catch (err) {
    console.error("Error:", err);
  }
})();
