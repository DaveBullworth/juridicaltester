import { drizzle } from "drizzle-orm/sql-js";
import type { Database } from "sql.js";
import * as schema from "./schema";

export async function seedDatabase(db: Database) {
	// Явно создаём таблицы
	db.run(`
		CREATE TABLE IF NOT EXISTS topics (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT NOT NULL,
			"order" INTEGER NOT NULL
	    );

		CREATE TABLE IF NOT EXISTS modules (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT NOT NULL,
			"order" INTEGER NOT NULL,
			topic_id INTEGER NOT NULL,
			FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
		);

		CREATE TABLE IF NOT EXISTS questions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			text TEXT NOT NULL,
			"order" INTEGER NOT NULL,
			module_id INTEGER NOT NULL,
			FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
		);

		CREATE TABLE IF NOT EXISTS answers (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			text TEXT NOT NULL,
			"order" INTEGER NOT NULL,
			is_correct BOOLEAN NOT NULL,
			question_id INTEGER NOT NULL,
			FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
		);
	`);

	// Подключаем Drizzle ORM и сидируем данные
	const orm = drizzle(db, { schema });

	// 1. импорт 0.json — темы и модули
	const base = await import("../seed/0.json");
	await orm.insert(schema.topics).values(base.default.topics);
	await orm.insert(schema.modules).values(base.default.modules);

	// 2. импорт частями — вопросы и ответы
	for (let part = 11; part <= 32; part++) {
		const data = await import(`../seed/${part}.json`);
		await orm.insert(schema.questions).values(data.default.questions);
		await orm.insert(schema.answers).values(data.default.answers);
	}
}
