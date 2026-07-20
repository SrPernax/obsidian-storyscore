import { App } from 'obsidian';
import { getTrackFiles } from './file-queries';
import { TrackResult } from '../results/track-result';

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
			albumId: (frontmatter?.album_id as string) || "none",
			audio: (frontmatter?.audio as string),
			type: (frontmatter?.type as string) || "Desconocido",
			status: (frontmatter?.status as string) || "Sin estado"
		};
	}).sort((a, b) => a.title.localeCompare(b.title));
}

export function getTrackById(app: App, baseFolder: string, trackId: string): TrackResult | undefined {
	const allTracks = getAllTracks(app, baseFolder);
	return allTracks.find(t => t.id === trackId);
}
