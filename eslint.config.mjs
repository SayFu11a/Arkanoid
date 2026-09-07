import js from "@eslint/js";
import globals from "globals"; // 1. Импортируем пакет globals

export default [
  { ignores: ["dist"] },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser, // 2. Включаем глобальные переменные браузера (window, document и др.)
      },
    },
    rules: {},
  },
];
