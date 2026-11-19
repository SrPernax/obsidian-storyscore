import { TrackData } from '../models/track-data';
import { applyTrackFrontmatter } from '../parsing/frontmatter';
import { updateTrackBody } from '../parsing/markdown-templates';
import { IStoryScoreStorage } from '../ports/storage-port';

export async function updateTrackFile(
	storage: IStoryScoreStorage,
	filePath: string,
	data: TrackData,
): Promise<void> {
	await storage.updateNote(
		filePath,
		(frontmatter) => applyTrackFrontmatter(frontmatter, data),
		(content) => updateTrackBody(content, data),
	);
}
