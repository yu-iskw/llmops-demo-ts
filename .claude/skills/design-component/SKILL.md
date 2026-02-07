---
name: design-component
description: Design a UI component with specifications for layout, states, interactions, and accessibility. Use when creating new Vue.js components or redesigning existing ones.
argument-hint: "[component name or description]"
context: fork
agent: designer
---

# Design Component

Design the following UI component:

$ARGUMENTS

## Design Deliverables

1. **Component specification** with props, states, and layout
2. **Interaction design** with user flows and feedback
3. **Accessibility specification** (ARIA roles, keyboard navigation, screen reader support)
4. **Responsive behavior** across screen sizes

## Context

The component will be built with:

- Vue.js 3 Composition API (`<script setup>`)
- CSS (no framework — see packages/frontend/src/style.css for existing styles)
- Pinia for state management if needed

Existing components for reference:

- ChatMessage.vue — individual message display
- MessageInput.vue — user input form
- MessageList.vue — scrollable message list
