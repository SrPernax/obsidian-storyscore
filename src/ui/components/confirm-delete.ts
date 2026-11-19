import { App, Modal, Notice } from 'obsidian';
import { getTFileByPath } from '../../adapters/obsidian-storage';
import { t } from '../../i18n';

export class ConfirmDeleteModal extends Modal {
	constructor(
		app: App,
		public filePath: string,
		public itemName: string,
		public onConfirm?: () => Promise<void>
	) {
		super(app);
	}

	onOpen() {
		const { contentEl, titleEl } = this;
		titleEl.setText(t('CARD_DELETE_TITLE'));

		contentEl.createEl("p", { text: t('CARD_DELETE_CONFIRM', this.itemName) });

		const btnContainer = contentEl.createDiv({ cls: "storyscore-modal-buttons" });

		const cancelBtn = btnContainer.createEl("button", { text: t('CANCEL') });
		cancelBtn.onclick = () => this.close();

		const confirmBtn = btnContainer.createEl("button", { text: t('DELETE'), cls: "mod-warning" });
		confirmBtn.onclick = async () => {
			if (this.onConfirm) {
				await this.onConfirm();
			} else {
				const file = getTFileByPath(this.app, this.filePath);
				if (file) {
					await this.app.fileManager.trashFile(file);
				}
				new Notice(t('CARD_DELETED_NOTICE', this.itemName));
			}
			this.close();
		};
	}

	onClose() {
		this.contentEl.empty();
	}
}
