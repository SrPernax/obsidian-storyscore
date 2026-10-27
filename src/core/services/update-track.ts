import { App, Notice, TFile } from 'obsidian';
import { TrackData } from "../models/track-data";
import { t } from "../../i18n";

const H1 = '#';
const NO_DESCRIPTION = '';
const NO_LYRICS = 'No lyrics defined'

export async function updateTrackFile(app: App, file: TFile, data: TrackData): Promise<void> {
	try {
		await app.fileManager.processFrontMatter(file, (frontmatter: Record<string, unknown>) => {
			frontmatter['album_id'] = data.albumId;
			frontmatter['title'] = data.title;
			frontmatter['description'] = data.description;
			frontmatter['type'] = data.type;
			frontmatter['diegetic'] = data.diegetic;
			frontmatter['status'] = data.status;
			frontmatter['lyrics'] = data.lyrics;
			frontmatter['audio'] = `[[${data.audio}]]`;

			if (data.leitmotifs && data.leitmotifs.length > 0) {
				frontmatter['leitmotifs'] = data.leitmotifs.map((lm: string) => `[[${lm}]]`);
			} else {
				delete frontmatter['leitmotifs'];
			}
		});
		await app.vault.process(file, (content => updateBody(content, data)))
		new Notice(t('TRACK_UPDATE_NOTICE', data.title));
	} catch (error) {
		new Notice(t('ERROR_UPDATE_TRACK'));
		console.error(error);
		throw error;
	}
}

function updateBody(content: string, data: TrackData): string {
	if (!content.includes(H1)) return content;

	return content
		.replace(
			/^#\s+🎵.*?(?:\n+>[^\n]*)?/m,
			`${H1} ${data.title}\n\n> ${data.description || NO_DESCRIPTION}`,
	)
		.replace(
			/(^###\s+Lyrics\s*$)[\s\S]*$/m,
			`$1\n${data.lyrics || NO_LYRICS}\n`,
		);
}
