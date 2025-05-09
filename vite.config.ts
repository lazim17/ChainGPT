import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist", // Ensure that the build output goes to the 'dist' folder
    rollupOptions: {
      input: {
        main: "index.html", // Your entry HTML file
      },
    },
  },
  publicDir: "public", // Ensure the public folder is included for static assets like manifest.json
});
