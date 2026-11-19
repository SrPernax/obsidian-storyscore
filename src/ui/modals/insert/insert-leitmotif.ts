import { App, Editor, FuzzySuggestModal } from 'obsidian';
import { formatCodeBlock } from '../../../core/parsing/codeblock-parser';
import { getLeitmotifs } from '../../../core/repository/leitmotif-queries';
import { t } from '../../../localization';
import type StoryScorePlugin from '../../../main';

export interface LeitmotifItem {
	id: string;
	name: string;
}

export class LeitmotifInsertModal extends FuzzySuggestModal<LeitmotifItem> {
	editor: Editor;

	constructor(app: App, editor: Editor, public plugin: StoryScorePlugin) {
		super(app);
		this.editor = editor;
		this.setPlaceholder(t('INSERT_LM_PLACEHOLDER') || 'Escribe el nombre del leitmotif...');
		this.emptyStateText = t('INSERT_LM_EMPTY') || 'No se encontraron leitmotifs.';
	}

	getItems(): LeitmotifItem[] {
		const baseFolder = this.plugin.settings.baseFolder || 'StoryScore';
		const lms = getLeitmotifs(this.plugin.storage, baseFolder);
		return lms.map(l => ({ id: l.id, name: l.title }));
	}

	getItemText(item: LeitmotifItem): string {
		return item.name;
	}

	onChooseItem(item: LeitmotifItem, _evt: MouseEvent | KeyboardEvent) {
		this.editor.replaceSelection(formatCodeBlock(item.id));
	}
}
