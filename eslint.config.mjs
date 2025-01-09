import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [...compat.extends("eslint:recommended", "plugin:jsdoc/recommended"), {
    languageOptions: {
        globals: {
            ...globals.browser,
        },

        ecmaVersion: 2022,
        sourceType: "module",
    },

    rules: {
        "jsdoc/check-types": "error",
        "jsdoc/require-param-type": "error",
        "jsdoc/require-returns-type": "error",
        "jsdoc/require-param-description": 0,
        "jsdoc/require-returns-description": 0,
        "semi": ["error", "always"]
    },
}];