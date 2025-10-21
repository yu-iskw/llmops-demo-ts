import express from "express";
import cors from "cors";
import "dotenv/config";
import { RegisterRoutes } from "./generated/routes/routes";
import { ValidateError } from "tsoa";
import path, { dirname } from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

// Initialize the GoogleGenAI client
// getGenAI();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

RegisterRoutes(app);

app.use(function notFoundHandler(_req, res: express.Response) {
  res.status(404).send({
    message: "Not Found",
  });
});

app.use(function errorHandler(
  err: unknown,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
): express.Response | void {
  if (err instanceof ValidateError) {
    console.warn("Caught Validation Error for", req.path, ":", err.fields);
    return res.status(422).json({
      message: "Validation Failed",
      details: err?.fields,
    });
  }
  if (err instanceof Error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
  next();
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
