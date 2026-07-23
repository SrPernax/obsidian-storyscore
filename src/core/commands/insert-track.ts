import { App, Editor, FuzzySuggestModal } from 'obsidian';
import { getAllTracks } from "../queries/track-queries";
import { t } from "../../locales/lenguajes";
import type StoryScorePlugin from "../../main";

import { TrackItem } from "../dtos/track-item";
export class TrackInsertModal extends FuzzySuggestModal<TrackItem> {
	editor: Editor;

	constructor(app: App, editor: Editor, public plugin: StoryScorePlugin) {
		super(app);
		this.editor = editor;
		this.setPlaceholder(t('INSERT_PLACEHOLDER'));
		this.emptyStateText = t('INSERT_EMPTY');
	}

	getItems(): TrackItem[] {
		const baseFolder = this.plugin.settings.baseFolder || 'StoryScore';
		const tracks = getAllTracks(this.app, baseFolder);
		return tracks.map(t => ({ id: t.id, name: t.title }));
	}

	getItemText(item: TrackItem): string {
		return item.name;
	}

	onChooseItem(item: TrackItem, evt: MouseEvent | KeyboardEvent) {
		const textToInsert = `\n\`\`\`storyscore\nid: ${item.id}\n\`\`\`\n`;

		this.editor.replaceSelection(textToInsert);
	}
}
