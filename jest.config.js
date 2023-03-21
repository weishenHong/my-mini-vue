export default {
    // ...
    "preset": "ts-jest",
    "testEnvironment": "node",
    "transform": {
      "^.+\\.tsx?$": "esbuild-jest"
    },
    "extensionsToTreatAsEsm": [".ts"],
    "globals": {
      "ts-jest": {
        "useESM": true
      }
    }
  };
  