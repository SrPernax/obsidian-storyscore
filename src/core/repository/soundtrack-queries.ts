import { App, TFile } from "obsidian";
import { SoundtrackResult } from "../models/soundtrack-result";
import { getSoundtrackFiles } from "./file-queries";

export function getSoundtracks(app: App, baseFolder: string): SoundtrackResult[] {

	const soundtrackFiles = getSoundtrackFiles(app, baseFolder);

	return soundtrackFiles.map((file: TFile) => {
		const cache = app.metadataCache.getFileCache(file);
		const fm = cache?.frontmatter;
		const frontmatterId = (fm?.id as string) || file.path;

		return {
			file: file,
			id: frontmatterId,
			title: (fm?.title as string) || file.basename,
			description: fm?.description as string | undefined,
			cover: fm?.cover as string | undefined
		};
	});
}
