import { App, Editor, FuzzySuggestModal } from 'obsidian';
import { TrackItem } from '../../../core/models/track-item';
import { formatCodeBlock } from '../../../core/parsing/codeblock-parser';
import { getAllTracks } from '../../../core/repository/track-queries';
import { t } from '../../../localization';
import type StoryScorePlugin from '../../../main';

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
		const tracks = getAllTracks(this.plugin.storage, baseFolder);
		return tracks.map(t => ({ id: t.id, name: t.title }));
	}

	getItemText(item: TrackItem): string {
		return item.name;
	}

	onChooseItem(item: TrackItem, _evt: MouseEvent | KeyboardEvent) {
		this.editor.replaceSelection(formatCodeBlock(item.id));
	}
}
