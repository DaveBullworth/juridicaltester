import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import jsxA11y from "eslint-plugin-jsx-a11y";
import importPlugin from "eslint-plugin-import";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettierConfig from "eslint-config-prettier";

// Helper to spread plugin configs because extends не поддерживается
const baseConfigs = [
	js.configs.recommended,
	tsPlugin.configs.recommended,
	react.configs.recommended,
	reactHooks.configs.recommended,
	jsxA11y.configs.recommended,
	importPlugin.configs.recommended,
	prettierConfig
];

export default [
	// Игнорируемые файлы/папки
	{
		ignores: ["node_modules/", "dist/", "build/", "public/"]
	},

	// Основная конфигурация
	{
		files: ["**/*.{ts,tsx}"],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: 2021,
				sourceType: "module",
				ecmaFeatures: { jsx: true }
			},
			globals: {
				...globals.browser,
				...globals.node,
				...globals.es2021
			}
		},
		plugins: {
			react,
			"react-hooks": reactHooks,
			"react-refresh": reactRefresh,
			"jsx-a11y": jsxA11y,
			import: importPlugin,
			"@typescript-eslint": tsPlugin
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			...react.configs.recommended.rules,
			...jsxA11y.configs.recommended.rules,
			...importPlugin.configs.recommended.rules,
			...tsPlugin.configs.recommended.rules,

			"react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
			"react-hooks/exhaustive-deps": "off",
			"react/react-in-jsx-scope": "off",
			"react/prop-types": "off",
			"@typescript-eslint/no-unused-vars": ["warn"],
			"import/order": ["warn", { groups: [["builtin", "external", "internal"]] }]
		},
		settings: {
			react: {
				version: "detect"
			},
			"import/resolver": {
				node: {
					extensions: [".js", ".jsx", ".ts", ".tsx", ".json", ".scss"]
				},
				typescript: {
					project: "./tsconfig.json"
				}
			}
		}
	}
];

