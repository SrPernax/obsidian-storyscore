import { App, Notice, TFile } from 'obsidian';
import { LeitmotifData } from "../dtos/leitmotif-data";
import { t } from "../../locales/lenguajes";

export async function updateLeitmotifFile(app: App, file: TFile, data: LeitmotifData): Promise<void> {
	try {
		await app.fileManager.processFrontMatter(file, (frontmatter: Record<string, unknown>) => {
			frontmatter['title'] = data.title;
			frontmatter['description'] = data.description;
			frontmatter['entity_type'] = data.entityType;
			if (data.entityType === 'custom' && data.customEntityType) {
				frontmatter['custom_entity_type'] = data.customEntityType;
			} else {
				delete frontmatter['custom_entity_type'];
			}
			frontmatter['motif_type'] = data.motifType;
			frontmatter['color'] = data.color;
			frontmatter['musical_annotations'] = data.musicalAnnotations;
			
			if (data.entityNote) {
				frontmatter['entity_note'] = `[[${data.entityNote}]]`;
			} else {
				delete frontmatter['entity_note'];
			}
			
			if (data.audio) {
				frontmatter['audio'] = `[[${data.audio}]]`;
			} else {
				delete frontmatter['audio'];
			}
		});
		new Notice(t('LM_SAVE_NOTICE', data.title)); 
	} catch (error) {
		new Notice(t('ERROR_SAVE_LM'));
		console.error(error);
		throw error;
	}
}
