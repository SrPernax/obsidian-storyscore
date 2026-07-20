import { App, Modal, Notice, Setting, TFile } from 'obsidian';
import { getSoundtracks } from "../core/queries/soundtrack-queries";
import { createTrackFile } from "../core/commands/createtrack";
import { updateTrackFile } from "../core/commands/updatetrack";
import { getAudioFiles, getLeitmotifFiles } from "../core/queries/file-queries";
import {FilesSuggestModal} from "../core/utils/suggests";
import { t } from "../locales/lenguajes";
import { TRACK_TYPES, TRACK_STATUSES } from "../core/utils/constants";
import type StoryScorePlugin from "../main";

export class NewTrackModal extends Modal {
	trackTitle: string;
	trackDescription: string;
	trackType: string = "ambient";
	trackLyrics: string = "";
	trackStatus: string = "wip";
	trackDiegesis: string = "n/a";
	customTrackType: string = "";
	selectedAlbumId: string = "none";

	trackAudio: string = "";
	trackCover: string = "";
	associatedLeitmotifs: string[] = [];

	constructor(app: App, public existingFile: TFile | undefined, public plugin: StoryScorePlugin) {
		super(app);
		this.trackTitle = "";
		this.trackDescription = "";
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		if (this.existingFile) {
			const cache = this.app.metadataCache.getFileCache(this.existingFile);
			const fm = cache?.frontmatter;
			if (fm) {
				this.trackTitle = fm.title || "";
				this.trackDescription = fm.description || "";
				this.trackType = fm.type || "ambient";
				this.trackDiegesis = fm.diegetic || "n/a";
				this.trackStatus = fm.status || "wip";
				this.trackAudio = fm.audio?.replace(/^\[\[|\]\]$/g, '') || "";
				this.selectedAlbumId = fm.album_id || "none";
				this.associatedLeitmotifs = fm.leitmotifs?.map((l: string) => l.replace(/^\[\[|\]\]$/g, '')) || [];
				
				if (!['ambient', 'character', 'action', 'ui'].includes(this.trackType)) {
					this.customTrackType = this.trackType;
					this.trackType = "custom";
				}
			}
		}

		const baseFolder = this.plugin.settings.baseFolder || 'StoryScore';

		const ostList = getSoundtracks(this.app, baseFolder);
		const audioFiles = getAudioFiles(this.app);
		const leitmotifFiles = getLeitmotifFiles(this.app, baseFolder);


		if (audioFiles.length === 0) {
			contentEl.createEl('h2', { text: t('LM_NO_AUDIO_TITLE') || 'Hold on!' });
			contentEl.createEl('p', { text: t('LM_NO_AUDIO_DESC') || 'You have no audio files in your vault. Please add one before starting.' });

			new Setting(contentEl)
				.addButton(btn => btn
					.setButtonText(t('CLOSE') || 'Close')
					.onClick(() => this.close())
				);
			return;
		}



		contentEl.createEl('h2', { text: this.existingFile ? t('TRACK_EDIT_TITLE') : t('TRACK_ADD_TITLE') });
		
		const mainHeader = contentEl.createEl('h5', { text: t('TRACK_MAIN_SECTION') });
		mainHeader.style.color = 'var(--text-muted)';
		mainHeader.style.marginBottom = '10px';

		new Setting(contentEl)
			.setName(t('TRACK_TITLE'))
			.addText(text => {
				text.setPlaceholder(t('TRACK_TITLE_PLACEHOLDER'));
				text.setValue(this.trackTitle);
				text.onChange((value) => {
					this.trackTitle = value;
				});
			});

		new Setting(contentEl)
			.setName(t('TRACK_DESC'))
			.addText(text => {
				text.setPlaceholder(t('TRACK_DESC_PLACEHOLDER'));
				text.setValue(this.trackDescription);
				text.onChange((value) => {
					this.trackDescription = value;
				});
			});

		let audioInputComponent: any;

		new Setting(contentEl)
			.setName(t('TRACK_AUDIO'))
			.setDesc(t('TRACK_AUDIO_DESC'))

			.addText(text => {
				audioInputComponent = text;
				text.setPlaceholder(t('TRACK_AUDIO_PLACEHOLDER'));
				text.setDisabled(true);
				if (this.trackAudio) {
					text.setValue(this.trackAudio);
				}
			})
			
			.addButton(btn => btn
				.setButtonText(t('SEARCH'))
				.onClick(() => {

					new FilesSuggestModal(this.app, audioFiles, t('TRACK_AUDIO_DESC'), (selectedFile) => {
						this.trackAudio = selectedFile.name;
						audioInputComponent.setValue(selectedFile.name);
					}).open();
				})
			);
		
		new Setting(contentEl)
			.setName(t('TRACK_ALBUM'))
			.setDesc(t('TRACK_ALBUM_DESC'))
			.addDropdown(dropdown => {
				dropdown.addOption('none', t('TRACK_ALBUM_NONE'));
				ostList.forEach(ost => {
					dropdown.addOption(ost.id, ost.title);
				});
				dropdown.setValue(this.selectedAlbumId);
				dropdown.onChange(value => {
					this.selectedAlbumId = value;
				});
			});

		const secondaryHeader = contentEl.createEl('h5', { text: t('TRACK_SECONDARY_SECTION') });
		secondaryHeader.style.color = 'var(--text-muted)';
		secondaryHeader.style.marginTop = '20px';
		secondaryHeader.style.marginBottom = '10px';

		new Setting(contentEl)
			.setName(t('TRACK_TYPE'))
			.addDropdown(dropDown => {
				TRACK_TYPES.forEach(type => {
					dropDown.addOption(type.id, t(type.labelKey as any));
				});
				dropDown.setValue(this.trackType)
				.onChange((value) => {
					this.trackType = value;
					if (value === 'custom') {
						customTypeSetting.settingEl.show();
					} else {
						customTypeSetting.settingEl.hide();
					}
				})
			});

		const customTypeSetting = new Setting(contentEl)
			.setName(t('TRACK_TYPE_SPECIFY'))
			.setDesc(t('TRACK_TYPE_SPECIFY_DESC'))
			.addText(text => {
				text.setPlaceholder(t('TRACK_TYPE_SPECIFY_PLACEHOLDER'));
				if (this.customTrackType) text.setValue(this.customTrackType);
				text.onChange((value) => {
					this.customTrackType = value;
				});
			});

		if (this.trackType !== 'custom') {
			customTypeSetting.settingEl.hide();
		}

		if (!this.existingFile) {
			new Setting(contentEl)
				.setName(t('TRACK_LYRICS'))
				.setDesc(t('TRACK_LYRICS_DESC'))
				.addTextArea(textArea => {
					textArea.setPlaceholder(t('TRACK_LYRICS_PLACEHOLDER'));
					textArea.inputEl.rows = 6;
					textArea.inputEl.cols = 30;
					textArea.onChange((value) => {
						this.trackLyrics = value;
					});
				});
		}

		new Setting(contentEl)
			.setName(t('TRACK_STATUS'))
			.addDropdown(dropDown => {
				TRACK_STATUSES.forEach(status => {
					dropDown.addOption(status.id, t(status.labelKey as any));
				});
				dropDown.setValue(this.trackStatus)
				.onChange((value) => {
					this.trackStatus = value;
				})
			});

		new Setting(contentEl)
			.setName(t('TRACK_DIEGESIS'))
			.setDesc(t('TRACK_DIEGESIS_DESC'))
			.addDropdown(dropDown => dropDown
				.addOption('diegetic', t('TRACK_DIEGESIS_IN'))
				.addOption('non-diegetic', t('TRACK_DIEGESIS_OUT'))
				.addOption('n/a', t('TRACK_DIEGESIS_MIXED'))
				.setValue(this.trackDiegesis)
				.onChange((value) => {
					this.trackDiegesis = value;
				}));

		let leitmotifContainer: HTMLElement;
		new Setting(contentEl)
			.setName(t('TRACK_LEITMOTIFS'))
			.setDesc(t('TRACK_LEITMOTIFS_DESC'))
			.addButton(btn => btn
				.setButtonText(t('SEARCH'))
				.onClick(() => {
					if (leitmotifFiles.length === 0) {
						new Notice(t('TRACK_ERR_NO_LEITMOTIFS'));
						return;
					}
					new FilesSuggestModal(this.app, leitmotifFiles, t('TRACK_LEITMOTIFS_PLACEHOLDER'), (selectedFile) => {
						if (!this.associatedLeitmotifs.includes(selectedFile.basename)) {
							this.associatedLeitmotifs.push(selectedFile.basename);
							this.renderLeitmotifs(leitmotifContainer);
						}
					}).open();
				})
			);

		leitmotifContainer = contentEl.createEl('div');
		leitmotifContainer.style.display = "flex";
		leitmotifContainer.style.flexWrap = "wrap";
		leitmotifContainer.style.gap = "5px";
		leitmotifContainer.style.marginBottom = "15px";
		this.renderLeitmotifs(leitmotifContainer);

		new Setting(contentEl)
			.addButton(btn => btn
				.setButtonText(this.existingFile ? t('UPDATE') : t('SAVE'))
				.setCta()
				.onClick(async () => {

					if (this.trackTitle.trim() === "") {
						new Notice(t('TRACK_ERR_TITLE'));
						return;
					}

					if (this.trackAudio.trim() === "") {
						new Notice(t('TRACK_ERR_AUDIO'));
						return;
					}

					const trackData = {
						title: this.trackTitle,
						description: this.trackDescription,
						type: this.trackType === 'custom' ? this.customTrackType : this.trackType,
						lyrics: this.trackLyrics,
						status: this.trackStatus,
						diegetic: this.trackDiegesis,
						albumId: this.selectedAlbumId,
						audio: this.trackAudio,
						cover: this.trackCover,
						leitmotifs: this.associatedLeitmotifs
					};

					try {
						const baseFolder = this.plugin.settings.baseFolder || 'StoryScore';

						if (this.existingFile) {
							await updateTrackFile(this.app, this.existingFile, trackData);
						} else {
							await createTrackFile(this.app, trackData, baseFolder);
						}

						this.close();
					} catch (e) {
					}
				}));
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}

	renderLeitmotifs(container: HTMLElement) {
		container.empty();
		this.associatedLeitmotifs.forEach((lm, index) => {
			const pill = container.createEl('span', { text: lm });
			pill.style.backgroundColor = "var(--interactive-accent)";
			pill.style.color = "var(--text-on-accent)";
			pill.style.padding = "4px 10px";
			pill.style.borderRadius = "12px";
			pill.style.fontSize = "0.85em";
			pill.style.display = "flex";
			pill.style.alignItems = "center";
			pill.style.gap = "6px";

			const removeBtn = pill.createEl('span', { text: 'x' });
			removeBtn.style.cursor = "pointer";
			removeBtn.style.fontWeight = "bold";
			removeBtn.style.opacity = "0.7";
			removeBtn.onclick = () => {
				this.associatedLeitmotifs.splice(index, 1);
				this.renderLeitmotifs(container);
			};
			removeBtn.onmouseenter = () => removeBtn.style.opacity = "1";
			removeBtn.onmouseleave = () => removeBtn.style.opacity = "0.7";
		});
	}
}
