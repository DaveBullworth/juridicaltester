import { sql, eq, inArray, asc, count } from "drizzle-orm";
import { initDb } from "./init";
import { topics, modules, questions, answers } from "./schema";

// обработчик запросов для сущности "Темы"
export class TopicsService {
	// Для получения всех тем на главном меню
	static async getAll(page = 1, limit = 10) {
		const db = await initDb();

		// Сначала получаем все темы
		const rawTopics = await db
			.select()
			.from(topics)
			.orderBy(asc(topics.order))
			.limit(limit)
			.offset((page - 1) * limit);

		// Для каждой темы считаем общее количество вопросов
		const topicsWithQuestionCounts = await Promise.all(
			rawTopics.map(async topic => {
				// Получаем модули этой темы
				const rawModules = await db
					.select({ id: modules.id })
					.from(modules)
					.where(eq(modules.topicId, topic.id));

				// Получаем общее число вопросов по всем модулям темы
				const totalQuestionCount = await Promise.all(
					rawModules.map(async mod => {
						const [{ count: moduleQuestionCount }] = await db
							.select({ count: count() })
							.from(questions)
							.where(eq(questions.moduleId, mod.id));

						return moduleQuestionCount;
					})
				).then(counts => counts.reduce((sum, c) => sum + c, 0));

				return {
					...topic,
					questionCount: totalQuestionCount
				};
			})
		);

		return topicsWithQuestionCounts;
	}

	// Для получения модулей одной темы при переходе на конкретную тему
	static async getOneWithModules(themeId: number) {
		const db = await initDb();

		const theme = await db.select().from(topics).where(eq(topics.id, themeId));

		const rawModules = await db
			.select()
			.from(modules)
			.where(eq(modules.topicId, themeId))
			.orderBy(asc(modules.order));

		// Для каждого модуля — получаем количество вопросов
		const modulesWithCounts = await Promise.all(
			rawModules.map(async mod => {
				const [{ count: questionCount }] = await db
					.select({ count: count() })
					.from(questions)
					.where(eq(questions.moduleId, mod.id));

				return {
					...mod,
					questionCount
				};
			})
		);

		return { theme: theme[0], modules: modulesWithCounts };
	}
}

// обработчик запросов для сущности "Модули"
export class ModuleService {
	// Для получения опроса по определенному модулю
	static async getOneWithQuestionsAndAnswers(moduleId: number) {
		const db = await initDb();
		const module = await db.select().from(modules).where(eq(modules.id, moduleId));
		const relatedQuestions = await db
			.select()
			.from(questions)
			.where(eq(questions.moduleId, moduleId))
			.orderBy(sql`RANDOM()`); // случайный порядок

		const questionIds = relatedQuestions.map(q => q.id);
		const relatedAnswers =
			questionIds.length > 0
				? await db
						.select()
						.from(answers)
						.where(inArray(answers.questionId, questionIds))
						.orderBy(sql`RANDOM()`)
				: [];

		return {
			module: module[0],
			questions: relatedQuestions.map(q => ({
				...q,
				answers: relatedAnswers.filter(a => a.questionId === q.id)
			}))
		};
	}
}

// обработчик запросов для опросов по 1 и более темам
export class RandomService {
	// Для получения опроса по определенной теме в нужном кол-ве
	static async getRandomByTheme(themeId: number, count: number) {
		const db = await initDb();
		const relatedModules = await db.select().from(modules).where(eq(modules.topicId, themeId));
		const moduleIds = relatedModules.map(m => m.id);
		const allQuestions =
			moduleIds.length > 0
				? await db.select().from(questions).where(inArray(questions.moduleId, moduleIds))
				: [];

		const shuffled = allQuestions.sort(() => 0.5 - Math.random()).slice(0, count);
		const questionIds = shuffled.map(q => q.id);
		const relatedAnswers =
			questionIds.length > 0
				? await db
						.select()
						.from(answers)
						.where(inArray(answers.questionId, questionIds))
						.orderBy(sql`RANDOM()`)
				: [];

		return shuffled.map(q => ({
			...q,
			answers: relatedAnswers.filter(a => a.questionId === q.id)
		}));
	}

	// Для получения опроса по определенным темам в нужном кол-ве
	static async getRandomGlobal(count: number, themeIds?: number[]) {
		const db = await initDb();
		const filteredtopics =
			themeIds && themeIds.length > 0
				? await db.select().from(topics).where(inArray(topics.id, themeIds))
				: await db.select().from(topics);

		const themeIdsActual = filteredtopics.map(t => t.id);
		const relatedModules = await db
			.select()
			.from(modules)
			.where(inArray(modules.topicId, themeIdsActual));
		const moduleIds = relatedModules.map(m => m.id);
		const allQuestions =
			moduleIds.length > 0
				? await db.select().from(questions).where(inArray(questions.moduleId, moduleIds))
				: [];

		const shuffled = allQuestions.sort(() => 0.5 - Math.random()).slice(0, count);
		const questionIds = shuffled.map(q => q.id);
		const relatedAnswers =
			questionIds.length > 0
				? await db
						.select()
						.from(answers)
						.where(inArray(answers.questionId, questionIds))
						.orderBy(sql`RANDOM()`)
				: [];

		return shuffled.map(q => ({
			...q,
			answers: relatedAnswers.filter(a => a.questionId === q.id)
		}));
	}
}
