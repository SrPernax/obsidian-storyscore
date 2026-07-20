import { App, Notice } from 'obsidian';
import { TrackData } from "../dtos/track-data";
import { t } from "../../locales/lenguajes";

export async function updateTrackFile(app: App, file: any, data: TrackData): Promise<void> {
	try {
		await app.fileManager.processFrontMatter(file, (frontmatter) => {
			frontmatter.album_id = data.albumId;
			frontmatter.title = data.title;
			frontmatter.description = data.description;
			frontmatter.type = data.type;
			frontmatter.diegetic = data.diegetic;
			frontmatter.status = data.status;
			frontmatter.audio = `[[${data.audio}]]`;
			
			if (data.leitmotifs && data.leitmotifs.length > 0) {
				frontmatter.leitmotifs = data.leitmotifs.map((lm: string) => `[[${lm}]]`);
			} else {
				delete frontmatter.leitmotifs;
			}
		});
		new Notice(t('TRACK_UPDATE_NOTICE', data.title));
	} catch (error) {
		new Notice(t('ERROR_UPDATE_TRACK'));
		console.error(error);
		throw error;
	}
}
