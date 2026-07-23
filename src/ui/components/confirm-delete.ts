import { App, Modal, Notice, TFile } from 'obsidian';
import { t } from '../../locales/lenguajes';

export class ConfirmDeleteModal extends Modal {
    constructor(
        app: App, 
        public file: TFile, 
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
                await this.app.fileManager.trashFile(this.file);
                new Notice(t('CARD_DELETED_NOTICE', this.itemName));
            }
            this.close();
        };
    }

    onClose() {
        this.contentEl.empty();
    }
}
