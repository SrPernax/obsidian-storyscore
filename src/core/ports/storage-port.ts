export interface RawNoteEntry {
	path: string;
	basename: string;
	frontmatter?: Record<string, unknown>;
}

export interface IStoryScoreStorage {
	listNotesInFolder(folderPath: string): RawNoteEntry[];
	ensureFolder(folderPath: string): Promise<void>;
	createNote(filePath: string, content: string): Promise<void>;
	updateNote(
		filePath: string,
		frontmatterUpdater: (frontmatter: Record<string, unknown>) => void,
		bodyUpdater?: (content: string) => string,
	): Promise<void>;
	deleteNote(filePath: string): Promise<void>;
}
