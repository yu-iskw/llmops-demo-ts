---
alwaysApply: true
---
# Vue.js Development Guidelines

You are an expert in JavaScript, TypeScript, and the Vue.js framework for scalable web development.

## Key Principles

- Write concise, technical responses with accurate Vue.js examples.
- Leverage Vue.js reactivity system effectively.
- Prioritize performance optimization and minimal JavaScript for optimal user experience.
- Use descriptive variable names and follow Vue.js naming conventions.
- Organize files logically, typically by feature or component type.

## Project Structure

- Use the recommended Vue CLI or Vite project structure.
- Organize components into `components/` for reusable UI elements.
- Organize views/pages into `views/` or `pages/` for route-specific components.
- Organize utility files into `utils/` or `helpers/`.
- Organize state management related files into `store/` or `stores/`.

### Recommended Modular Project Structure

For larger and more complex Vue.js applications, a modular monolithic architecture is highly recommended. This approach encapsulates each feature or domain, enhancing maintainability and scalability.

```bash
src/
├── app.ts                 # Main application setup (Express, middleware, error handlers)
├── main.ts                # Main entry point for Vue application
├── router.ts              # Global Vue Router configuration
├── store.ts               # Global Pinia/Vuex store configuration
├── assets/                # Static assets like images, fonts, global styles
│   └── images/
│   └── styles/
├── core/                  # Common components, services, and utilities used across the application
│   ├── components/        # Base or common UI components (e.g., BaseButton.vue)
│   ├── models/            # Core TypeScript interfaces/types for global entities
│   ├── store/             # Global or shared Pinia/Vuex modules
│   ├── services/          # Common business logic services
│   ├── views/             # Common layout components (e.g., DefaultLayout.vue)
│   └── utils/             # Common utility functions
├── modules/               # Feature-specific modules, each self-contained
│   ├── checkout/          # Example feature module (e.g., for e-commerce checkout)
│   │   ├── components/    # Components specific to the checkout module
│   │   ├── models/        # TypeScript interfaces/types for checkout entities
│   │   ├── store/         # Pinia/Vuex store specific to checkout
│   │   ├── services/      # Business logic services for checkout
│   │   ├── views/         # Routed components (pages) for checkout
│   │   └── routes.ts      # Route definitions for the checkout module
│   ├── user/              # Example user management module
│   │   ├── components/
│   │   ├── models/
│   │   ├── store/
│   │   ├── services/
│   │   ├── views/
│   │   └── routes.ts
│   └── ...
├── plugins/               # Vue plugins
├── types/                 # Custom global type definitions
├── tests/                 # Unit and integration tests
└── scss/                  # Global SCSS files
```

**Explanation of Directories:**

- `src/`: The root directory for all source code.
  - `main.ts`: The main entry point of your Vue application.
  - `router.ts`: Where your Vue Router instance and global routes are defined.
  - `store.ts`: Where your global Pinia or Vuex store is initialized.
  - `assets/`: Contains static assets like images, fonts, and global stylesheets.
  - `core/`: Houses components, services, models, and utilities that are common and shared across the entire application.
    - `components/`: For "Base" or "common" UI components that apply app-specific styling and conventions, often prefixed with `Base` (e.g., `BaseButton.vue`).
    - `models/`: TypeScript interfaces/classes for global entities used throughout the application.
    - `store/`: Global or shared Pinia/Vuex modules.
    - `services/`: TypeScript classes or simple JS object exports for common business logic.
    - `views/`: Used to store common layout components (e.g., `DefaultLayout.vue`).
    - `utils/`: Contains general utility functions and helper modules.
  - `modules/`: Contains separate, self-contained feature modules. Each module should encapsulate its own components, models, store, services, and routes. This promotes loose coupling and independent development.
    - `components/`: Components that belong specifically to the module.
    - `models/`: TypeScript interfaces/classes mapping entities specific to the module.
    - `store/`: Pinia/Vuex store modules specific to the feature.
    - `services/`: Business logic services specific to the module.
    - `views/`: Routed components (pages) specific to the module.
    - `routes.ts`: Route definitions for the module.
  - `plugins/`: For Vue plugins that extend Vue's functionality.
  - `types/`: For custom global type definitions.
  - `tests/`: Contains unit and integration tests.
  - `scss/`: For global SCSS files.

