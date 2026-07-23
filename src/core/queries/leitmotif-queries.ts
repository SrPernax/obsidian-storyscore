import { App, TFile } from "obsidian";
import { LeitmotifResult } from "../results/leitmotif-result";
import { getLeitmotifFiles } from "./file-queries";

export function getLeitmotifs(app: App, baseFolder: string): LeitmotifResult[] {
	const leitmotifFiles = getLeitmotifFiles(app, baseFolder);

	return leitmotifFiles.map((file: TFile) => {
		const cache = app.metadataCache.getFileCache(file);
		const fm = cache?.frontmatter;
		const frontmatterId = (fm?.id as string) || file.path;

		return {
			file: file,
			id: frontmatterId,
			title: (fm?.title as string) || file.basename,
			description: fm?.description as string | undefined,
			entityType: fm?.entity_type as string | undefined,
			entityNote: fm?.entity_note as string | undefined,
			motifType: fm?.motif_type as string | undefined,
			audio: fm?.audio as string | undefined,
			musicalAnnotations: fm?.musical_annotations as string || "",
			color: fm?.color as string | undefined,
			customEntityType: fm?.custom_entity_type as string | undefined
		};
	});
}

export function getLeitmotifById(app: App, baseFolder: string, id: string): LeitmotifResult | undefined {
	const allLeitmotifs = getLeitmotifs(app, baseFolder);
	return allLeitmotifs.find(lm => lm.id === id || lm.file.basename === id || lm.title === id);
}
