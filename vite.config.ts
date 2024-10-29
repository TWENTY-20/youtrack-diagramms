import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import {resolve} from 'node:path';


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    if (mode === "backend") {
        return {
            build: {
                lib: {
                    entry: "./src/backend.js",
                    formats: ["cjs"],
                    name: "backend",
                    fileName: "backend.js"
                },
                rollupOptions: {
                    output: {
                        entryFileNames: "backend.js",
                        dir: "build"
                    }
                }
            }
        };
    }


    return {

        plugins: [
            react(),
            viteStaticCopy({
                targets: [
                    {
                        src: '*.*',
                        dest: '.'
                    },
                    {
                        src: '../public/*.*',
                        dest: '.'
                    }
                ]
            }),
            viteStaticCopy({
                targets: [
                    // Widget icons and configurations
                    {
                        src: 'widgets/**/*.{svg,png,jpg,json}',
                        dest: '.'
                    }
                ],
                structured: true
            })
        ],
        root: './src',
        base: '',
        publicDir: 'public',
        build: {
            outDir: '../build',
            emptyOutDir: true,
            copyPublicDir: false,
            target: ['es2022'],
            assetsDir: 'widgets/assets',
            rollupOptions: {
                input: {
                    // List every widget entry point here
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
                    fullPage: resolve(__dirname, 'src/widgets/full-page/index.html'),
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
                    articleOption: resolve(__dirname, 'src/widgets/article-option/index.html'),
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
                    issueOption: resolve(__dirname, 'src/widgets/issue-option/index.html'),
                }
            }
        }
    };
});
