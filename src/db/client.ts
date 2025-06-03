import initSqlJs from "sql.js";
import { drizzle } from "drizzle-orm/sql-js";
import * as schema from "./schema";

// функция инициализации базы данных
export async function initDb(): Promise<ReturnType<typeof drizzle>> {
	// 1. Загружаем модуль sql.js, который представляет собой SQLite, скомпилированный в WebAssembly.
	// locateFile — это функция, которая говорит, откуда загружать бинарный файл wasm.
	const SQL = await initSqlJs({
		locateFile: (file: string) => `https://sql.js.org/dist/${file}`
	});

	// 2. Создаём экземпляр базы данных SQLite в оперативной памяти браузера
	const db = new SQL.Database();

	// 3. Создаём клиент Drizzle ORM, который умеет работать с этой базой,
	// передавая схему (schema) и саму базу (db)
	const drizzleClient = drizzle(db, { schema });

	// 4. Возвращаем клиент Drizzle для дальнейшей работы с БД через ORM
	return drizzleClient;
}
