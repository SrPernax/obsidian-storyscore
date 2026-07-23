import { App, Modal, Notice, Setting, TextComponent, TFile } from 'obsidian';
import { getAudioFiles, getMarkdownFiles } from '../../core/queries/file-queries';
import { FilesSuggestModal } from '../../core/utils/suggests';
import { createLeitmotifFile } from '../../core/commands/create-leitmotif';
import { updateLeitmotifFile } from '../../core/commands/update-leitmotif';
import { t } from '../../locales/lenguajes';
import { LM_TYPES } from '../../core/utils/constants';
import type StoryScorePlugin from '../../main';

export class NewLeitmotifModal extends Modal {
	motifTitle: string = "";
	motifDescription: string = "";
	entityType: string = "Character";
	entityNote: string = "";
	motifAudio: string = "";
	motifType: string = "Melodic motif";
	customEntityType: string = "";
	musicalAnnotations: string = "";
	motifColor: string = "#808080";

	constructor(app: App, public fileToEdit: TFile | null = null, public plugin: StoryScorePlugin) {
		super(app);
	}

	onOpen() {
		if (this.fileToEdit) {
			const cache = this.app.metadataCache.getFileCache(this.fileToEdit);
			const fm = cache?.frontmatter;
			if (fm) {
				this.motifTitle = (fm.title as string) || this.fileToEdit.basename;
				this.motifDescription = (fm.description as string) || "";
				this.entityType = (fm.entity_type as string) || "Character";
				this.motifType = (fm.motif_type as string) || "Melodic motif";
				
				let entityNoteStr = fm.entity_note as string;
				if (entityNoteStr && entityNoteStr.startsWith("[[") && entityNoteStr.endsWith("]]")) {
					entityNoteStr = entityNoteStr.substring(2, entityNoteStr.length - 2);
				}
				this.entityNote = entityNoteStr || "";
				
				let audioStr = fm.audio as string;
				if (audioStr && audioStr.startsWith("[[") && audioStr.endsWith("]]")) {
					audioStr = audioStr.substring(2, audioStr.length - 2);
				}
				this.motifAudio = audioStr || "";
                this.musicalAnnotations = (fm.musical_annotations as string) || "";
                this.customEntityType = (fm.custom_entity_type as string) || "";
                this.motifColor = (fm.color as string) || "#808080";
			}
		}

		const { contentEl } = this;
		contentEl.empty();

		const audioFiles = getAudioFiles(this.app);
		const markdownFiles = getMarkdownFiles(this.app);

		if (audioFiles.length === 0) {
			contentEl.createEl('h2', { text: t('LM_NO_AUDIO_TITLE') });
			contentEl.createEl('p', { text: t('LM_NO_AUDIO_DESC') });

			new Setting(contentEl)
				.addButton(btn => btn
					.setButtonText(t('CLOSE'))
					.onClick(() => this.close())
				);
			return;
		}

		contentEl.createEl('h2', { text: this.fileToEdit ? t('LM_EDIT_TITLE') : t('LM_ADD_TITLE') });

		new Setting(contentEl)
			.setName(t('LM_NAME'))
			.setDesc(t('LM_NAME_DESC'))
			.addText(text => text
				.setValue(this.motifTitle)
				.setPlaceholder(t('LM_NAME_PLACEHOLDER'))
				.onChange((value) => {
					this.motifTitle = value;
				}));

		new Setting(contentEl)
			.setName(t('LM_DESC'))
			.setDesc(t('LM_DESC_DESC'))
			.addTextArea(textArea => {
				textArea.setValue(this.motifDescription);
				textArea.setPlaceholder(t('LM_DESC_PLACEHOLDER'));
				textArea.inputEl.rows = 4;
				textArea.inputEl.cols = 30;
				textArea.onChange((value) => {
					this.motifDescription = value;
				});
			});

		new Setting(contentEl)
			.setName(t('LM_ENTITY_TYPE'))
			.setDesc(t('LM_ENTITY_DESC'))
			.addDropdown(dropdown => dropdown
				.addOption('Character', t('LM_ENTITY_CHAR'))
				.addOption('Place', t('LM_ENTITY_PLACE'))
				.addOption('Item', t('LM_ENTITY_ITEM'))
				.addOption('Event', t('LM_ENTITY_EVENT'))
				.addOption('Feeling', t('LM_ENTITY_FEELING'))
				.addOption('Memory', t('LM_ENTITY_MEMORY'))
				.addOption('custom', t("LM_ENTITY_CUSTOM"))
				.setValue(this.entityType)
				.onChange(value => {
					this.entityType = value;
					if (value === 'custom') {
						customTypeSetting.settingEl.show();
					} else {
						customTypeSetting.settingEl.hide();
					}
				})
			);

		const customTypeSetting = new Setting(contentEl)
			.setName(t('LM_ENTITY_CUSTOM_NAME'))
			.setDesc(t('LM_ENTITY_CUSTOM_DESC'))
			.addText(text => {
				text.setPlaceholder(t('LM_ENTITY_CUSTOM_PLACEHOLDER'));
				if (this.customEntityType) text.setValue(this.customEntityType);
				text.onChange((value) => {
					this.customEntityType = value;
				});
			});

		if (this.entityType !== 'custom') {
			customTypeSetting.settingEl.hide();
		}

		let noteInputComponent: TextComponent;
		new Setting(contentEl)
			.setName(t('LM_ENTITY_NOTE'))
			.setDesc(t('LM_ENTITY_NOTE_DESC'))
			.addText(text => {
				noteInputComponent = text;
				text.setValue(this.entityNote);
				text.setPlaceholder(t('LM_ENTITY_NOTE_PLACEHOLDER'));
				text.setDisabled(true);
			})
			.addButton(btn => btn
				.setButtonText(t('SEARCH'))
				.onClick(() => {
					new FilesSuggestModal(this.app, markdownFiles, t('LM_ENTITY_NOTE'), (selectedFile) => {
						this.entityNote = selectedFile.basename;
						noteInputComponent.setValue(selectedFile.basename);
					}).open();
				})
			);

		let audioInputComponent: TextComponent;
		new Setting(contentEl)
			.setName(t('LM_AUDIO'))
			.setDesc(t('LM_AUDIO_DESC'))
			.addText(text => {
				audioInputComponent = text;
				text.setValue(this.motifAudio);
				text.setPlaceholder(t('LM_AUDIO_PLACEHOLDER'));
				text.setDisabled(true);
			})
			.addButton(btn => btn
				.setButtonText(t('SEARCH'))
				.onClick(() => {
					new FilesSuggestModal(this.app, audioFiles, t('LM_AUDIO'), (selectedFile) => {
						this.motifAudio = selectedFile.name;
						audioInputComponent.setValue(selectedFile.name);
					}).open();
				})
			);

		new Setting(contentEl)
			.setName(t('LM_TYPE'))
			.setDesc(t('LM_TYPE_DESC'))
			.addDropdown(dropdown => {
				LM_TYPES.forEach(type => {
					dropdown.addOption(type.id, t(type.labelKey as Parameters<typeof t>[0]));
				});
				dropdown.setValue(this.motifType)
				.onChange(value => {
					this.motifType = value;
				})
			});

		new Setting(contentEl)
			.setName(t('LM_NOTES'))
			.setDesc(t('LM_NOTES_DESC'))
			.addTextArea(textArea => {
				textArea.setValue(this.musicalAnnotations);
				textArea.setPlaceholder(t('LM_NOTES_PLACEHOLDER'));
				textArea.inputEl.rows = 4;
				textArea.inputEl.cols = 30;
				textArea.onChange((value) => {
					this.musicalAnnotations = value;
				});
			});

		new Setting(contentEl)
			.setName(t('LM_COLOR'))
			.setDesc(t('LM_COLOR_DESC'))
			.addColorPicker(color => color
				.setValue(this.motifColor)
				.onChange(value => {
					this.motifColor = value;
				})
			);

		new Setting(contentEl)
			.addButton(btn => btn
				.setButtonText(t('LM_SAVE_BTN'))
				.setCta()
				.onClick(async () => {
					if (this.motifTitle.trim() === "") {
						new Notice(t('LM_ERR_NAME'));
						return;
					}

					const leitmotifData = {
						title: this.motifTitle,
						description: this.motifDescription,
						entityType: this.entityType,
						entityNote: this.entityNote,
						audio: this.motifAudio,
						motifType: this.motifType,
						musicalAnnotations: this.musicalAnnotations,
						customEntityType: this.customEntityType,
						color: this.motifColor
					};

					try {
                        if (this.fileToEdit) {
                            await updateLeitmotifFile(this.app, this.fileToEdit, leitmotifData);
                        } else {
                            const baseFolder = this.plugin.settings.baseFolder || 'StoryScore';
                            await createLeitmotifFile(this.app, leitmotifData, baseFolder);
                        }
						this.close();
					} catch (e) {
						console.error(e);
					}
				})
			);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
