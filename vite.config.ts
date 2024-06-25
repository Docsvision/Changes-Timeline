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
			'^/.*/timeline.min.js': {
				target: 'http://127.0.0.1:5173',
				rewrite: () => '/timeline.js',
			},
			'^/timeline/': {
				target: 'https://help.docsvision.com',
				changeOrigin: true,
			},
		},
	},
})
