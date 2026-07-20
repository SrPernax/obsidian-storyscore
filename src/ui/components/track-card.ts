import { App, Notice, Modal } from 'obsidian';
import { TrackResult } from '../../core/results/track-result';
import { SoundtrackResult } from '../../core/results/soundtrack-result';
import { NewTrackModal } from '../add-track';
import { t } from '../../locales/lenguajes';
import { TRACK_TYPES, TRACK_STATUSES } from '../../core/utils/constants';
import type StoryScorePlugin from '../../main';

export function renderTrackCard(container: HTMLElement, track: TrackResult, ost: SoundtrackResult | undefined, app: App, plugin: StoryScorePlugin) {

	container.empty();

	const playerContainer = container.createDiv({ cls: "resonance-inline-player storyscore-track-card" });

	const cover = playerContainer.createDiv({ cls: "storyscore-track-cover" });

	let hasCover = false;
	if (ost && ost.cover) {
		let coverPath = ost.cover;
		if (coverPath.startsWith("[[") && coverPath.endsWith("]]")) {
			coverPath = coverPath.substring(2, coverPath.length - 2);
		}
		
		const imageFile = app.metadataCache.getFirstLinkpathDest(coverPath, "");
		if (imageFile) {
			const imageUrl = app.vault.getResourcePath(imageFile);
			cover.style.backgroundImage = `url("${imageUrl}")`;
			cover.addClass("storyscore-track-cover-transparent");
			hasCover = true;
		}
	}
	
	if (!hasCover) {
		const defaultLogoPath = app.vault.adapter.getResourcePath(`.obsidian/plugins/storyscore/assets/plugin/ns-logo.png`);
		cover.style.backgroundImage = `url("${defaultLogoPath}")`;
		cover.addClass("storyscore-track-cover-default");
	}

	const infoDiv = playerContainer.createDiv({ cls: "storyscore-track-info" });

	infoDiv.createEl("h4", { text: track.title, cls: "resonance-track-title storyscore-track-info-title" });
	
	if (track.description) {
		const descEl = infoDiv.createSpan({ cls: "storyscore-track-desc" });

		const parts = track.description.split(/(\[\[.*?\]\])/g);
		parts.forEach(part => {
			if (part.startsWith('[[') && part.endsWith(']]')) {
				const inner = part.slice(2, -2);
				const split = inner.split('|');
				const linkPath = split[0] || "";
				const linkAlias = split[1] || linkPath;

				const linkEl = descEl.createEl("a", { text: linkAlias, cls: "internal-link" });
				linkEl.addClass("storyscore-track-link-icon");
				linkEl.onclick = (e) => {
					e.preventDefault();
					void app.workspace.openLinkText(linkPath, track.file.path, false);
				};
			} else if (part.length > 0) {
				descEl.appendChild(document.createTextNode(part));
			}
		});
	}
	
	const typeObj = TRACK_TYPES.find(t => t.id === track.type);
	let typeStr = track.type;
	// @ts-ignore
	if (typeObj) typeStr = t(typeObj.labelKey as unknown);

	const statusObj = TRACK_STATUSES.find(s => s.id === track.status);
	let statusStr = track.status;
	// @ts-ignore
	if (statusObj) statusStr = t(statusObj.labelKey as unknown);

	const ostTitle = ost ? ost.title : t('CARD_NO_ALBUM');
	const trackType = typeStr ? (typeStr.charAt(0).toUpperCase() + typeStr.slice(1)) : "";
	const trackStatus = statusStr ? (statusStr.charAt(0).toUpperCase() + statusStr.slice(1)) : "";
	
	let subtitleText = ostTitle;
	if (trackType && trackType !== t('CARD_UNKNOWN_TYPE') && trackType !== "Desconocido") subtitleText += ` • ${trackType}`;
	if (trackStatus && trackStatus !== t('CARD_NO_STATUS') && trackStatus !== "Sin estado") subtitleText += ` • ${trackStatus}`;
	
	infoDiv.createSpan({ text: subtitleText, cls: "storyscore-track-subtitle" });
	infoDiv.createEl("small", { text: `ID: ${track.id}`, cls: "storyscore-track-id" });

	const rightControls = playerContainer.createDiv({ cls: "storyscore-track-controls" });
	const audioElement = rightControls.createEl("audio", { cls: "storyscore-track-audio" });
	audioElement.setAttribute("controls", "true");

	if (track.audio) {
		let audioPath = track.audio;
		if (audioPath.startsWith("[[") && audioPath.endsWith("]]")) {
			audioPath = audioPath.substring(2, audioPath.length - 2);
		}
		
		const audioFile = app.metadataCache.getFirstLinkpathDest(audioPath, "");
		if (audioFile) {
			audioElement.src = app.vault.getResourcePath(audioFile);
		}
	}

	const buttonsBox = rightControls.createDiv({ cls: "storyscore-track-buttons" });
	
	const btnEdit = buttonsBox.createEl("button", { text: t('CARD_EDIT'), cls: "storyscore-track-btn" });
	btnEdit.onclick = () => {
		new NewTrackModal(app, track.file, plugin).open();
	};

	const btnDelete = buttonsBox.createEl("button", { text: t('CARD_DELETE'), cls: "mod-warning storyscore-track-btn" });
	btnDelete.onclick = () => {
		const modal = new Modal(app);
		modal.titleEl.setText(t('CARD_DELETE_TITLE'));
		modal.contentEl.createEl("p", { text: t('CARD_DELETE_CONFIRM', track.title) });
		
		const btnContainer = modal.contentEl.createDiv({ cls: "storyscore-modal-buttons" });
		
		const cancelBtn = btnContainer.createEl("button", { text: t('CANCEL') });
		cancelBtn.onclick = () => modal.close();
		
		const confirmBtn = btnContainer.createEl("button", { text: t('DELETE'), cls: "mod-warning" });
		confirmBtn.onclick = async () => {
			await app.fileManager.trashFile(track.file);
			new Notice(t('CARD_DELETED_NOTICE', track.title));
			modal.close();
		};
		
		modal.open();
	};
}
