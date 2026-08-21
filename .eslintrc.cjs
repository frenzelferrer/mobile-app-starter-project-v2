// https://docs.expo.dev/guides/using-eslint/
/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ["expo", "prettier"],
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": "warn",
  },
};
