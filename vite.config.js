import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  server: {
    host: true,
    open: "/#/login",
  },
  plugins: [react(), tailwindcss()],
  build: {
    // Configuración para generar un único archivo
    outDir: 'dist',
    emptyOutDir: true,
    minify: "terser",
    sourcemap: false,
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'), // Usar el HTML como punto de entrada
      },
      output: {
        manualChunks: () => "main", // Forzar todos los chunks en uno solo
        entryFileNames: 'main.js',
        chunkFileNames: 'main.js',
        assetFileNames: (assetInfo) => {
          if (/\.css$/.test(assetInfo.name)) {
            return 'index.css';
          }
          if (/\.(gif|jpe?g|png|svg)$/.test(assetInfo.name)) {
            return "assets/images/[name][extname]";
          }
          return "assets/[name][extname]";
        },
      },
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});