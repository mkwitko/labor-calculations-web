import { sentryVitePlugin } from "@sentry/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// Upload source maps to Sentry only when an auth token is present (CI/prod
// build). Local builds skip it so they don't fail without the token.
const sentryEnabled = !!process.env.SENTRY_AUTH_TOKEN;

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ...(sentryEnabled
      ? [
          sentryVitePlugin({
            org: "mk-0tn",
            project: "lexlaboral-front",
            authToken: process.env.SENTRY_AUTH_TOKEN,
            sourcemaps: {
              // Delete emitted maps after upload so they aren't served publicly.
              filesToDeleteAfterUpload: ["./dist/**/*.map"],
            },
          }),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // "hidden" emits source maps without a //# sourceMappingURL comment, so the
    // browser won't fetch them but Sentry can still symbolicate uploaded maps.
    sourcemap: sentryEnabled ? "hidden" : false,
    chunkSizeWarningLimit: 1500,
  },
});
