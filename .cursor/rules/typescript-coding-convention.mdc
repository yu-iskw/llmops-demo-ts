---
alwaysApply: true
---

# TypeScript Style Guide

This guide outlines the default-standard coding conventions for TypeScript, based on the Google TypeScript Style Guide, supplemented with best practices from other widely-used TypeScript style guides.

## 1. Syntax

### 1.1. Identifiers

Identifiers must use only ASCII letters, digits, underscores (for constants and structured test method names), and the '$' sign.

| Style          | Category                                                           |
| -------------- | ------------------------------------------------------------------ |
| `UpperCamelCase` | class / interface / type / enum / decorator / type / parameters    |
| `lowerCamelCase` | variable / parameter / function / method / property / module alias |
| `CONSTANT_CASE` | global constant values, including enum values                      |

* **Abbreviations**: Treat abbreviations like acronyms as whole words (e.g., `loadHttpUrl`, not `loadHTTPURL`).
* **Dollar sign**: Avoid using `$` in identifiers, except when aligning with third-party framework conventions (e.g., `jquery`).
* **Type parameters**: May use a single upper case character (`T`) or `UpperCamelCase`.
* **Test names**: Test method names may be structured with `_` separators (e.g., `testX_whenY_doesZ()`).
* **`_` prefix/suffix**: Do not use `_` as a prefix or suffix, or as an identifier by itself.

### 1.2. Aliases

When aliasing an existing symbol, use the format of the existing identifier. For variables, use `const`, and for class fields, use `readonly`.

### 1.3. Naming Style

Names should not be decorated with information already included in the type.

* Do not use trailing or leading underscores for private properties or methods.
* Do not use the `opt_` prefix for optional parameters.
* Do not prefix interfaces with `I` (e.g., `IUser` should be `User`).
* Prefix booleans with `is` or `has` for clarity (e.g., `isLoggedIn`, `hasPermission`).

### 1.4. File Encoding

For non-ASCII characters, use the actual Unicode character (e.g., `∞`). For non-printable characters, the equivalent hex or Unicode escapes (e.g., `\u221e`) can be used along with an explanatory comment.

```ts
// Perfectly clear, even without a comment.
const units = "μs";

// Use escapes for non-printable characters.
const output = "\ufeff" + content; // byte order mark
```

### 1.5. Source Code Formatting

Follow consistent formatting, typically enforced by automated formatters (e.g., Prettier, `trunk fmt`).

* **Indentation**: Use 2 spaces for indentation.
* **Line Length**: Aim for 100 characters, but allow flexibility for readability.
* **Whitespace**: Use spaces around operators, after colons and semicolons, and before open braces for clarity.
* **Brace Style**: Use 1TBS (the one true brace style) where the opening brace is on the same line.
* **Quotes**: Prefer single quotes (`'`) unless escaping.

### 1.6. Comments & Documentation

* **JSDoc vs Comments**: Use `/** JSDoc */` for documentation (for users of the code) and `// line comments` or `/* block comments */` for implementation details (for developers working on the code itself).
* **JSDoc Rules**: Generally follow JavaScript style guide rules for JSDoc. Omit comments that are redundant with TypeScript types.
* **Documentation Scope**: Document all top-level exports of modules. Document properties and methods (exported/public or not) whose purpose is not immediately obvious.
* **Adding Information**: Make comments that add actual information, avoiding mere restatement of names or types.
* **Parameter Property Comments**: Use `@param` JSDoc annotation to document parameter properties in constructors.
* **Call Site Comments**: If needed, document parameters at call sites inline using block comments (e.g., `new Foo(/* arg1= */ value)`).
* **Placement**: Place documentation prior to decorators (JSDoc block should come before the `@Decorator`).
* **Avoid `@override`**: Do not use `@override` in TypeScript source code.

## 2. Language Rules

### 2.1. Visibility

* **Limiting Visibility**: Limit symbol visibility as much as possible.
* **`private` vs `#private`**: Prefer `private` for class members intended to be internal. Avoid `#private` fields due to emit size and performance regressions.
* **`public` Modifier**: Never use the `public` modifier explicitly, except when declaring non-readonly public parameter properties in constructors, as TypeScript symbols are public by default.
* **Properties outside lexical scope**: For properties used outside the lexical scope of their containing class (e.g., in templates), prefer `public` visibility. `protected` may also be used as needed.

### 2.2. Constructors

* **Parentheses**: Constructor calls must use parentheses, even when no arguments are passed (e.g., `new Foo()`).
* **Unnecessary Constructors**: It is unnecessary to provide an empty constructor or one that simply delegates to its parent class. Constructors with parameter properties, modifiers, or parameter decorators should not be omitted.
* **Conciseness**: Keep constructors concise; delegate complex logic to methods.

