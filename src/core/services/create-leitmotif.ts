import { StoryScorePaths } from '../constants/paths';
import { LeitmotifData } from '../models/leitmotif-data';
import { buildLeitmotifMarkdown, generateId, safeFileName } from '../parsing/markdown-templates';
import { IStoryScoreStorage } from '../ports/storage-port';

export async function createLeitmotifFile(
	storage: IStoryScoreStorage,
	data: LeitmotifData,
	baseFolder: string,
): Promise<string> {
	const paths = StoryScorePaths.getPaths(baseFolder);
	await storage.ensureFolder(paths.root);
	await storage.ensureFolder(paths.leitmotifs);

	const uniqueId = generateId('LM', 7);
	const fileContent = buildLeitmotifMarkdown(uniqueId, data);
	const filePath = `${paths.leitmotifs}/${safeFileName(data.title)}.md`;

	await storage.createNote(filePath, fileContent);
	return filePath;
}
