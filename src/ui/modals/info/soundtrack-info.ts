import { App, Modal, Notice } from 'obsidian';
import { SoundtrackResult } from '../../../core/models/soundtrack-result';
import type StoryScorePlugin from '../../../main';
import { t } from '../../../i18n';
import { NewSoundtrackModal } from '../creators/add-soundtrack';
import { getAllTracks } from '../../../core/repository/track-queries';
import { ConfirmDeleteModal } from '../../components/confirm-delete';
import { InformationControl } from '../../components/information-control';
import { stripWikiLink } from '../../../core/parsing/wiki-link';
import NsLogo from '../../../../assets/plugin/ns-logo.svg';

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

		contentEl.createEl("h2", { text: t('OST_INFO_TITLE'), cls: "story-info-title", attr: { style: "flex-shrink: 0;" } });

		contentEl.createEl("hr", { cls: "storyinfo-separator", attr: { style: "flex-shrink: 0;" } });

		const topSection = contentEl.createDiv({ attr: { style: "display: flex; gap: 30px; align-items: center; margin-bottom: 20px; flex-shrink: 0;" } });

		const leftCol = topSection.createDiv({ attr: { style: "flex-shrink: 0;" } });
		const rightCol = topSection.createDiv({ attr: { style: "flex-grow: 1; display: flex; flex-direction: column; gap: 4px;" } });

		const imgDiv = leftCol.createDiv({ attr: { style: "text-align: center;" } });
		const imgEl = imgDiv.createEl("img", { attr: { style: "max-width: 400px; max-height: 400px; object-fit: cover; border-radius: 12px; box-shadow: 0 8px 16px rgba(0,0,0,0.3);" } });

		let hasCover = false;

		if (this.ost.cover) {
			const coverPath = stripWikiLink(this.ost.cover);
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
		const allTracks = getAllTracks(this.plugin.storage, baseFolder);
		const linkedTracks = allTracks.filter(t => t.albumId === this.ost.id);

		if (linkedTracks.length > 0) {
			contentEl.createEl("hr", { cls: "storyinfo-separator", attr: { style: "flex-shrink: 0;" } });
			contentEl.createEl("h3", { text: "Tracks (" + linkedTracks.length + ")", attr: { style: "margin-top: 0; flex-shrink: 0;" } });

			const tracksScroll = contentEl.createDiv({ attr: { style: "flex: 1; min-height: 0; overflow-y: auto; padding-right: 10px;" } });
			const tracksContainer = tracksScroll.createDiv({ attr: { style: "display: flex; flex-direction: column; gap: 10px;" } });

			for (const track of linkedTracks) {
				tracksContainer.createDiv();
				contentEl.createEl("p", { text: track.title, cls: "story-info-track-title" });
			}
		}

		const footerDiv = contentEl.createDiv({ attr: { style: "flex-shrink: 0; margin-top: auto;" } });
		footerDiv.createEl("hr", { cls: "storyinfo-separator" });

		new InformationControl({
			app: this.app,
			plugin: this.plugin,
			containerEl: footerDiv,
			filePath: this.ost.path,
			id: this.ost.id,
			title: this.ost.title,
			onEdit: () => new NewSoundtrackModal(this.app, this.ost.path, this.plugin).open(),
			onCloseModal: () => this.close(),
			onDelete: () => {
				const baseFolder = this.plugin.settings.baseFolder || 'StoryScore';
				const allTracks = getAllTracks(this.plugin.storage, baseFolder);
				const linkedTracks = allTracks.filter(t => t.albumId === this.ost.id);

				if (linkedTracks.length === 0) {
					new ConfirmDeleteModal(this.app, this.ost.path, this.ost.title).open();
				} else {
					const modal = new Modal(this.app);
					modal.titleEl.setText(t('CARD_DELETE_TITLE'));

					modal.contentEl.createEl("p", { text: t('OST_DELETE_HAS_TRACKS', this.ost.title, linkedTracks.length.toString()) });

					const btnContainer = modal.contentEl.createDiv({ cls: "storyscore-modal-buttons", attr: { style: "flex-direction: column; gap: 8px;" } });

					const keepTracksBtn = btnContainer.createEl("button", { text: t('OST_DELETE_DETACH'), cls: "mod-warning" });
					keepTracksBtn.onclick = async () => {
						for (const track of linkedTracks) {
							await this.plugin.storage.updateNote(track.path, (fm) => {
								fm.album_id = "";
							});
						}
						await this.plugin.storage.deleteNote(this.ost.path);
						new Notice(t('OST_DELETED_DETACH_NOTICE', linkedTracks.length.toString()));
						modal.close();
					};

					const deleteAllBtn = btnContainer.createEl("button", { text: t('OST_DELETE_ALL'), cls: "mod-warning" });
					deleteAllBtn.onclick = async () => {
						for (const track of linkedTracks) {
							await this.plugin.storage.deleteNote(track.path);
						}
						await this.plugin.storage.deleteNote(this.ost.path);
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
