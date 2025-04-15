import {svelte} from '@sveltejs/vite-plugin-svelte'
import {execFileSync as exec} from 'child_process'
import fs from 'fs'
import AutoImport from 'unplugin-auto-import/vite'
import {fileURLToPath} from 'url'
import {defineConfig} from 'vite'

import pkg from './package.json'

const is_build = process.argv.includes('build')

for (const file of ['ffmpeg-core.js', 'ffmpeg-core.wasm']) {
    if (!fs.existsSync(`public/${file}`))
        exec('ln', ['-s', `../node_modules/@ffmpeg/core/dist/esm/${file}`, `public/${file}`])
}

const vars = {
    'window.__BUILD_DATE__': `'${new Date().toISOString()}'`,
    'window.__BUILD_HASH__': `'${exec('git rev-parse --short HEAD || true', {shell: true}).toString().trim()}'`,
    'window.__APP_VERSION__': `'${pkg.version}'`,
    'window.__DEBUG__': !is_build,
    'window.CONFIG': JSON.stringify({...pkg.config}),
}

export default defineConfig({
    plugins: [
        svelte({
            onwarn(warning, handler) {
                const IGNORED_WARNINGS = [
                    'a11y_autofocus',
                    'a11y_click_events_have_key_events',
                    'a11y_no_static_element_interactions',
                    'a11y_label_has_associated_control',
                    'a11y_no_noninteractive_element_interactions',
                ]
                if (!IGNORED_WARNINGS.includes(warning.code)) handler(warning)
            },
        }),
        AutoImport({
            imports: ['svelte', 'svelte/store', 'svelte/transition', 'svelte/animate'],
            dts: './src/auto-imports.d.ts',
        }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            '~': fileURLToPath(new URL('./src', import.meta.url)),
            $lib: fileURLToPath(new URL('./src/lib', import.meta.url)),
            $ui: fileURLToPath(new URL('./src/lib/components/ui', import.meta.url)),
        },
    },
    optimizeDeps: {
        exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
    },
    server: {
        fs: {
            allow: ['../..'],
        },
        headers: {
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Embedder-Policy': 'require-corp',
        },
        host: !!process.env.VITE_HOST,
        port: +(process.env.VITE_PORT || 5035),
    },
    build: {
        reportCompressedSize: false,
        minify: false,
        sourcemap: true,
        lib: {
            entry: 'src/main.js',
            formats: ['es'],
            fileName: format => `bundle.${format}.js`,
        },
        rollupOptions: {
            input: './index.html',
            output: {
                inlineDynamicImports: true,
                intro: Object.entries(vars)
                    .map(([k, v]) => `${k} = ${v}`)
                    .join('\n'),
            },
        },
    },
})
