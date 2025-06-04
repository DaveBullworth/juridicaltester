// Импортируем sql.js — это SQLite, скомпилированный в WebAssembly (WASM)
// Работает прямо в браузере (в оперативной памяти или IndexedDB)
import initSqlJs from "sql.js";
import type { Database } from "sql.js";

// Импортируем клиент Drizzle ORM для sql.js
import { drizzle } from "drizzle-orm/sql-js";

// Импортируем описание схемы таблиц (topics, modules, questions, answers и т.д.)
import * as schema from "./schema";

// Импортируем функции для работы с IndexedDB — для сохранения и загрузки БД
import { loadDbFromIndexedDB, saveDbToIndexedDB } from "./idb-utils";

// Импортируем функцию, которая инициализирует структуру БД и заполняет её данными (сидирование)
import { seedDatabase } from "./seed";

// Главная функция инициализации базы данных.
// Она возвращает ORM-клиент Drizzle, с которым ты потом будешь работать.
export async function initDb(): Promise<ReturnType<typeof drizzle>> {
	// 1. Загружаем sql.js (асинхронно). locateFile сообщает, откуда брать wasm-файл для SQLite.
	// В продакшене браузер подгрузит файл https://sql.js.org/dist/sql-wasm.wasm
	const SQL = await initSqlJs({
		locateFile: (file: string) => `https://sql.js.org/dist/${file}`
	});

	// 2. Пробуем загрузить уже сохранённую базу данных из IndexedDB браузера
	let dbData = await loadDbFromIndexedDB();

	let db: Database;

	// 3. Если база уже сохранена — создаём SQLite из бинарного дампа
	if (dbData) {
		db = new SQL.Database(dbData); // восстанавливаем состояние БД
	} else {
		// 4. Если БД нет — создаём новую пустую SQLite в оперативной памяти
		db = new SQL.Database();

		// 5. Наполняем её начальными данными из JSON-файлов (seed)
		await seedDatabase(db);

		// 6. Сохраняем проинициализированную БД в IndexedDB, чтобы в следующий раз не сидировать
		await saveDbToIndexedDB(db);
	}

	// 7. Создаём клиент Drizzle ORM, указывая БД и схему — и возвращаем его
	return drizzle(db, { schema });
}
