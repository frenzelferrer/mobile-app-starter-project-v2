/** @type {import('jest').Config} */
module.exports = {
  preset: "react-native",
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|@react-native|expo|@expo|react-native-reanimated|react-native-gesture-handler|react-native-screens|react-native-safe-area-context)/)",
  ],
};
