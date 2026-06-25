import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import {viteStaticCopy} from "vite-plugin-static-copy";
import tailwindcss from "@tailwindcss/vite";


// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
    if (mode === "backend") {
        return {
            build: {
                outDir: "build",
                rolldownOptions: {
                    external: [/^@jetbrains\/youtrack-scripting-api/],
                },
                lib: {
                    entry: "./src/backend.js",
                    formats: ["cjs"],
                    fileName: (_format, entryName) => `${entryName}.js`,
                },
                emptyOutDir: true,
            }
        };
    }


    return {

        plugins: [
            react(),
            tailwindcss(),
            viteStaticCopy({
                targets: [
                    {src: "./logo.svg", dest: "."},
                    {src: "./manifest.json", dest: "."},
                    {src: "./entity-extensions.json", dest: "."},
                    {src: "./settings.json", dest: "."},
                ]
            })
        ],
        root: './src',
        base: '',
        publicDir: 'public',
        build: {
            outDir: '../build',
            emptyOutDir: false,
            copyPublicDir: false,
            sourcemap: false,
            target: ['es2022'],
            assetsDir: 'widgets/assets',
            rollupOptions: {
                input: {
                    // List every widget entry point here
                    fullPage: 'src/widgets/full-page/index.html',
                    articleOption: 'src/widgets/article-option/index.html',
                    issueOption: 'src/widgets/issue-option/index.html',
                }
            }
        },
    };
});
