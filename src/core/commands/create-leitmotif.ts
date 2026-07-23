import { App, Notice } from 'obsidian';
import { StoryScorePaths } from '../utils/paths';
import { LeitmotifData } from "../dtos/leitmotif-data";
import { t } from "../../locales/lenguajes";

export async function createLeitmotifFile(app: App, data: LeitmotifData, baseFolder: string): Promise<void> {
	
	const paths = StoryScorePaths.getPaths(baseFolder);
	const folderExists = app.vault.getAbstractFileByPath(paths.leitmotifs);

	if (!folderExists) {
		const baseExists = app.vault.getAbstractFileByPath(paths.root);
		if (!baseExists) await app.vault.createFolder(paths.root);
		await app.vault.createFolder(paths.leitmotifs);
	}

	const uniqueId = "LM-" + Math.random().toString(36).substring(2, 9);
	const entityNoteLink = data.entityNote ? `"[[${data.entityNote}]]"` : '""';
	const audioLink = data.audio ? `"[[${data.audio}]]"` : '""';

	const fileContent = `---
id: ${uniqueId}
title: "${data.title}"
description: "${data.description}"
entity_type: "${data.entityType}"
${data.entityType === 'custom' && data.customEntityType ? `custom_entity_type: "${data.customEntityType}"\n` : ''}entity_note: ${entityNoteLink}
motif_type: "${data.motifType}"
audio: ${audioLink}
color: "${data.color}"
musical_annotations: ${JSON.stringify(data.musicalAnnotations || "")}
---
                   
# 🎵 Leitmotif: ${data.title}
                   
> ${data.description || 'No narrative description.'}
                   
**Associated Entity:** ${data.entityType === 'custom' && data.customEntityType ? data.customEntityType : data.entityType} ${data.entityNote ? `([[${data.entityNote}]])` : ''}
**Motif Type:** ${data.motifType}

### Player
\`\`\`storyscore
id: ${uniqueId}
\`\`\`

### Musical Annotations
${data.musicalAnnotations || '*No annotations.*'}
`;
	const safeFileName = data.title.replace(/[\\/:"*?<>|]/g, '');
	const filePath = `${paths.leitmotifs}/${safeFileName}.md`;

	try {
		await app.vault.create(filePath, fileContent);
		new Notice(t('LM_SAVE_NOTICE', data.title));
	} catch (error) {
		new Notice(t('ERROR_SAVE_LM'));
		throw error;
	}
}
