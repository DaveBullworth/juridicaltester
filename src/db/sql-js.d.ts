declare module "sql.js" {
	// Конфигурация для initSqlJs, с опцией locateFile
	interface InitSqlJsConfig {
		locateFile?: (file: string) => string;
	}

	// Статический интерфейс, описывающий экспорт из sql.js
	interface SqlJsStatic {
		Database: new (data?: Uint8Array) => Database;
	}

	// Интерфейс объекта базы данных и его методы
	interface Database {
		run(sql: string, params?: unknown[]): void; // выполнить запрос без результата (INSERT, UPDATE)
		exec(sql: string): unknown[]; // выполнить запрос с результатом (SELECT)
		prepare(sql: string): unknown; // подготовить запрос с плейсхолдерами
		export(): Uint8Array; // экспортировать текущую БД в бинарный формат
		close(): void; // закрыть БД, очистить память
	}

	// Функция инициализации модуля sql.js
	function initSqlJs(config?: InitSqlJsConfig): Promise<SqlJsStatic>;

	// По умолчанию экспортируем initSqlJs
	export default initSqlJs;
}
