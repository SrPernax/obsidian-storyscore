import { StoryScorePaths } from '../constants/paths';
import { TrackResult } from '../models/track-result';
import { trackResultFromEntry } from '../parsing/frontmatter';
import { IStoryScoreStorage } from '../ports/storage-port';

export function getAllTracks(storage: IStoryScoreStorage, baseFolder: string): TrackResult[] {
	const paths = StoryScorePaths.getPaths(baseFolder);
	const entries = storage.listNotesInFolder(paths.tracks);

	return entries
		.map(trackResultFromEntry)
		.sort((a, b) => a.title.localeCompare(b.title));
}

export function getTrackById(storage: IStoryScoreStorage, baseFolder: string, trackId: string): TrackResult | undefined {
	const allTracks = getAllTracks(storage, baseFolder);
	return allTracks.find(t => t.id === trackId);
}
