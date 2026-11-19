import { App, Editor, FuzzySuggestModal } from 'obsidian';
import { formatCodeBlock } from '../../../core/parsing/codeblock-parser';
import { getSoundtracks } from '../../../core/repository/soundtrack-queries';
import { t } from '../../../localization';
import type StoryScorePlugin from '../../../main';

export interface SoundtrackItem {
	id: string;
	name: string;
}

export class SoundtrackInsertModal extends FuzzySuggestModal<SoundtrackItem> {
	editor: Editor;

	constructor(app: App, editor: Editor, public plugin: StoryScorePlugin) {
		super(app);
		this.editor = editor;
		this.setPlaceholder(t('INSERT_OST_PLACEHOLDER') || 'Escribe el nombre del soundtrack para insertarlo...');
		this.emptyStateText = t('INSERT_OST_EMPTY') || 'No se encontraron soundtracks.';
	}

	getItems(): SoundtrackItem[] {
		const baseFolder = this.plugin.settings.baseFolder || 'StoryScore';
		const soundtracks = getSoundtracks(this.plugin.storage, baseFolder);
		return soundtracks.map(s => ({ id: s.id, name: s.title }));
	}

	getItemText(item: SoundtrackItem): string {
		return item.name;
	}

	onChooseItem(item: SoundtrackItem, _evt: MouseEvent | KeyboardEvent) {
		this.editor.replaceSelection(formatCodeBlock(item.id));
	}
}
