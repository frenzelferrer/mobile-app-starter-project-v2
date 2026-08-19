# StudyFlow

**StudyFlow** is a React Native + TypeScript student task-management app for Midterm Task No. 4. It helps students track assignments, quizzes, projects, and deadlines through a dashboard, searchable task list, validated forms, task details, editing, completion status, deletion, and a profile screen.

The project is intentionally local-only. It does not use a backend, Firebase, Supabase, Express, or a database. Task data is shared through a small React Context and starts from a parsed JSON string so the core React Native and TypeScript concepts remain easy to explain.

## Run locally

From the repository root, install dependencies and start Expo:

```bash
npm install
npm start
```

Useful platform commands are:

```bash
npm run android
npm run ios
npm run web
```

The Android and iOS commands require the corresponding emulator/simulator or a connected device. The web command is useful for quickly checking navigation and form behavior in a browser. The project scripts set the required Expo compatibility flag because the Expo CLI bundles Expo Router transitively, while this application intentionally uses direct React Navigation. On Windows, `scripts/start-expo.cjs` launches the `.cmd` executable through the native shell, so `npm start` works without manually setting environment variables.

## Main features

The app includes a dashboard with computed total, completed, pending, and high-priority task statistics. The Tasks tab provides search, a `FlatList`, an empty state, a filter `Modal`, and navigation to details. Users can create tasks through a validated form, inspect complete details, mark tasks pending or completed, edit records, and delete them with an `Alert` confirmation. The Profile tab contains easy-to-replace student placeholder information and app metadata.

## Navigation structure

The project uses **direct React Navigation**, not Expo Router:

```text
NavigationContainer
└── Bottom Tabs
    ├── Home
    ├── Tasks
    │   └── Native Stack
    │       ├── TaskList
    │       ├── AddTask
    │       ├── TaskDetails { taskId: string }
    │       └── EditTask { taskId: string }
    └── Profile
```

Selecting a task passes only its ID through a typed React Navigation parameter. The details and edit screens read `route.params.taskId` and retrieve the current record from `TaskContext`, which keeps the data current after updates.

## Project structure

```text
App.tsx
src/
├── components/
│   ├── FormInput.tsx
│   ├── PrimaryButton.tsx
│   ├── StatCard.tsx
│   ├── TaskCard.tsx
│   └── TaskForm.tsx
├── context/
│   └── TaskContext.tsx
├── data/
│   └── mockTasks.ts
├── navigation/
│   ├── AppNavigator.tsx
│   └── navigationTypes.ts
├── screens/
│   ├── AddTaskScreen.tsx
│   ├── EditTaskScreen.tsx
│   ├── HomeScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── TaskDetailsScreen.tsx
│   └── TaskListScreen.tsx
├── theme/
│   └── colors.ts
├── types/
│   └── task.ts
└── utils/
    └── validation.ts
```

## Important implementation notes

`src/data/mockTasks.ts` stores five realistic academic records in a JSON string. `parseMockTasks()` calls `JSON.parse()`, checks the parsed structure, and returns typed `Task` records. `TaskProvider` calls that parser in `useEffect` and exposes a short loading state so `ActivityIndicator` is visible during startup.

`src/context/TaskContext.tsx` manages the shared task collection with `useState` and exposes `addTask`, `updateTask`, `deleteTask`, `toggleTaskStatus`, and `getTaskById`. `src/components/TaskForm.tsx` owns controlled input state with `useState` and uses `src/utils/validation.ts` for the shared Add/Edit validation rules.

## Validation rules

A title is required and must contain at least three characters. Subject and description are required, and the description must contain at least ten characters. Due dates must use the valid `YYYY-MM-DD` format and represent a real calendar date. Priority must be Low, Medium, or High, and status must be Pending or Completed. Invalid forms display inline messages and cannot be saved.

## Requirement audit

| Assignment requirement | Demonstrated in |
|---|---|
| React Native + TypeScript | `App.tsx`, `src/**/*.tsx`, `src/types/task.ts` |
| `View` and `Text` | All screens and reusable components |
| `TextInput` | `TaskForm.tsx`, `TaskListScreen.tsx`, `ProfileScreen.tsx` |
| `Button` | `ProfileScreen.tsx` |
| `Pressable` | `HomeScreen.tsx`, `TaskListScreen.tsx`, `TaskCard.tsx`, `TaskForm.tsx` |
| `Image` | `HomeScreen.tsx` and `ProfileScreen.tsx` |
| `ScrollView` | Home, Add/Edit form, Details, and Profile screens |
| `FlatList` | `TaskListScreen.tsx` |
| `SafeAreaView` | All six screens |
| `ActivityIndicator` | `TaskListScreen.tsx` and `PrimaryButton.tsx`; initial loading is controlled by `TaskContext` |
| `Modal` | Task filter selection in `TaskListScreen.tsx` |
| `Alert` | Create/update feedback and delete confirmation |
| React Navigation | `src/navigation/AppNavigator.tsx` and `App.tsx` |
| Bottom tab navigation | Home, Tasks, and Profile tabs |
| Stack navigation | TaskList, AddTask, TaskDetails, and EditTask stack |
| Navigation parameter passing | `TaskListScreen.tsx` passes `taskId`; Details/Edit read it |
| `useState` and shared state | `TaskContext.tsx`, `TaskForm.tsx`, list search/filter, and Profile |
| User input | Search, task forms, and profile name input |
| JSON/data parsing | `src/data/mockTasks.ts` and `TaskContext.tsx` |
| Form validation | `src/utils/validation.ts` used by Add and Edit |
| Create | `AddTaskScreen.tsx` and `TaskContext.addTask()` |
| Read | Home statistics, Task List, and Task Details |
| Update | `EditTaskScreen.tsx`, status toggle, and `TaskContext.updateTask()` |
| Delete | `TaskDetailsScreen.tsx` and `TaskContext.deleteTask()` |
| Six screens | Home, Task List, Add, Details, Edit, and Profile |

## Local verification checklist

Run a type check before presenting the project:

```bash
npx tsc --noEmit
```

Then manually verify the following flow: wait for initial loading to finish; search and filter the five sample tasks; open a task and confirm its details; create a valid task; attempt an invalid submission and read the inline errors; edit the task; mark it completed; cancel a delete confirmation; and confirm a delete. The dashboard counts and list badges should update immediately after each state change.

The placeholder profile values are in `src/screens/ProfileScreen.tsx` and can be replaced with the student’s actual name, course, year level, and student number.
