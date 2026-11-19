import { App, TFile } from 'obsidian';
import { AUDIO_EXTENSIONS, IMAGE_EXTENSIONS, StoryScorePaths } from '../core/constants/paths';
import { IStoryScoreStorage, RawNoteEntry } from '../core/ports/storage-port';

export class ObsidianStorageAdapter implements IStoryScoreStorage {
	constructor(private app: App) {}

	listNotesInFolder(folderPath: string): RawNoteEntry[] {
		const files = this.app.vault.getMarkdownFiles().filter(file => file.path.startsWith(folderPath));
		return files.map(file => {
			const cache = this.app.metadataCache.getFileCache(file);
			return {
				path: file.path,
				basename: file.basename,
				frontmatter: cache?.frontmatter as Record<string, unknown> | undefined,
			};
		});
	}

	async ensureFolder(folderPath: string): Promise<void> {
		const existing = this.app.vault.getAbstractFileByPath(folderPath);
		if (!existing) {
			await this.app.vault.createFolder(folderPath);
		}
	}

	async createNote(filePath: string, content: string): Promise<void> {
		await this.app.vault.create(filePath, content);
	}

	async updateNote(
		filePath: string,
		frontmatterUpdater: (frontmatter: Record<string, unknown>) => void,
		bodyUpdater?: (content: string) => string,
	): Promise<void> {
		const file = this.getTFileByPath(filePath);
		if (!file) {
			throw new Error(`Note not found: ${filePath}`);
		}

		await this.app.fileManager.processFrontMatter(file, frontmatterUpdater);

		if (bodyUpdater) {
			await this.app.vault.process(file, bodyUpdater);
		}
	}

	async deleteNote(filePath: string): Promise<void> {
		const file = this.getTFileByPath(filePath);
		if (file) {
			await this.app.fileManager.trashFile(file);
		}
	}

	getTFileByPath(filePath: string): TFile | null {
		const abstractFile = this.app.vault.getAbstractFileByPath(filePath);
		return abstractFile instanceof TFile ? abstractFile : null;
	}
}

export function getTFileByPath(app: App, filePath: string): TFile | null {
	const abstractFile = app.vault.getAbstractFileByPath(filePath);
	return abstractFile instanceof TFile ? abstractFile : null;
}

export function openNoteByPath(app: App, filePath: string, newLeaf = false): void {
	const file = getTFileByPath(app, filePath);
	if (file) {
		void app.workspace.getLeaf(newLeaf).openFile(file);
	}
}

export function getMarkdownFiles(app: App): TFile[] {
	return app.vault.getMarkdownFiles();
}

export function getLeitmotifFiles(app: App, baseFolder: string): TFile[] {
	const paths = StoryScorePaths.getPaths(baseFolder);
	return app.vault.getMarkdownFiles().filter(file => file.path.startsWith(paths.leitmotifs));
}

export function getAudioFiles(app: App): TFile[] {
	const allowed = new Set<string>(AUDIO_EXTENSIONS);
	return app.vault.getFiles().filter(file => allowed.has(file.extension.toLowerCase()));
}

export function getImageFiles(app: App): TFile[] {
	const allowed = new Set<string>(IMAGE_EXTENSIONS);
	return app.vault.getFiles().filter(file => allowed.has(file.extension.toLowerCase()));
}
