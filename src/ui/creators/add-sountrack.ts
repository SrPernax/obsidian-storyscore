import { App, Modal, Notice, Setting, TextComponent, TFile } from 'obsidian';
import { createSoundtrackFile } from "../../core/commands/create-soundtrack";
import { updateSoundtrackFile } from "../../core/commands/update-soundtrack";
import {FilesSuggestModal} from "../../core/utils/suggests";
import {getImageFiles} from "../../core/queries/file-queries";
import {t} from "../../locales/lenguajes";
import type StoryScorePlugin from "../../main";

export class NewSoundtrackModal extends Modal {
	trackTitle: string;
	trackDescription: string;
	trackCover: string;

	constructor(app: App, public fileToEdit: TFile | null = null, public plugin: StoryScorePlugin) {
		super(app);
		this.trackTitle = "";
		this.trackDescription = "";
		this.trackCover = "";
	}
	onOpen() {
		if (this.fileToEdit) {
			const cache = this.app.metadataCache.getFileCache(this.fileToEdit);
			const fm = cache?.frontmatter;
			if (fm) {
				this.trackTitle = (fm.title as string) || this.fileToEdit.basename;
				this.trackDescription = (fm.description as string) || "";
				let coverStr = fm.cover as string;
				if (coverStr && coverStr.startsWith("[[") && coverStr.endsWith("]]")) {
					coverStr = coverStr.substring(2, coverStr.length - 2);
				}
				this.trackCover = coverStr || "";
			}
		}

		const { contentEl } = this;
		contentEl.empty();

		let imageInputComponent: TextComponent;

		const imageFiles = getImageFiles(this.app);

		contentEl.createEl('h2', { text: this.fileToEdit ? t('OST_EDIT_TITLE') : t('OST_ADD_TITLE') });

		new Setting(contentEl)
			.setName(t('OST_NAME'))
			.addText(text => text
				.setValue(this.trackTitle)
				.setPlaceholder(t('OST_NAME_PLACEHOLDER'))
				.onChange((value) => {
					this.trackTitle = value;
				}));

		new Setting(contentEl)
			.setName(t('OST_DESC'))
			.addText(text => text
				.setValue(this.trackDescription)
				.setPlaceholder(t('OST_DESC_PLACEHOLDER'))
				.onChange((value) => {
					this.trackDescription = value;
				}));

		new Setting(contentEl)
			.setName(t('OST_COVER'))
			.setDesc(t('OST_COVER_DESC'))
			.addText(text => {
				imageInputComponent = text;
				text.setValue(this.trackCover);
				text.setPlaceholder(t('OST_COVER_PLACEHOLDER'));
				text.setDisabled(true);
			})
			.addButton(btn => btn
				.setButtonText(t('SEARCH'))
				.onClick(() => {
					new FilesSuggestModal(this.app, imageFiles, t('OST_SEARCH_COVER'), (selectedFile) => {
						this.trackCover = selectedFile.name;
						imageInputComponent.setValue(selectedFile.name);
					}).open();
				})
			);

		new Setting(contentEl)
			.addButton(btn => btn
				.setButtonText(t('SAVE'))
				.setCta()
				.onClick(async () => {

					if (this.trackTitle.trim() === "") {
						new Notice(t('OST_ERR_NAME'));
						return;
					}

					const soundtrackData = {
						title: this.trackTitle,
						description: this.trackDescription,
						cover: this.trackCover 
					};

					try {
						if (this.fileToEdit) {
							await updateSoundtrackFile(this.app, this.fileToEdit, soundtrackData);
						} else {
							const baseFolder = this.plugin.settings.baseFolder || 'StoryScore';
							await createSoundtrackFile(this.app, soundtrackData, baseFolder);
						}
						this.close();
					} catch (e) {
						console.error(e);
					}
				}));
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
