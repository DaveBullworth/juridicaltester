import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
	base: "/juridicaltester/",
	plugins: [
		react(),
		tailwindcss(),
		VitePWA({
			registerType: "autoUpdate", // автоматическое обновление при новой сборке
			manifest: {
				name: "Juridical Tester",
				short_name: "Tester",
				start_url: "/juridicaltester/",
				display: "standalone",
				background_color: "#ffffff",
				theme_color: "#2563eb",
				icons: [
					{
						src: "icons/icon-192x192.png",
						sizes: "192x192",
						type: "image/png"
					},
					{
						src: "icons/icon-512x512.png",
						sizes: "512x512",
						type: "image/png"
					}
				]
			},
			workbox: {
				globPatterns: ["**/*.{js,css,html,ico,png,svg, wasm}"],
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/sql\.js\.org\/dist\/.*/i,
						handler: "CacheFirst", // кешируем wasm-файл SQLite
						options: {
							cacheName: "sql-js-cache",
							expiration: { maxEntries: 1 }
						}
					}
				]
			},
			devOptions: {
				enabled: true
			}
		})
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src")
		}
	},
	build: {
		target: "esnext",
		outDir: "dist"
	}
});
