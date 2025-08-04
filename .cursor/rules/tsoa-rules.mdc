---
alwaysApply: true
---
# TSOA Development Best Practices

This document outlines comprehensive guidelines and best practices for developing Node.js server-side applications with tsoa, focusing on TypeScript for type safety and OpenAPI specification generation.

## 1. Introduction to tsoa

- tsoa is a framework that integrates an OpenAPI compiler to build type-safe Node.js applications using TypeScript.
- It generates OpenAPI (Swagger) specifications and routes from your TypeScript controllers and models, ensuring type-safe by default and seamless runtime validation.
- **Philosophy**:
  - Rely on TypeScript type annotations for API metadata.
  - Use decorators for metadata not expressible via type annotations.
  - Utilize JSDoc for pure text metadata (e.g., endpoint descriptions).
  - Minimize boilerplate code.
  - Models should primarily be interfaces (pure data structures), but classes are also supported.

## 2. Project Setup and Configuration

### `tsoa.json` Configuration

- Configure `entryFile` to point to your application's entry point (e.g., `src/app.ts` or `src/index.ts`).
- Use `controllerPathGlobs` to specify where tsoa should look for controllers (e.g., `"src/**/*Controller.ts"`).
- Set `noImplicitAdditionalProperties` to `"throw-on-extras"` for strict validation, rejecting undeclared properties in incoming requests. Other options are `"ignore"` or `"silently-remove-extras"`.
- Define `spec.outputDirectory` and `routes.routesDir` for generated OpenAPI specifications and route files.
- Set `spec.specVersion` to `3` for OpenAPI v3 specifications.

```json
// tsoa.json
{
  "entryFile": "src/app.ts",
  "noImplicitAdditionalProperties": "throw-on-extras",
  "controllerPathGlobs": ["src/**/*Controller.ts"],
  "spec": {
    "outputDirectory": "build",
    "specVersion": 3
  },
  "routes": {
    "routesDir": "build"
  }
}
```

### `tsconfig.json` Recommendations

- Ensure `experimentalDecorators` is `true`.
- Use strict type-checking options like `strict`, `noImplicitAny`, `strictNullChecks`, `noUnusedLocals`, and `noUnusedParameters`.

```jsonc
// tsconfig.json (excerpt)
{
  "compilerOptions": {
    "target": "es6",
    "module": "commonjs",
    "outDir": "build",
    "strict": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "forceConsistentCasingInFileNames": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

## 3. Defining Models and Services

### Models (Interfaces)

- Define your data structures using TypeScript interfaces. These will be used to generate OpenAPI definitions.

```typescript
// src/models/User.ts
export interface User {
  id: number;
  email: string;
  name: string;
  status?: "Happy" | "Sad";
  phoneNumbers: string[];
}
```

### Services

- Separate business logic into services. Controllers should be thin, primarily handling request/response and delegating to services.

```typescript
// src/services/UsersService.ts
import { User } from "../models/User";

export type UserCreationParams = Pick<User, "email" | "name" | "phoneNumbers">;

export class UsersService {
  public get(id: number, name?: string): User {
    // ... logic to fetch user ...
    return { id, email: "jane@doe.com", name: name ?? "Jane Doe", status: "Happy", phoneNumbers: [] };
  }

  public create(userCreationParams: UserCreationParams): User {
    // ... logic to create user ...
    return { id: Math.floor(Math.random() * 10000), status: "Happy", ...userCreationParams };
  }
}
```

## 4. Controller Definition

### Basic Structure

- Use `@Route("path")` on the class to define the base path for all endpoints within the controller.
- Methods within the class map to HTTP methods using `@Get()`, `@Post()`, `@Put()`, `@Delete()`, etc.
- Always use named exports for controller classes (`export class C`). Default exports are not supported.

```typescript
// src/controllers/UsersController.ts
import { Body, Controller, Get, Path, Post, Query, Route, SuccessResponse, Response as TsoaResponse, Res } from "tsoa";
import { User } from "../models/User";
import { UsersService, UserCreationParams } from "../services/UsersService";

interface ValidateErrorJSON {
  message: "Validation failed";
  details: { [name: string]: unknown };
}

@Route("users")
export class UsersController extends Controller {
  /**
   * Retrieves a user by ID.
   * @param userId The ID of the user to retrieve.
   * @param name Optional name to filter by.
   */
  @Get("{userId}")
  public async getUser(
    @Path() userId: number,
    @Query() name?: string
  ): Promise<User> {
    return new UsersService().get(userId, name);
  }

