import { StoryScorePaths } from '../constants/paths';
import { SoundtrackData } from '../models/soundtrack-data';
import { buildSoundtrackMarkdown, generateId, safeFileName } from '../parsing/markdown-templates';
import { IStoryScoreStorage } from '../ports/storage-port';

export async function createSoundtrackFile(
	storage: IStoryScoreStorage,
	data: SoundtrackData,
	baseFolder: string,
): Promise<string> {
	const paths = StoryScorePaths.getPaths(baseFolder);
	await storage.ensureFolder(paths.root);
	await storage.ensureFolder(paths.soundtracks);

	const uniqueId = generateId('ST', 5);
	const fileContent = buildSoundtrackMarkdown(uniqueId, data);
	const filePath = `${paths.soundtracks}/${safeFileName(data.title)}.md`;

	await storage.createNote(filePath, fileContent);
	return filePath;
}
