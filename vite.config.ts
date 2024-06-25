import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue({
			template: { transformAssetUrls },
		}),
		vueDevTools(),
		quasar({
			sassVariables: 'src/quasar-variables.scss',
		}),
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
	build: {
		minify: true,
	},
	server: {
		proxy: {
			'^/.*/timeline.min.css': {
				target: 'http://localhost:5173',
				rewrite: () => '/src/timeline.dev.css',
			},
			'^/.*/timeline.min.js': {
				target: 'http://localhost:5173',
				rewrite: () => '/src/timeline.dev.js',
			},
			'^/(?!__|@|node_modules|src).*': {
				target: 'https://doc-online-vdv.digdes.com',
				changeOrigin: true,
			},
		},
	},
})
