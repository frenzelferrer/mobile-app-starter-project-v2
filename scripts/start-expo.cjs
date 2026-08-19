const { spawn } = require("node:child_process");

const isWindows = process.platform === "win32";
const command = isWindows ? "npx.cmd" : "npx";
const expoArguments = ["expo", ...process.argv.slice(2)];

const child = spawn(command, expoArguments, {
  cwd: process.cwd(),
  env: {
    ...process.env,
    // Expo CLI bundles expo-router transitively, but this project intentionally
    // uses direct React Navigation as required by the midterm brief.
    EXPO_ROUTER_DISABLE_RN_NAVIGATION_CHECK: "1",
  },
  stdio: "inherit",
  // Windows cannot reliably spawn .cmd files with shell:false from npm scripts.
  // Using the native command shell keeps npm start, npm run web, and platform
  // scripts consistent on Windows while remaining shell-free on Unix systems.
  shell: isWindows,
  windowsHide: false,
});

child.once("error", (error) => {
  console.error(`Unable to start Expo: ${error.message}`);
  process.exitCode = 1;
});

child.once("close", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exitCode = code ?? 1;
});
