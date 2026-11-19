import { StoryScorePaths } from '../constants/paths';
import { TrackData } from '../models/track-data';
import { buildTrackMarkdown, generateId, safeFileName } from '../parsing/markdown-templates';
import { IStoryScoreStorage } from '../ports/storage-port';

export async function createTrackFile(
	storage: IStoryScoreStorage,
	data: TrackData,
	baseFolder: string,
): Promise<string> {
	const paths = StoryScorePaths.getPaths(baseFolder);
	await storage.ensureFolder(paths.root);
	await storage.ensureFolder(paths.tracks);

	const uniqueId = generateId('SS', 5);
	const fileContent = buildTrackMarkdown(uniqueId, data);
	const filePath = `${paths.tracks}/${safeFileName(data.title)}.md`;

	await storage.createNote(filePath, fileContent);
	return filePath;
}
