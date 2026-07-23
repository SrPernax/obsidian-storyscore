import { App, Notice } from 'obsidian';
import { StoryScorePaths } from '../utils/paths';
import {TrackData} from "../dtos/track-data";
import { t } from "../../locales/lenguajes";

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
lyrics: ${JSON.stringify(data.lyrics || '')}
audio: "[[${data.audio}]]"${leitmotifsYaml}
---
                   
# 🎵 ${data.title}
                   
> ${data.description || 'No description.'}
                   
### Player
\`\`\`storyscore
id: ${uniqueId}
\`\`\`

### Lyrics
${data.lyrics || '*Instrumental / No lyrics defined.*'}
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

