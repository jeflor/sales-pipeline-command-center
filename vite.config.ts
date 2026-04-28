import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages serves this app from /sales-pipeline-command-center/
export default defineConfig({
  base: "/sales-pipeline-command-center/",
  plugins: [react()],
});
