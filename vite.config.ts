import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'



// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
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
			// '^/(?!__|@|node_modules|src).*': {
			// 	target: 'https://doc-online-vdv.digdes.com',
			// 	changeOrigin: true,
			// },
		},
	},
})
