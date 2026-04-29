# Changes.md

## Overview

The original `DashboardPage.jsx` was a monolithic file (~250+ lines) containing UI rendering, state management, filtering logic, and event handling all in one place. While functional, it was difficult to read, debug, and extend.

This refactor restructures the page into a clean, component-based architecture with clear separation of concerns, improved readability, and better reusability.

---

## Before Refactor

* Single large file handling:

  * Header UI
  * Stats cards
  * Task input
  * Filters + search
  * Task list rendering
  * Individual task rows
* Mixed responsibilities (logic + UI tightly coupled)
* Hard to locate or modify specific features
* No reusable components

---

## After Refactor

The page is now broken into smaller, focused components organized by responsibility.

### Folder Structure

```
src/
├── pages/
│   └── DashboardPage.jsx
├── components/
│   ├── dashboard/
│   │   ├── DashboardHeader.jsx
│   │   ├── StatsRow.jsx
│   │   ├── AddTaskInput.jsx
│   │   ├── TaskFilterBar.jsx
│   │   └── TaskList.jsx
│   └── shared/
│       ├── StatCard.jsx
│       └── TaskItem.jsx
```

---

## Components and Responsibilities

### Dashboard-Specific Components (`components/dashboard/`)

#### 1. DashboardHeader

* Responsible for rendering the top navigation/header UI
* Contains branding, greeting, and avatar
* No props required (pure UI component)

---

#### 2. StatsRow

* Displays task statistics in a grid layout
* Uses `StatCard` internally
* Calculates:

  * Total tasks
  * Completed tasks
  * Remaining tasks
  * Progress percentage

**Props:**

* `total`
* `completed`
* `progress`

---

#### 3. AddTaskInput

* Handles user input for adding new tasks
* Maintains its own internal input state
* Calls parent function on submission

**Props:**

* `onAdd` → function to add a new task

---

#### 4. TaskFilterBar

* Controls filtering and searching of tasks
* Provides filter buttons (all, active, completed)
* Provides search input

**Props:**

* `filter`
* `setFilter`
* `searchQuery`
* `setSearchQuery`

---

#### 5. TaskList

* Renders the filtered list of tasks
* Handles empty state UI
* Maps tasks to `TaskItem`

**Props:**

* `tasks`
* `onToggle`
* `onDelete`

---

### Shared Components (`components/shared/`)

#### 6. StatCard

* Generic reusable card for displaying a label and value
* Used inside `StatsRow`
* Designed to be reusable across different pages

**Props:**

* `title`
* `value`
* `subtitle`
* `color`
* `children` (for custom content like progress bar)

---

#### 7. TaskItem

* Represents a single task row
* Handles:

  * Toggle completion
  * Delete action
* Fully reusable across different parts of the app

**Props:**

* `task`
* `onToggle`
* `onDelete`

---

## State Management

All application state remains in `DashboardPage.jsx`:

* `taskList`
* `filter`
* `searchQuery`

### Key Improvement

Refactored `addTask` to accept input directly:

```js
const addTask = (text) => { ... }
```

### Why?

Previously:

* Relied on `newTask` state
* Caused potential stale state issues

Now:

* Cleaner data flow
* Better separation of concerns
* No dependency on child component state

---

## Data Flow

* `DashboardPage` acts as the **single source of truth**
* State is passed down via props
* Events are passed up via callback functions

This ensures:

* Predictable behavior
* Easier debugging
* Clear component responsibilities

---

## UI Consistency

* All inline styles were preserved exactly as in the original file
* No visual or behavioral changes were introduced
* The application remains pixel-identical

---

## Key Improvements

* Separation of concerns
* Improved readability and maintainability
* Reusable component design
* Cleaner data flow using props
* Easier onboarding for new developers

---

## Tradeoffs

* Increased number of files
* Slight overhead in prop passing

However, these tradeoffs are justified for scalability and maintainability.

---

## If the App Scaled 10×

If the application grew significantly, the following improvements would be considered:

* Introduce custom hooks (e.g., `useTasks`)
* Add global state management (Context API or Zustand)
* Extract API/data logic into services
* Add unit and integration tests
* Move styles to a structured styling system (CSS modules or Tailwind)

---


---
