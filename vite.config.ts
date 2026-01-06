import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
    optimizeDeps: { exclude: ["pyodide"] },
    plugins: [react()],
    worker: {
        format: "es"
    }
});
