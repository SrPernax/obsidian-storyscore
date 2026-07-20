import { App, Notice } from 'obsidian';
import { StoryScorePaths } from '../utils/paths';
import { SoundtrackData } from "../data/soundtrack-data";
import { t } from "../../locales/i18n";

export async function createSoundtrackFile(app: App, data: SoundtrackData, baseFolder: string): Promise<void> {

	const paths = StoryScorePaths.getPaths(baseFolder);
	const folderExists = app.vault.getAbstractFileByPath(paths.soundtracks);

	if (!folderExists) {
		const baseExists = app.vault.getAbstractFileByPath(paths.root);
		if (!baseExists) await app.vault.createFolder(paths.root);
		await app.vault.createFolder(paths.soundtracks);
	}

	const uniqueId = "ST-" + Math.random().toString(36).substring(2, 7);

	const coverField = data.cover ? `\ncover: "[[${data.cover}]]"` : '';
	const fileContent = `---
id: ${uniqueId}
title: "${data.title}"
description: "${data.description}"${coverField}
---
                   
# 🎵 ${data.title}
                   
> ${data.description || 'Sin descripción.'}


`;

	const safeFileName = data.title.replace(/[\\/:"*?<>|]/g, '');
	const filePath = `${paths.soundtracks}/${safeFileName}.md`;

	try {
		await app.vault.create(filePath, fileContent);
		new Notice(t('OST_SAVE_NOTICE', data.title));
	} catch (error) {
		new Notice(t('ERROR_SAVE_OST'));
		throw error;
	}
}
