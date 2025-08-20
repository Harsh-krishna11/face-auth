import * as faceapi from "face-api.js";
import canvas from "canvas";
import path from "path";
import { fileURLToPath } from "url";

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODEL_URL = path.join(__dirname, "..", "models");

export async function loadModels() {
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL);
}

export async function getFaceEmbedding(imageUrl) {
  const img = await canvas.loadImage(imageUrl);
  const detection = await faceapi
    .detectSingleFace(img)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) throw new Error("No face detected");

  return Array.from(detection.descriptor);
}