### 2.3. Class Members

* **`readonly`**: Mark properties that are never reassigned outside of the constructor with the `readonly` modifier.
* **Parameter properties**: Use parameter properties (e.g., `constructor(private readonly myService: MyService)`) for concise declarations instead of manually assigning parameters to class fields.
* **Field initializers**: If a class member is not a parameter, initialize it where it's declared, which can sometimes remove the need for a constructor.
* **Getters and Setters**: May be used. The getter method must be a pure function. Accessors can restrict visibility of internal details. Avoid "pass-through" accessors; make the property public instead.

### 2.4. Primitive Types & Wrapper Classes

* Always use the lowercase primitive types: `string`, `boolean`, `number`, `symbol`, `bigint`. Never use `String`, `Boolean`, `Number`, `Symbol`, `BigInt`, or `Object` (use `{}` or `object` instead).
* Never invoke wrapper types as constructors (e.g., `new Number(5)`).

### 2.5. Array Constructor

TypeScript code must not use the `Array()` constructor, with or without `new`. Always use bracket notation to initialize arrays (e.g., `[1, 2, 3]`), or `Array.from()` to initialize an array with a specific size.

### 2.6. Type Coercion

* Avoid implicit type coercion. Use explicit conversions when necessary.
* Use `String()` and `Boolean()` functions, string template literals, or `!!` to coerce types.
* Use `Number()` to parse numeric values and explicitly check for `NaN` unless parsing is guaranteed to succeed.
* Do not use unary plus (`+`) to coerce strings to numbers.
* Do not use `parseInt` or `parseFloat` to parse numbers, except for non-base-10 strings, and always validate input before using them.

### 2.7. Variables

* Always use `const` or `let` to declare variables. Use `const` by default, unless a variable needs to be reassigned. Never use `var`.
* `const` and `let` are block-scoped, which helps avoid common JavaScript bugs associated with `var`'s function scoping.

### 2.8. Exceptions

* Use `try-catch` blocks for error handling. Throw `Error` instances or custom error classes.

### 2.9. Iterating Objects/Containers

* Use `for...of` for iterating over arrays and other iterable objects.
* Use `for...in` for iterating over object keys, but be cautious of inherited properties.
* Prefer array methods (`map`, `filter`, `reduce`) over manual loops.

### 2.10. Spread Operator

Use the spread operator (`...`) for array and object cloning/merging.

### 2.11. Control Flow Statements & Blocks

Always use curly braces `{}` for `if`, `for`, `while`, `do-while` statements, even for single-line bodies.

### 2.12. Switch Statements

* Always include a `default` case.
* Use `break` for non-fall-through cases.

### 2.13. Equality Checks

* Use strict equality operators (`===` and `!==`) instead of loose ones (`==` and `!=`).
* Exception: `obj == null` is allowed to check for `null || undefined`.

### 2.14. Function Declarations & Expressions

* **Arrow functions**: Prefer arrow functions for anonymous functions and when `this` context binding is important.
* **Expression bodies**: Use expression bodies for arrow functions when appropriate for conciseness.

### 2.15. Automatic Semicolon Insertion

Always use semicolons `;` explicitly.

### 2.16. `@ts-ignore` and `@ts-expect-error`

* Avoid `@ts-ignore`.
* When a TypeScript error cannot be mitigated, use `@ts-expect-error` as a last resort to suppress it. Always use `@ts-expect-error` with a clear description explaining why it is necessary.

### 2.17. Type and Non-nullability Assertions

* Type assertions (`as Type`) and non-nullability assertions (`!`) are unsafe and should be used sparingly, only when absolutely certain of the type, or as an exception (e.g., third-party library type mismatches, dereferencing `unknown`) with strong rationale.
* Prefer type guards over assertions for safer type narrowing.

### 2.18. Decorators

Place documentation comments (`JSDoc`) *before* decorators.

## 3. Source Organization

### 3.1. Modules

* Use ES modules (`import`/`export`) consistently.
* **Import Paths**: Use relative paths for files within the same project. Avoid deep nesting.
* Avoid TypeScript `namespace` keyword.

### 3.2. Exports

* Prefer named exports over default exports for better traceability and refactoring.
* Avoid mutable exports.

### 3.3. Imports

* **Module vs. Destructuring**: Use destructuring imports for specific members.
* **Renaming**: Rename imports to avoid naming conflicts if necessary.
* `import type`: Use `import type` for importing only types to ensure they are erased at compile time. This improves tree-shaking and minimizes dependencies.
* Avoid wildcard (`*`) imports as they can increase bundle size and prevent effective tree-shaking.

