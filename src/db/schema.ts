import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
// import { relations } from "drizzle-orm";

// Тема
export const topics = sqliteTable("topics", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	// Название
	title: text("title").notNull(),
	// Порядковый номер
	order: integer("order").notNull()
});

// Модуль
export const modules = sqliteTable("modules", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	// Название
	title: text("title").notNull(),
	// Порядковый номер
	order: integer("order").notNull(),
	// Ссылка на таблицу "Тема"
	topicId: integer("topic_id")
		.notNull()
		.references(() => topics.id, { onDelete: "cascade" })
});

// Вопрос
export const questions = sqliteTable("questions", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	// Текст
	text: text("text").notNull(),
	// Порядковый номер
	order: integer("order").notNull(),
	// Ссылка на таблицу "Модуль"
	moduleId: integer("module_id")
		.notNull()
		.references(() => modules.id, { onDelete: "cascade" })
});

// Ответ
export const answers = sqliteTable("answers", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	// Текст
	text: text("text").notNull(),
	// Порядковый номер
	order: integer("order").notNull(),
	// Правильный ли ответ или нет
	isCorrect: integer("is_correct", { mode: "boolean" }).notNull(),
	// Ссылка на таблицу "Вопрос"
	questionId: integer("question_id")
		.notNull()
		.references(() => questions.id, { onDelete: "cascade" })
});
