import { App, Notice, TFile } from 'obsidian';
import { SoundtrackData } from "../dtos/soundtrack-data";
import { t } from "../../locales/lenguajes";

export async function updateSoundtrackFile(app: App, file: TFile, data: SoundtrackData): Promise<void> {
	try {
		await app.fileManager.processFrontMatter(file, (frontmatter: Record<string, unknown>) => {
			frontmatter['title'] = data.title;
			frontmatter['description'] = data.description;
			
			if (data.cover) {
				frontmatter['cover'] = `[[${data.cover}]]`;
			} else {
				delete frontmatter['cover'];
			}
		});
		new Notice(t('OST_SAVE_NOTICE', data.title)); // Using the same notice or we could create an update one.
	} catch (error) {
		new Notice(t('ERROR_SAVE_OST'));
		console.error(error);
		throw error;
	}
}
