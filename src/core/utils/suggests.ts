import { App, FuzzySuggestModal, TFile } from 'obsidian';

export class FilesSuggestModal extends FuzzySuggestModal<TFile> {
	audioFiles: TFile[];
	onChoose: (file: TFile) => void;

	constructor(app: App, audioFiles: TFile[], barText: string, onChoose: (file: TFile) => void) {
		super(app);
		this.audioFiles = audioFiles;
		this.onChoose = onChoose;
		this.setPlaceholder(barText);
	}

	getItems(): TFile[] {
		return this.audioFiles;
	}
	
	getItemText(item: TFile): string {
		return item.path;
	}
	
	onChooseItem(item: TFile, evt: MouseEvent | KeyboardEvent) {
		this.onChoose(item);
	}
}
