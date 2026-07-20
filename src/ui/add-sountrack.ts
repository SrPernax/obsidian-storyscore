import {App, Modal, Notice, Setting} from 'obsidian';
import {createSoundtrackFile} from "../core/commands/createsoundtrack";
import {FilesSuggestModal} from "../core/utils/suggests";
import {getAudioFiles, getImageFiles} from "../core/queries/file-queries";
import {t} from "../locales/i18n";
import type StoryScorePlugin from "../main";

export class NewSoundtrackModal extends Modal {
	trackTitle: string;
	trackDescription: string;
	trackCover: string;

	constructor(app: App, public plugin: StoryScorePlugin) {
		super(app);
		this.trackTitle = "";
		this.trackDescription = "";
		this.trackCover = "";
	}
	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		let imageInputComponent: any;

		const imageFiles = getImageFiles(this.app);

		contentEl.createEl('h2', { text: t('OST_ADD_TITLE') });

		new Setting(contentEl)
			.setName(t('OST_NAME'))
			.addText(text => text
				.setPlaceholder(t('OST_NAME_PLACEHOLDER'))
				.onChange((value) => {
					this.trackTitle = value;
				}));

		new Setting(contentEl)
			.setName(t('OST_DESC'))
			.addText(text => text
				.setPlaceholder(t('OST_DESC_PLACEHOLDER'))
				.onChange((value) => {
					this.trackDescription = value;
				}));

		new Setting(contentEl)
			.setName(t('OST_COVER'))
			.setDesc(t('OST_COVER_DESC'))
			.addText(text => {
				imageInputComponent = text;
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
						const baseFolder = this.plugin.settings.baseFolder || 'StoryScore';

						await createSoundtrackFile(this.app, soundtrackData, baseFolder);

						this.close();
					} catch (e) {
					}
				}));
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
