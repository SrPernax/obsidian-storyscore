import { LeitmotifData } from '../models/leitmotif-data';
import { applyLeitmotifFrontmatter } from '../parsing/frontmatter';
import { IStoryScoreStorage } from '../ports/storage-port';

export async function updateLeitmotifFile(
	storage: IStoryScoreStorage,
	filePath: string,
	data: LeitmotifData,
): Promise<void> {
	await storage.updateNote(filePath, (frontmatter) => applyLeitmotifFrontmatter(frontmatter, data));
}
