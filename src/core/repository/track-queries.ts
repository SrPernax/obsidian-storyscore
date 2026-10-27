import { App } from 'obsidian';
import { getTrackFiles } from './file-queries';
import { TrackResult } from '../models/track-result';
import { NO_ALBUM_ID } from '../constants/taxonomy';

export function getAllTracks(app: App, baseFolder: string): TrackResult[] {
	const trackFiles = getTrackFiles(app, baseFolder);

	return trackFiles.map(file => {
		const cache = app.metadataCache.getFileCache(file);
		const frontmatter = cache?.frontmatter;

		return {
			file: file,
			id: (frontmatter?.id as string) || file.path,
			title: (frontmatter?.title as string) || file.basename,
			description: (frontmatter?.description as string),
			albumId: (frontmatter?.album_id as string) || NO_ALBUM_ID,
			audio: (frontmatter?.audio as string),
			type: (frontmatter?.type as string) || "",
			status: (frontmatter?.status as string) || "",
			lyrics: (frontmatter?.lyrics as string),
			diegesis: (frontmatter?.diegetic as string),
			leitmotifs: (frontmatter?.leitmotifs as string[]) || []
		};
	}).sort((a, b) => a.title.localeCompare(b.title));
}

export function getTrackById(app: App, baseFolder: string, trackId: string): TrackResult | undefined {
	const allTracks = getAllTracks(app, baseFolder);
	return allTracks.find(t => t.id === trackId);
}
