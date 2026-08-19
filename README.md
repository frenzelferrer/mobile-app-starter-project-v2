# TuonTa!

**TuonTa!** is a React Native + TypeScript student task-management app for Midterm Task No. 4. It helps students track assignments, quizzes, projects, and deadlines through a dashboard, searchable task list, validated forms, task details, editing, completion status, deletion, and a profile screen. It also includes local deadline reminders and an optional completion celebration with confetti animation and success haptics.

The project is intentionally local-only. It does not use a backend, Firebase, Supabase, Express, or a database. Task data is shared through a small React Context and starts from a parsed JSON string so the core React Native and TypeScript concepts remain easy to explain.

## TuonTa! website and APK

Read about TuonTa! and access the installation instructions through the official project website: [https://tuon-ta-website.vercel.app/](https://tuon-ta-website.vercel.app/). The website includes a **Download APK** button for installing the Android application directly if you want to try and test it in your phone device.

The direct GitHub release asset is also available here: [Download TuonTa! APK](https://github.com/frenzelferrer/mobile-app-starter-project-v2/releases/download/v1.0.0/TuonTa.apk).

## First-launch onboarding

Fresh installs open with an animated TuonTa! welcome screen instead of the task dashboard. The user enters a name, sees a live personalized greeting preview, and presses **Enter TuonTa!** to save the profile and reveal the main app. Names are validated before continuing, and the onboarding completion state is persisted with AsyncStorage so the welcome screen does not repeat on every launch.

Existing users with a meaningful saved name are migrated into the main app automatically. Profile editing remains available after onboarding, and resetting the sample profile intentionally returns the app to the name-entry flow.

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

## EAS Android builds

The project is preconfigured for EAS Build with the Android package identifier `com.gabri.tuonta`.

Install and authenticate the EAS CLI from PowerShell:

```powershell
npm install --global eas-cli
eas login
eas whoami
```

For a standalone grading APK, run:

```powershell
eas build --platform android --profile production-apk
```

The `production-apk` profile in `eas.json` uses internal distribution and `android.buildType: "apk"`, so the resulting file can be installed directly on an Android device or emulator. For a Google Play submission, use the standard AAB profile instead:

```powershell
eas build --platform android --profile production
```

After a build completes, use the EAS download URL or list builds with:

```powershell
eas build:list --platform android --limit 5
```

To install an APK with ADB:

```powershell
adb install .\\tuonta.apk
```

The APK is standalone and does not require `npm start`, Metro, or Expo Go. EAS reads the TuonTa! icon, splash logo, favicon configuration, and app metadata from the repository during the build. Because deadline notifications and haptics are native capabilities, create a new EAS APK after pulling this feature update before testing those behaviors on a phone. Browser/web testing can verify the rest of the interface, but it cannot display device notifications or physical haptics.

The screens use `react-native-safe-area-context` through `SafeAreaProvider` so headers and forms clear Android status bars when edge-to-edge rendering is enabled. Home header controls are constrained for narrow phone widths, while the Tasks and Profile screens retain scrollable responsive layouts. After any layout change, a new APK build is required to test the native result on a physical device.

## Main features

The app includes an animated first-launch name greeting, a dashboard with computed total, completed, pending, high-priority, completion-percentage, and weekly productivity statistics, and a Tasks tab with search, sorting by due date/priority/newest, a `FlatList`, an empty state, a filter `Modal`, due-date urgency badges, and navigation to details. Users can create tasks through a validated form, inspect complete details, start a task-linked Focus Study Timer, mark tasks pending or completed, edit records, and delete them with an `Alert` confirmation. The Tasks area also includes a grouped deadline Timeline. The Profile tab contains persisted student details and a reset-to-sample-data action, while the Home screen provides the clickable moon/sun dark-mode control. Pending tasks can optionally schedule a local reminder for the day before the deadline, and tasks or focus sessions can show a confetti celebration overlay with a success haptic when completed.

## Local reminders and completion feedback

TuonTa! uses `expo-notifications` for **local, on-device deadline reminders**. No server, account, or external API is involved. On Android, the app creates a `Task deadlines` notification channel. When the user enables **Deadline reminders** from Profile, TuonTa! requests notification permission, then resynchronizes all pending tasks: each task receives a reminder one day before its due date when that time is still in the future; if the one-day window has already passed, the app schedules the reminder for the due-date morning when possible. Completed tasks are excluded, and changing, deleting, or completing tasks causes the pending schedule to be rebuilt.

The Profile screen also includes **Celebration feedback**, enabled by default. When enabled, marking a task complete or finishing a focus session opens a short confetti animation overlay and triggers the platform success haptic through `expo-haptics`. The overlay dismisses automatically or can be closed with **Keep going**. Both settings are persisted locally with AsyncStorage. Notifications and haptics require an Android/iOS development build or standalone APK; they are not available in a normal browser export.

The new runtime dependencies are `expo-notifications` for local scheduling and `expo-haptics` for tactile completion feedback. The `expo-notifications` config plugin is included in `app.json`, so EAS includes the required native configuration in future builds.

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
    │       ├── EditTask { taskId: string }
    │       ├── FocusTimer { taskId: string }
    │       └── Timeline
    └── Profile
```

Selecting a task passes only its ID through a typed React Navigation parameter. The details and edit screens read `route.params.taskId` and retrieve the current record from `TaskContext`, which keeps the data current after updates.

## Project structure

```text
App.tsx
eas.json
assets/
└── branding/
    ├── tuonta-icon.png
    └── tuonta-logo.png
src/
├── components/
│   ├── CelebrationOverlay.tsx
│   ├── FormInput.tsx
│   ├── PrimaryButton.tsx
│   ├── StatCard.tsx
│   ├── TaskCard.tsx
│   └── TaskForm.tsx
├── context/
│   ├── FocusContext.tsx
│   ├── ReminderContext.tsx
│   ├── SettingsContext.tsx
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
│   ├── FocusTimerScreen.tsx
│   ├── TaskListScreen.tsx
│   ├── TimelineScreen.tsx
│   └── WelcomeScreen.tsx
├── theme/
│   └── colors.ts
├── types/
│   └── task.ts
├── utils/
│   ├── productivity.ts
│   └── validation.ts
```

## TuonTa! brand system

The official supplied assets are stored in `assets/branding/`. The square `tuonta-icon.png` is used for the Expo app icon, Android adaptive foreground, iOS icon, and web favicon. The `tuonta-logo.png` wordmark is used in the Profile/About area and splash configuration. User-facing branding uses **TuonTa!**, with the supporting tagline **Tuon ta, human ta.** Technical identifiers use the safe internal slug `tuonta`.

## Important implementation notes

`src/data/mockTasks.ts` stores five realistic academic records in a JSON string. `parseMockTasks()` calls `JSON.parse()`, checks the parsed structure, and returns typed `Task` records. `TaskProvider` calls that parser in `useEffect` and exposes a short loading state so `ActivityIndicator` is visible during startup.

`src/context/TaskContext.tsx` manages the shared task collection with `useState`, hydrates saved records from AsyncStorage, and persists every CRUD change. It exposes `addTask`, `updateTask`, `deleteTask`, `toggleTaskStatus`, `resetTasks`, and `getTaskById`. `src/context/SettingsContext.tsx` persists profile fields, the dark-mode preference, the deadline-reminder toggle, and the completion-feedback toggle. `src/context/ReminderContext.tsx` requests permission and rebuilds local notification schedules from current pending tasks whenever task or reminder settings change. `src/components/CelebrationOverlay.tsx` provides the reusable animated confetti and success-feedback surface. `src/components/TaskForm.tsx` owns controlled input state with `useState` and uses `src/utils/validation.ts` for the shared Add/Edit validation rules. The same utility calculates Overdue, Due today, Due soon, and Upcoming labels from real dates.

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
| Productivity tools | Focus Timer, deadline Timeline, and weekly Home summary |
| Local persistence | `TaskContext.tsx` and `SettingsContext.tsx` use AsyncStorage |
| Sorting | `TaskListScreen.tsx` cycles through due date, priority, and newest |
| Progress tracking | `HomeScreen.tsx` calculates and displays completion percentage |
| First-launch onboarding | `WelcomeScreen.tsx`, `SettingsContext.tsx`, and `App.tsx` |
| Dark mode | Home-screen moon/sun icon, `SettingsContext.tsx`, `App.tsx`, and theme-aware screens/components |
| Local deadline reminders | `ReminderContext.tsx`, `expo-notifications`, Profile permission toggle, and `app.json` plugin |
| Completion feedback | `CelebrationOverlay.tsx`, Focus Timer, Task Details, `expo-haptics`, and Profile toggle |

## Local verification checklist

Run a type check before presenting the project:

```bash
npx tsc --noEmit
```

Then manually verify the following flow: clear the app’s local data or use Reset sample data to return to onboarding; confirm the animated welcome screen appears; type a name and watch the greeting preview update; try to continue with an invalid name; submit a valid name and confirm the success transition opens the dashboard; close and reopen the app to verify onboarding is skipped; edit the saved name from Profile and confirm Home updates; search, filter, and sort the sample tasks; open Timeline and select a grouped deadline; inspect overdue/due-soon labels; open a task and confirm its details; start a Focus Study Timer, pause it, resume it, finish it early, and confirm the weekly focus summary updates; create a valid task; attempt an invalid submission and read the inline errors; edit the task; mark it completed; confirm the progress percentage changes; tap the Home-screen moon/sun icon to toggle dark mode; cancel a delete confirmation; and confirm a delete. The dashboard counts, weekly metrics, timeline groups, and list badges should update immediately after each state change. On a physical device or native emulator, open Profile and enable **Deadline reminders**, grant notification permission, create or edit a pending task with a future due date, and confirm the Profile card reports a scheduled reminder; then complete or delete the task and confirm the schedule count updates. Toggle **Celebration feedback** off and on, mark a pending task complete, and finish a Focus Timer session early to confirm the confetti overlay and success haptic appear only when enabled. Rebuild with EAS after pulling the final commit when testing native notifications or haptics; web export does not provide those device capabilities.

The placeholder profile values are in `src/screens/ProfileScreen.tsx` and can be replaced with the student’s actual name, course, year level, and student number. The reminder schedule is intentionally local-only and is rebuilt from the current AsyncStorage task list; it is not a cloud push-notification service.
