import express from "express";
import cors from "cors";
import "dotenv/config";
import { RegisterRoutes } from "../src/generated/routes/routes";
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
app.get("/health", (_request, response) => {
  response.status(200).json({ status: "ok" });
});

RegisterRoutes(app);

app.use(function notFoundHandler(_request, response: express.Response) {
  response.status(404).send({
    message: "Not Found",
  });
});

app.use(function errorHandler(
  error: unknown,
  request: express.Request,
  response: express.Response,
  next: express.NextFunction,
): express.Response | void {
  if (error instanceof ValidateError) {
    console.warn(
      "Caught Validation Error for",
      request.path,
      ":",
      error.fields,
    );
    return response.status(422).json({
      message: "Validation Failed",
      details: error?.fields,
    });
  }
  if (error instanceof Error) {
    return response.status(500).json({
      message: "Internal Server Error",
    });
  }
  next();
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