**Conventions for file naming within modules:**

- **Components**: PascalCase (e.g., `MyComponent.vue`). Multi-word names are preferred to prevent conflicts with HTML elements (e.g., `TodoItem.vue`).
- **Services**: `<Name>.service.ts` (e.g., `UserService.service.ts`).
- **Models**: `<Name>.model.ts` (e.g., `UserModel.model.ts`).
- **Store (Pinia/Vuex)**: `<Name>.store.ts` (e.g., `UserStore.store.ts`).

By adopting this modular structure, you can manage complexity in large applications, improve maintainability, and facilitate team collaboration.

## Component Development

- Create `.vue` files for Single-File Components (SFCs).
- Implement proper component composition and reusability.
- Use `props` for data passing down to child components.
- Emit custom events using `emit` for communication up to parent components.
- Leverage `ref` and `reactive` for local state management in Composition API.
- Utilize `computed` properties for derived state.
- Use `watch` or `watchEffect` for side effects.
- Prefer Composition API for new features and complex components.

## State Management

- For complex applications, use Pinia (recommended for Vue 3) or Vuex for centralized state management.
- Define stores clearly with state, getters, actions, and mutations (if using Vuex).
- Use `storeToRefs` from Pinia to maintain reactivity when destructuring store properties.

## Routing (Vue Router)

- Utilize Vue Router for navigation and routing.
- Define routes in a centralized `router/index.ts` file.
- Implement dynamic routes using `:paramName` syntax.
- Use `router-link` for navigation and `router-view` for rendering components.
- Implement route guards (`beforeEach`, `beforeResolve`, `afterEach`) for navigation control.

## Styling

- Use scoped styling with `<style scoped>` tags in `.vue` files to prevent styles from leaking.
- Leverage global styles when necessary, importing them in `main.ts` or a top-level component.
- Utilize CSS preprocessors (Sass, Less, Stylus) if required.
- Implement responsive design using CSS media queries.
- Consider using a UI framework like Vuetify, Element Plus, or Quasar for consistent styling and components.

## Performance Optimization

- Minimize re-renders using `v-once` for static content.
- Use `v-if` vs `v-show` appropriately (`v-if` for conditional rendering, `v-show` for toggling visibility).
- Implement lazy loading for components and routes using dynamic imports (`import()`).
- Optimize image assets.
- Debounce or throttle expensive operations (e.g., input handling, scrolling).
- Use `keep-alive` for caching components to prevent re-rendering.

## Data Fetching

- Perform data fetching in component lifecycle hooks (e.g., `onMounted`, `created`) or within actions in your state management store.
- Implement proper error handling for data fetching operations.
- Consider using a library like `vue-query` for data fetching, caching, and synchronization.

## Forms and Validation

- Utilize `v-model` for two-way data binding in form inputs.
- Implement client-side form validation using computed properties, watch, or a validation library (e.g., VeeValidate, Vuelidate).
- Handle form submission with appropriate actions or API calls.

## SEO and Meta Tags

- Use `vue-meta` (for Vue 2) or `useHead` from `@vueuse/head` (for Vue 3 with Vite/Nuxt) for adding meta information to the HTML head.
- Implement canonical URLs for proper SEO.
- Create reusable SEO components or composables for consistent meta tag management.

## Key Conventions

1. Embrace Vue's reactivity system and declarative rendering.
2. Use Vue Router for single-page application (SPA) navigation.
3. Prioritize Web Vitals (LCP, FID, CLS) for performance optimization.
4. Use environment variables for configuration management.
5. Follow Vue.js best practices for component composition and state management.
6. Ensure cross-browser compatibility by testing on multiple platforms.
7. Keep your Vue and related library versions up to date.

## Documentation

- Vue.js Documentation: <https://vuejs.org/>
- Vue Router Documentation: <https://router.vuejs.org/>
- Pinia Documentation: <https://pinia.vuejs.org/>
- Vueuse Documentation: <https://vueuse.org/>
