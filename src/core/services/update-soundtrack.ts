import { SoundtrackData } from '../models/soundtrack-data';
import { applySoundtrackFrontmatter } from '../parsing/frontmatter';
import { IStoryScoreStorage } from '../ports/storage-port';

export async function updateSoundtrackFile(
	storage: IStoryScoreStorage,
	filePath: string,
	data: SoundtrackData,
): Promise<void> {
	await storage.updateNote(filePath, (frontmatter) => applySoundtrackFrontmatter(frontmatter, data));
}
