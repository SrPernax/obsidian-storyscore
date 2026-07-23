import { App, Notice, TFile } from "obsidian";
import { t } from "../../locales/lenguajes";
import { ConfirmDeleteModal } from "./confirm-delete";
import type StoryScorePlugin from "../../main";

export interface InformationControlProps {
	app: App;
	plugin: StoryScorePlugin;
	containerEl: HTMLElement;
	file: TFile;
	id: string;
	title: string;
	onEdit: () => void;
	onCloseModal: () => void;
	onDelete?: () => void;
}

export class InformationControl {
	constructor(props: InformationControlProps) {
		const buttonsBox = props.containerEl.createDiv({ cls: "storyscore-info-buttons" });

		const btnEdit = buttonsBox.createEl("button", { text: t('INFO_EDIT'), cls: "storyscore-info-btn" });
		btnEdit.onclick = () => {
			props.onCloseModal();
			props.onEdit();
		};

		const btnMd = buttonsBox.createEl("button", { text: t('INFO_MODAL_MD'), cls: "storyscore-info-btn" });
		btnMd.onclick = () => {
			props.onCloseModal();
			props.app.workspace.getLeaf(false).openFile(props.file);
		};

		const btnCopyId = buttonsBox.createEl("button", { text: t('INFO_MODAL_COPY_ID'), cls: "storyscore-info-btn" });
		btnCopyId.onclick = () => {
			navigator.clipboard.writeText(props.id).then(() => {
				new Notice(t('INFO_MODAL_COPIED_ID'));
			});
		};

		const btnDelete = buttonsBox.createEl("button", { text: t('INFO_DELETE'), cls: "storyscore-info-btn mod-warning" });
		btnDelete.onclick = () => {
			props.onCloseModal();

			if (props.onDelete) {
				props.onDelete();
			} else {
				new ConfirmDeleteModal(props.app, props.file, props.title).open();
			}
		};
	}
}