  /**
   * Creates a new user.
   * @param requestBody The user creation parameters.
   */
  @SuccessResponse("201", "Created") // Custom success response
  @Response<ValidateErrorJSON>(422, "Validation Failed")
  @Post()
  public async createUser(
    @Body() requestBody: UserCreationParams
  ): Promise<void> {
    this.setStatus(201); // Set HTTP status code
    new UsersService().create(requestBody);
    return;
  }

  /**
   * Greets a user or returns a 404 if no name is provided.
   * @param name The name to greet.
   * @param notFoundResponse A responder function for 404 responses.
   */
  @Get("greet")
  public async greet(@Query() name?: string, @Res() notFoundResponse: TsoaResponse<404, { reason: string }>): Promise<string> {
    if (!name) {
      return notFoundResponse(404, { reason: "Name not provided." });
    }
    return `Hello, ${name}`;
  }
}
```

### Decorators

- `@Path()`: For parameters in the URL path (e.g., `/users/{userId}`).
- `@Query()`: For query parameters (e.g., `/users?name=John`).
- `@Body()`: For the entire request body.
- `@BodyProp()`: For individual properties within the request body.
- `@Header()`: For reading request headers.
- `@SuccessResponse(statusCode, description)`: Defines a custom success response code and description for OpenAPI documentation.
- `@Response<T>(statusCode, description)`: Explicitly defines an error response type for OpenAPI documentation. Use this for non-success responses.
- `@Res()`: Injects a framework-agnostic responder function for custom responses (tsoa >= 3.1).

## 5. Error Handling

### Global Error Handler for Validation Errors

- Implement a global Express error handler after `RegisterRoutes(app)` in your main application file (`app.ts` or `index.ts`) to catch `ValidateError` and return formatted JSON responses.

```typescript
// app.ts (excerpt)
import express, { Response as ExResponse, Request as ExRequest, NextFunction } from "express";
import { ValidateError } from "tsoa";
import { RegisterRoutes } from "../build/routes";

export const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

RegisterRoutes(app);

app.use(function notFoundHandler(_req, res: ExResponse) {
  res.status(404).send({
    message: "Not Found",
  });
});

app.use(function errorHandler(
  err: unknown,
  req: ExRequest,
  res: ExResponse,
  next: NextFunction
): ExResponse | void {
  if (err instanceof ValidateError) {
    console.warn(`Caught Validation Error for ${req.path}:`, err.fields);
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
```

### Handling Missing Routes

- Add a "catch-all" route handler before your main error handler to return a 404 for unhandled routes.

## 6. Build and Development

### Generating Routes and OpenAPI Spec

- Use the `tsoa spec-and-routes` command to generate both the OpenAPI specification and the routes file.
- Add scripts to `package.json` for easy execution:

```json
// package.json (excerpt)
{
  "scripts": {
    "build": "tsoa spec-and-routes && tsc",
    "start": "node build/src/server.js",
    "dev": "nodemon --watch src --exec \"npm run build && npm start\"" // Example for development with nodemon
  }
}
```

### Dependency Management (pnpm)

- When using `pnpm`, explicitly add `@tsoa/runtime` as a dependency because of pnpm's symlinked `node_modules` structure:
  `pnpm add @tsoa/runtime`

## 7. Folder Structure

- Organize your code into logical directories:
  - `src/controllers/`: For tsoa controllers.
  - `src/services/`: For business logic.
  - `src/models/`: For TypeScript interfaces/types defining your data models.
  - `src/utils/` or `src/helpers/`: For utility functions and helper modules that are shared across different parts of the application.
  - `src/middleware/`: For Express middleware functions.
  - `src/routes/`: (Generated) For the tsoa-generated routes file.
  - `src/spec/`: (Generated) For the tsoa-generated OpenAPI specification file (e.g., `swagger.json`).
  - `src/config/`: For application configurations and environment-specific settings.

Example Structure:

```typescript
src/
├── app.ts                 # Main application setup (Express, middleware, error handlers)
├── server.ts              # Server bootstrap
├── config/                # Configuration files
│   └── index.ts
├── controllers/           # TSOA controllers defining API endpoints
│   └── UsersController.ts
├── models/                # TypeScript interfaces/types for data structures
│   └── User.ts
├── services/              # Business logic and data access
│   └── UsersService.ts
├── middleware/            # Custom Express middleware
│   └── authMiddleware.ts
├── utils/                 # Utility functions and helpers
│   └── validation.ts
└── types/                 # Custom type definitions
    └── express.d.ts
```
