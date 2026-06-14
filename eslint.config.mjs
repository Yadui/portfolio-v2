import nextConfig from "eslint-config-next/core-web-vitals";

// All React Compiler static-analysis rules bundled into react-hooks by
// eslint-config-next 16. They generate false positives on valid pre-compiler
// React code (refs in render initializers, setState in effects, etc.).
// Disabled until the React Compiler is actually adopted in this project.
const REACT_COMPILER_RULES = [
  "react-hooks/static-components",
  "react-hooks/use-memo",
  "react-hooks/preserve-manual-memoization",
  "react-hooks/incompatible-library",
  "react-hooks/immutability",
  "react-hooks/globals",
  "react-hooks/refs",
  "react-hooks/set-state-in-effect",
  "react-hooks/error-boundaries",
  "react-hooks/purity",
  "react-hooks/set-state-in-render",
  "react-hooks/unsupported-syntax",
  "react-hooks/config",
  "react-hooks/gating",
  "react-hooks/react-compiler",
];

/** @type {import("eslint").Linter.Config[]} */
const eslintConfig = [
  ...nextConfig,
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "warn",
      ...Object.fromEntries(REACT_COMPILER_RULES.map((r) => [r, "off"])),
    },
  },
];

export default eslintConfig;
