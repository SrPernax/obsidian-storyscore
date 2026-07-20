import { App, Notice } from 'obsidian';
import { StoryScorePaths } from '../utils/paths';
import {TrackData} from "../data/track-data";
import { t } from "../../locales/i18n";

export async function createTrackFile(app: App, data: TrackData, baseFolder: string): Promise<void> {
	
	const paths = StoryScorePaths.getPaths(baseFolder);
	const folderExists = app.vault.getAbstractFileByPath(paths.tracks);

	if (!folderExists) {
		const baseExists = app.vault.getAbstractFileByPath(paths.root);
		if (!baseExists) await app.vault.createFolder(paths.root);
		await app.vault.createFolder(paths.tracks);
	}

	const uniqueId = "SS-" + Math.random().toString(36).substring(2, 7);

	const leitmotifsYaml = data.leitmotifs && data.leitmotifs.length > 0
		? `\nleitmotifs:\n${data.leitmotifs.map(lm => `  - "[[${lm}]]"`).join('\n')}`
		: '';

	const fileContent = `---
id: ${uniqueId}
album_id: "${data.albumId}"
title: "${data.title}"
description: "${data.description}"
type: "${data.type}"
diegetic: "${data.diegetic}"
status: "${data.status}"
audio: "[[${data.audio}]]"${leitmotifsYaml}
---
                   
# 🎵 ${data.title}
                   
> ${data.description || 'Sin descripción.'}
                   
### Reproductor
\`\`\`storyscore
id: ${uniqueId}
\`\`\`

### Letra
${data.lyrics || '*Instrumental / Sin letra definida.*'}
`;

	const safeFileName = data.title.replace(/[\\/:"*?<>|]/g, '');
	const filePath = `${paths.tracks}/${safeFileName}.md`;

	try {
		await app.vault.create(filePath, fileContent);
		new Notice(t('TRACK_SAVE_NOTICE', data.title));
	} catch (error) {
		new Notice(t('ERROR_SAVE_TRACK'));
		throw error;
	}
}

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
				frontmatter.leitmotifs = data.leitmotifs.map(lm => `[[${lm}]]`);
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
