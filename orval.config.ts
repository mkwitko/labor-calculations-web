import dotenv from "dotenv";
import { defineConfig } from "orval";

dotenv.config();

export default defineConfig({
  api: {
    input: "./swagger.json",
    output: {
      biome: true,
      target: "src/http/generated",
      baseUrl: process.env.VITE_HTTP_API_URL,
      client: "react-query",
      clean: true,
      httpClient: "axios",
      mode: "tags-split",
      namingConvention: "kebab-case",
      override: {
        mutator: {
          path: "./src/lib/api.ts",
          name: "customInstance",
        },

        // Optional: explicitly disable zod response schemas
        zod: {
          generate: {
            response: false,
          },
        },
      },
    },
  },
});