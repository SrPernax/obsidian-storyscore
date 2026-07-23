import { App, Modal, Notice } from 'obsidian';
import { SoundtrackResult } from '../../core/results/soundtrack-result';
import type StoryScorePlugin from '../../main';
import { t } from '../../locales/lenguajes';
import { NewSoundtrackModal } from '../creators/add-sountrack';
import { getAllTracks } from '../../core/queries/track-queries';
import { renderTrackCard } from '../cards/track-card';
import { ConfirmDeleteModal } from '../components/confirm-delete';
import { InformationControl } from '../components/information-control';
import NsLogo from '../../../assets/plugin/ns-logo.svg';

export class SoundtrackInfoModal extends Modal {
	ost: SoundtrackResult;
	plugin: StoryScorePlugin;

	constructor(app: App, ost: SoundtrackResult, plugin: StoryScorePlugin) {
		super(app);
		this.ost = ost;
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		this.modalEl.addClass("storyscore-track-info-modal");
		
		this.modalEl.style.width = "800px";
		this.modalEl.style.maxWidth = "90vw";
		
		contentEl.style.display = "flex";
		contentEl.style.flexDirection = "column";
		contentEl.style.overflow = "hidden";
		contentEl.style.height = "85vh";

		contentEl.createEl("h2", { text: t('OST_INFO_TITLE'), cls: "storyscore-info-title", attr: { style: "flex-shrink: 0;" } });

		contentEl.createEl("hr", { cls: "storyscore-info-separator", attr: { style: "flex-shrink: 0;" } });

		const topSection = contentEl.createDiv({ attr: { style: "display: flex; gap: 30px; align-items: center; margin-bottom: 20px; flex-shrink: 0;" } });
		
		const leftCol = topSection.createDiv({ attr: { style: "flex-shrink: 0;" } });
		const rightCol = topSection.createDiv({ attr: { style: "flex-grow: 1; display: flex; flex-direction: column; gap: 4px;" } });

		const imgDiv = leftCol.createDiv({ attr: { style: "text-align: center;" } });
		const imgEl = imgDiv.createEl("img", { attr: { style: "max-width: 400px; max-height: 400px; object-fit: cover; border-radius: 12px; box-shadow: 0 8px 16px rgba(0,0,0,0.3);" } });

		let hasCover = false;

		if (this.ost.cover) {
			let coverPath = this.ost.cover;
			if (coverPath.startsWith("[[") && coverPath.endsWith("]]")) {
				coverPath = coverPath.substring(2, coverPath.length - 2);
			}
			const imageFile = this.app.metadataCache.getFirstLinkpathDest(coverPath, "");
			if (imageFile) {
				imgEl.src = this.app.vault.getResourcePath(imageFile);
				hasCover = true;
			}
		}

		if (!hasCover) {
			imgEl.src = `data:image/svg+xml;base64,${NsLogo}`;
			imgEl.style.width = "200px";
			imgEl.style.height = "200px";
			imgEl.style.boxShadow = "none";
		}
		
		leftCol.createEl("p", { text: this.ost.id, attr: { style: "font-size: 13px; font-family: monospace; color: var(--text-muted); text-align: center; margin-top: 5px;" } });
		
		rightCol.createEl("h3", { text: this.ost.title, attr: { style: "margin: 0; font-size: 1.5em; font-weight: bold;" } });
		
		if (this.ost.description) {
			rightCol.createEl("p", { text: this.ost.description, attr: { style: "margin: 0; font-size: 1.1em;" } });
		}
		
		const baseFolder = this.plugin.settings.baseFolder || 'StoryScore';
		const allTracks = getAllTracks(this.app, baseFolder);
		const linkedTracks = allTracks.filter(t => t.albumId === this.ost.id);

		if (linkedTracks.length > 0) {
			contentEl.createEl("hr", { cls: "storyscore-info-separator", attr: { style: "flex-shrink: 0;" } });
			contentEl.createEl("h3", { text: "Tracks (" + linkedTracks.length + ")", attr: { style: "margin-top: 0; flex-shrink: 0;" } });
			
			const tracksScroll = contentEl.createDiv({ attr: { style: "flex: 1; min-height: 0; overflow-y: auto; padding-right: 10px;" } });
			const tracksContainer = tracksScroll.createDiv({ attr: { style: "display: flex; flex-direction: column; gap: 10px;" } });
			
			for (const track of linkedTracks) {
				const trackDiv = tracksContainer.createDiv();
				renderTrackCard(trackDiv, track, this.ost, this.app, this.plugin);
			}
		}

		const footerDiv = contentEl.createDiv({ attr: { style: "flex-shrink: 0; margin-top: auto;" } });
		footerDiv.createEl("hr", { cls: "storyscore-info-separator" });

		new InformationControl({
			app: this.app,
			plugin: this.plugin,
			containerEl: footerDiv,
			file: this.ost.file,
			id: this.ost.id,
			title: this.ost.title,
			onEdit: () => new NewSoundtrackModal(this.app, this.ost.file, this.plugin).open(),
			onCloseModal: () => this.close(),
			onDelete: () => {
				const baseFolder = this.plugin.settings.baseFolder || 'StoryScore';
				const allTracks = getAllTracks(this.app, baseFolder);
				const linkedTracks = allTracks.filter(t => t.albumId === this.ost.id);

				if (linkedTracks.length === 0) {
					new ConfirmDeleteModal(this.app, this.ost.file, this.ost.title).open();
				} else {
					const modal = new Modal(this.app);
					modal.titleEl.setText(t('CARD_DELETE_TITLE'));

					modal.contentEl.createEl("p", { text: t('OST_DELETE_HAS_TRACKS', this.ost.title, linkedTracks.length.toString()) });
					
					const btnContainer = modal.contentEl.createDiv({ cls: "storyscore-modal-buttons", attr: { style: "flex-direction: column; gap: 8px;" } });
					
					const keepTracksBtn = btnContainer.createEl("button", { text: t('OST_DELETE_DETACH'), cls: "mod-warning" });
					keepTracksBtn.onclick = async () => {
						for (const track of linkedTracks) {
							await this.app.fileManager.processFrontMatter(track.file, (fm) => {
								fm.album_id = "";
							});
						}
						await this.app.fileManager.trashFile(this.ost.file);
						new Notice(t('OST_DELETED_DETACH_NOTICE', linkedTracks.length.toString()));
						modal.close();
					};

					const deleteAllBtn = btnContainer.createEl("button", { text: t('OST_DELETE_ALL'), cls: "mod-warning" });
					deleteAllBtn.onclick = async () => {
						for (const track of linkedTracks) {
							await this.app.fileManager.trashFile(track.file);
						}
						await this.app.fileManager.trashFile(this.ost.file);
						new Notice(t('OST_DELETED_ALL_NOTICE', linkedTracks.length.toString()));
						modal.close();
					};

					const cancelBtn = btnContainer.createEl("button", { text: t('CANCEL') });
					cancelBtn.onclick = () => modal.close();

					modal.open();
				}
			}
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
