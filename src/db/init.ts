// Импортируем sql.js — это SQLite, скомпилированный в WebAssembly (WASM)
// Работает прямо в браузере (в оперативной памяти или IndexedDB)
import initSqlJs from "sql.js";
import type { Database } from "sql.js";

// Импортируем клиент Drizzle ORM для sql.js
import { drizzle } from "drizzle-orm/sql-js";

// Импортируем описание схемы таблиц (topics, modules, questions, answers и т.д.)
import * as schema from "./schema";

// Импортируем функции для работы с IndexedDB — для сохранения и загрузки БД
import { loadDbFromIndexedDB, loadDbVersion, saveDbToIndexedDB } from "./idb-utils";

// Импортируем функцию, которая инициализирует структуру БД и заполняет её данными (сидирование)
import { seedDatabase } from "./seed";

export const CURRENT_DB_VERSION = 48; // увеличиваем при каждом обновлении сидов

// Главная функция инициализации базы данных.
// Она возвращает ORM-клиент Drizzle, с которым ты потом будешь работать.
export async function initDb(): Promise<ReturnType<typeof drizzle>> {
	// 1. Загружаем sql.js (асинхронно). locateFile сообщает, откуда брать wasm-файл для SQLite.
	// В продакшене браузер подгрузит файл https://sql.js.org/dist/sql-wasm.wasm
	const SQL = await initSqlJs({
		locateFile: () => `/juridicaltester/sql-wasm.wasm`
	});

	// 2. Пробуем загрузить уже сохранённую базу данных из IndexedDB браузера
	//    Эта функция возвращает Uint8Array с бинарным дампом базы или null, если базы ещё нет
	let dbData = await loadDbFromIndexedDB();

	// Загружаем версию базы, которая была сохранена ранее в IndexedDB
	// Если базы ещё нет, вернётся null
	const storedVersion = await loadDbVersion();

	// Объявляем переменную для SQLite базы
	let db: Database;

	// 3. Если база нет (dbData === null) или версия базы устарела
	//    (storedVersion !== CURRENT_DB_VERSION) — нужно пересидировать данные
	if (!dbData || storedVersion !== CURRENT_DB_VERSION) {
		// 3a. Создаём новую пустую SQLite базу в оперативной памяти браузера
		db = new SQL.Database();

		// 3b. Наполняем базу начальными данными (темы, модули, вопросы, ответы)
		//      из JSON-файлов с сидированием
		await seedDatabase(db);

		// 3c. Сохраняем свежую базу в IndexedDB вместе с актуальной версией
		//      Это гарантирует, что при следующем заходе браузер возьмёт уже новую версию
		await saveDbToIndexedDB(db, CURRENT_DB_VERSION);
	} else {
		// 3d. Если база есть и версия актуальна — восстанавливаем её из бинарного дампа
		//      Это экономит время и трафик, не нужно пересидировать данные
		db = new SQL.Database(dbData);
	}

	// 7. Создаём клиент Drizzle ORM, указывая БД и схему — и возвращаем его
	return drizzle(db, { schema });
}
