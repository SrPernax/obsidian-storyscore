import { App, TFile } from "obsidian";
import { SoundtrackResult } from "../results/soundtrack-result";
import { getSoundtrackFiles } from "./file-queries";

export function getSoundtracks(app: App, baseFolder: string): SoundtrackResult[] {

	const soundtrackFiles = getSoundtrackFiles(app, baseFolder);

	return soundtrackFiles.map((file: TFile) => {
		const cache = app.metadataCache.getFileCache(file);
		const frontmatterId = cache?.frontmatter?.id || file.path;

		return {
			file: file,
			id: frontmatterId,
			title: cache?.frontmatter?.title || file.basename,
			cover: cache?.frontmatter?.cover
		};
	});
}

export function SoundtracksExist(app: App, baseFolder: string): boolean {
	const soundtracks = getSoundtracks(app, baseFolder);
	return soundtracks.length > 0;
}

export function getSoundtrackById(app: App, baseFolder: string, soundtrackId: string): SoundtrackResult | undefined {
	const allSoundtracks = getSoundtracks(app, baseFolder);
	return allSoundtracks.find(s => s.id === soundtrackId);
}
