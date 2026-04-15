import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Phase 1: bundle the existing single-file app via Vite instead of Babel CDN.
// Output still goes to dist/ so the deploy flow (upload dist/ to Hostinger) is unchanged.
export default defineConfig({
  plugins: [
    react({
      // health-companion.jsx is a .jsx file with JSX syntax — include by default.
      include: /\.(jsx?|tsx?)$/,
    }),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    target: "es2020",
  },
  server: {
    port: 5173,
    open: true,
  },
});
