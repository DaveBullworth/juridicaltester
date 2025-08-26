// ============================
// idb-utils.ts — безопасная работа с IndexedDB для SQLite + версия базы
// Этот файл содержит функции для сохранения и загрузки SQLite базы в браузере
// с учётом версии базы, чтобы можно было обновлять данные при изменении сидов.
// ============================

// Импортируем функцию openDB из библиотеки idb
// idb — это удобная обёртка над IndexedDB, которая делает её асинхронной и простой в использовании.
import { openDB } from "idb";

// Импортируем тип Database из sql.js для работы с SQLite в браузере
import type { Database } from "sql.js";

// Версия IndexedDB.
// Когда меняется структура хранилищ (например добавляется новый store),
// нужно увеличить эту версию. При этом автоматически сработает upgrade.
export const CURRENT_IDB_VERSION = 2;

// ----------------------------
// Вспомогательная функция открытия IndexedDB
// ----------------------------
async function openTesterDB() {
	// openDB открывает базу с указанным именем и версией
	// Если базы ещё нет — она создаётся
	// Если версия базы ниже CURRENT_IDB_VERSION — вызывается upgrade для апгрейда
	return openDB("TesterApp", CURRENT_IDB_VERSION, {
		upgrade(db) {
			// Функция upgrade вызывается только при создании базы или изменении версии
			// Здесь создаём object store, если их ещё нет

			// "sqlite" — для хранения бинарного дампа SQLite базы
			if (!db.objectStoreNames.contains("sqlite")) {
				db.createObjectStore("sqlite");
			}

			// "meta" — для хранения метаданных базы, например версии
			if (!db.objectStoreNames.contains("meta")) {
				db.createObjectStore("meta");
			}
		}
	});
}

// ============================
// Сохраняем SQLite базу и версию в IndexedDB
// ============================
export async function saveDbToIndexedDB(db: Database, version: number) {
	// 1. Экспортируем SQLite базу в бинарный массив Uint8Array
	// Это нужно, чтобы можно было сохранить её в IndexedDB как blob/байты
	const binary = db.export();

	// 2. Открываем IndexedDB через нашу обёртку
	const idb = await openTesterDB();

	// 3. Сохраняем бинарный дамп SQLite базы в object store "sqlite" под ключом "main"
	await idb.put("sqlite", binary, "main");

	// 4. Сохраняем текущую версию базы в object store "meta" под ключом "dbVersion"
	// Это позволит при следующей загрузке проверить, актуальна ли база
	await idb.put("meta", version, "dbVersion");
}

// ============================
// Загружаем SQLite базу из IndexedDB
// ============================
export async function loadDbFromIndexedDB(): Promise<Uint8Array | null> {
	// 1. Открываем IndexedDB через нашу обёртку
	const idb = await openTesterDB();

	// 2. Получаем бинарный дамп SQLite базы из object store "sqlite" по ключу "main"
	// Если базы ещё нет — вернётся null
	const data = await idb.get("sqlite", "main");
	return data || null; // null вместо undefined для удобства проверки
}

// ============================
// Загружаем версию базы из IndexedDB
// ============================
export async function loadDbVersion(): Promise<number | null> {
	// 1. Открываем IndexedDB через нашу обёртку
	const idb = await openTesterDB();

	// 2. Получаем сохранённую версию базы из object store "meta" по ключу "dbVersion"
	// Если версия ещё не сохранена — вернётся null
	const version = await idb.get("meta", "dbVersion");
	return version ?? null; // null вместо undefined для удобства проверки
}
