import { App, Modal, Notice } from 'obsidian';
import { LeitmotifResult } from '../../core/results/leitmotif-result';
import type StoryScorePlugin from '../../main';
import { t } from '../../locales/lenguajes';
import { NewLeitmotifModal } from '../creators/add-leitmotif';
import { ConfirmDeleteModal } from '../components/confirm-delete';
import { InformationControl } from '../components/information-control';

export class LeitmotifInfoModal extends Modal {
	lm: LeitmotifResult;
	plugin: StoryScorePlugin;

	constructor(app: App, lm: LeitmotifResult, plugin: StoryScorePlugin) {
		super(app);
		this.lm = lm;
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		this.modalEl.addClass("storyscore-track-info-modal");

		if (this.lm.color) {
			contentEl.style.background = `radial-gradient(250px 120px at center, ${this.lm.color}22 0%, transparent 100%)`;
		}

		// Re-agregamos el título que se borró por error al poner el degradado
		const titleStr = t('INFO_MODAL_TITLE').replace('TRACK', 'LEITMOTIF').replace('TRACK', 'LEITMOTIF');
		contentEl.createEl("h2", { text: titleStr, cls: "storyscore-info-title" });
		contentEl.createEl("hr", { cls: "storyscore-info-separator" });

		const scrollContainer = contentEl.createDiv({ cls: "storyscore-info-scrollable" });

		scrollContainer.createEl("p").createEl("strong", { text: this.lm.title });
		
		if (this.lm.description) {
			scrollContainer.createEl("p", { text: this.lm.description });
		}
		
		
		if (this.lm.entityType) {
			const entityP = scrollContainer.createEl("p");
			entityP.createEl("strong", { text: "Entity Type: " });
			entityP.appendText(this.lm.entityType === 'custom' && this.lm.customEntityType ? this.lm.customEntityType : this.lm.entityType);
			
			if (this.lm.entityNote) {
				entityP.appendText(" - ");
				const noteName = this.lm.entityNote.replace(/[[\]]/g, '');
				entityP.createEl("a", { text: noteName, cls: "internal-link" }, (link) => {
					link.onclick = (e) => {
						e.preventDefault();
						this.app.workspace.openLinkText(noteName, this.lm.file.path, true);
						this.close();
					};
				});
			}
		}

		if (this.lm.motifType) {
			const motifP = scrollContainer.createEl("p");
			motifP.createEl("strong", { text: "Motif Type: " });
			motifP.appendText(this.lm.motifType);
		}
		
		const bottomSection = scrollContainer.createDiv({ cls: "storyscore-info-bottom-section", attr: { style: "margin-top: 20px;" } });

		const leftPanel = bottomSection.createDiv({ cls: "storyscore-info-left-panel", attr: { style: "min-height: 100px;" } });
		const rightPanel = bottomSection.createDiv({ cls: "storyscore-info-right-panel", attr: { style: "min-height: 100px;" } });

		leftPanel.createEl("strong", { text: t('INFO_DESC') });
		leftPanel.createDiv({ text: this.lm.description, cls: "storyscore-info-panel-value" });

		rightPanel.createEl("strong", { text: t('LM_NOTES') });
		rightPanel.createDiv({ text: this.lm.musicalAnnotations });
		
		if (this.lm.audio) {
			contentEl.createEl("hr", { cls: "storyscore-info-separator" });
			
			const audioElement = contentEl.createEl("audio", { cls: "storyscore-track-audio storyscore-info-audio" });
			audioElement.setAttribute("controls", "true");
			audioElement.style.width = "100%";
			audioElement.style.marginTop = "5px";
			
			let audioPath = this.lm.audio;
			if (audioPath.startsWith("[[") && audioPath.endsWith("]]")) {
				audioPath = audioPath.substring(2, audioPath.length - 2);
			}

			const audioFile = this.app.metadataCache.getFirstLinkpathDest(audioPath, "");
			if (audioFile) {
				audioElement.src = this.app.vault.getResourcePath(audioFile);
			}
		}

		contentEl.createEl("hr", { cls: "storyscore-info-separator" });
		new InformationControl({
			app: this.app,
			plugin: this.plugin,
			containerEl: contentEl,
			file: this.lm.file,
			id: this.lm.id,
			title: this.lm.title,
			onEdit: () => new NewLeitmotifModal(this.app, this.lm.file, this.plugin).open(),
			onCloseModal: () => this.close()
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
