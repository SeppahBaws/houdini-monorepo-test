import houdini from "houdini/vite";
import dts from "vite-plugin-dts";
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [houdini(), dts({
        entryRoot: "./src",
        include: "./src/**/*.{ts,js}",
    })],
    root: ".",

    build: {
        outDir: "./dist",
        emptyOutDir: true,
        minify: false,
        target: "esnext",
        lib: {
            entry: "./src/index.js",
            fileName: "index",
            formats: ["es"],
        },
    }
});
