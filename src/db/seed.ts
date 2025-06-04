import { drizzle } from "drizzle-orm/sql-js";
import type { Database } from "sql.js";
import * as schema from "./schema";

export async function seedDatabase(db: Database) {
	const orm = drizzle(db, { schema });

	// 1. импорт 0.json — темы и модули
	const base = await import("../seed/0.json");
	await orm.insert(schema.topics).values(base.default.topics);
	await orm.insert(schema.modules).values(base.default.modules);

	// 2. импорт частями — вопросы и ответы
	const parts = ["11", "12", "13"];
	for (const part of parts) {
		const data = await import(`./seed/${part}.json`);
		await orm.insert(schema.questions).values(data.default.questions);
		await orm.insert(schema.answers).values(data.default.answers);
	}
}
