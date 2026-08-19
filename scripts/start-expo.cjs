const { spawn } = require("node:child_process");

const command = process.platform === "win32" ? "npx.cmd" : "npx";
const child = spawn(command, ["expo", ...process.argv.slice(2)], {
  stdio: "inherit",
  env: {
    ...process.env,
    // Expo CLI bundles expo-router transitively, but this project intentionally
    // uses direct React Navigation as required by the midterm brief.
    EXPO_ROUTER_DISABLE_RN_NAVIGATION_CHECK: "1",
  },
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
