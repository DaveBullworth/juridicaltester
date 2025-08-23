import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import "./styles/index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>
);

registerSW({
	onNeedRefresh() {
		if (confirm("Доступна новая версия! Обновить?")) {
			window.location.reload();
		}
	},
	onOfflineReady() {
		console.log("Приложение готово к оффлайн-работе ✅");
	}
});
