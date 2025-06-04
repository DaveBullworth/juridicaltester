import { openDB } from "idb";
import type { Database } from "sql.js";

// сохранить SQLite базу в IndexedDB
export async function saveDbToIndexedDB(db: Database) {
	const binary = db.export();
	const idb = await openDB("TesterApp", 1, {
		upgrade(db) {
			if (!db.objectStoreNames.contains("sqlite")) {
				db.createObjectStore("sqlite");
			}
		}
	});
	await idb.put("sqlite", binary, "main");
}

// загрузить SQLite базу из IndexedDB
export async function loadDbFromIndexedDB(): Promise<Uint8Array | null> {
	const idb = await openDB("TesterApp", 1);
	return await idb.get("sqlite", "main");
}
