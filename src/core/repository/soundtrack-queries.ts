import { StoryScorePaths } from '../constants/paths';
import { SoundtrackResult } from '../models/soundtrack-result';
import { soundtrackResultFromEntry } from '../parsing/frontmatter';
import { IStoryScoreStorage } from '../ports/storage-port';

export function getSoundtracks(storage: IStoryScoreStorage, baseFolder: string): SoundtrackResult[] {
	const paths = StoryScorePaths.getPaths(baseFolder);
	const entries = storage.listNotesInFolder(paths.soundtracks);

	return entries.map(soundtrackResultFromEntry);
}

export function getSoundtrackById(storage: IStoryScoreStorage, baseFolder: string, id: string): SoundtrackResult | undefined {
	const allSoundtracks = getSoundtracks(storage, baseFolder);
	return allSoundtracks.find(ost => ost.id === id || ost.basename === id || ost.title === id);
}
