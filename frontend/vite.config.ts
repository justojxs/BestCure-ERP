import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    server: {
        port: 3000,
        host: "0.0.0.0",
        proxy: {
            '/api': {
                target: 'http://localhost:5001',
                changeOrigin: true,
                secure: false,
            }
        }
    },
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./"),
        },
    },
    build: {
        outDir: "dist",
        emptyOutDir: true,
        // Split vendor code into separate cached chunks so the login page
        // doesn't have to download libraries it doesn't use (e.g. recharts)
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-react': ['react', 'react-dom'],
                    'vendor-router': ['react-router-dom'],
                    'vendor-charts': ['recharts'],
                    'vendor-icons': ['lucide-react'],
                },
            },
        },
    },
});