### 3.4. Organize By Feature

Structure your project by feature or domain, encapsulating related components, models, services, and routes within their own directories.

### 3.5. File Naming

* Name files with `camelCase` (e.g., `utils.ts`, `map.ts`).
* When a file exports a component for a framework (e.g., React) that requires `PascalCase` for components, use `PascalCase` for the filename to match (e.g., `Accordion.tsx`, `MyControl.tsx`).
* **Test files**: Use `.test.ts` or `.spec.ts` suffix for unit test files (e.g., `utils.test.ts`, `userService.spec.ts`).

## 4. Type System

### 4.1. Type Inference

Allow TypeScript to infer types when clear. Explicitly type when inference is ambiguous or for API boundaries, or when narrowing a type (e.g., `useState<UserRole>('admin')`).

### 4.2. Data Immutability

Immutability should be a key principle. Wherever possible, data should remain immutable by leveraging types like `Readonly` and `ReadonlyArray`. When performing data processing, always return new arrays, objects, or other reference-based data structures.

### 4.3. Required & Optional Object Properties

Strive to have the majority of object properties required and use optional properties sparingly. If many optional properties are unavoidable, utilize discriminated union types.

### 4.4. Discriminated Unions

Embrace discriminated unions to model complex data structures and improve type safety. They remove optional object properties, enable exhaustiveness checks (e.g., in `switch` statements), avoid flag variables, and improve code clarity.

### 4.5. Type-Safe Constants With Satisfies

Use the `as const satisfies` syntax to combine strict type-checking and immutability for constants, ensuring they conform to a specific type while preserving narrowed inferred types.

### 4.6. Template Literal Types

Embrace template literal types to create precise and type-safe string constructs (e.g., for versioning, API endpoints, internationalization keys, CSS utilities, database queries), providing better type safety and autocompletion.

### 4.7. `any` Type and `unknown` Type

`any` type must not be used as it bypasses type checking and can mask errors. When dealing with ambiguous data types, use `unknown`, which is the type-safe counterpart of `any`. Narrow the type of `unknown` values using type guards or type assertions before using them.

### 4.8. Null vs. Undefined

* Prefer `undefined` in general for explicit unavailability or missing values. Use `null` where it's part of an external API or conventional (e.g., Node.js callbacks).
* Use truthy checks for objects being `null` or `undefined` (e.g., `if (error)`).
* Use `== null` or `!= null` (not `===` or `!==`) to check for both `null` and `undefined` on primitives.

### 4.9. Interfaces vs. Type Aliases

* Prefer `interface` for declaring object shapes due to their extendability. Use `type` for unions, intersections, mapped types, and primitive aliases.
* When performing declaration merging (e.g., extending third-party library types), use `interface`.

### 4.10. Array Types

Define array types using generic syntax (e.g., `Array<string>` or `ReadonlyArray<string>`) instead of `string[]`.

### 4.11. Return Type Only Generics

Avoid creating APIs that have return type only generics. Always explicitly specify generics when working with existing APIs that have them.

### 4.12. Services & Types Generation

For external services (e.g., REST, GraphQL, MQ), generate types from their contracts (Swagger, schemas). Avoid manually declaring and maintaining types, as they can easily fall out of sync.

## 5. Functions

### 5.1. General Principles

Functions should:

* Have a single responsibility.
* Be stateless, where the same input arguments return the same value every time (pure functions).
* Prefer to accept at least one argument and return data.
* Not have side effects (pure), or if they do, clearly separate business logic from infrastructure concerns.

### 5.2. Single Object Argument

To keep functions readable and easily extensible, strive to use a single object as the function argument instead of multiple positional arguments. Exceptions include simple functions with a single primitive argument or when implementing currying.

### 5.3. Required & Optional Arguments

Strive to have the majority of arguments required and use optional arguments sparingly. If a function becomes too complex with many optional arguments, it should likely be broken into smaller, more focused functions.

### 5.4. Arguments as Discriminated Type

When applicable, use discriminated union types for function arguments to eliminate optional properties, reducing complexity and ensuring that only required properties are passed depending on the use case.

### 5.5. Return Types

Requiring explicit return types improves safety, catches errors early, and helps with long-term maintainability. As a rule of thumb, be explicit on the outside (API boundaries) and implicit on the inside (within private implementation details).

## 6. Consistency

For any style question not definitively covered by this guide, be consistent with existing code in the same file or directory. If that doesn't resolve the question, consider emulating other files in the same directory.
