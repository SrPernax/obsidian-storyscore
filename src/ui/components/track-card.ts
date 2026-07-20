import { App, Notice, Modal } from 'obsidian';
import { TrackResult } from '../../core/results/track-result';
import { SoundtrackResult } from '../../core/results/soundtrack-result';
import { NewTrackModal } from '../add-track';
import { t } from '../../locales/i18n';
import { TRACK_TYPES, TRACK_STATUSES } from '../../core/utils/constants';
import type StoryScorePlugin from '../../main';

export function renderTrackCard(container: HTMLElement, track: TrackResult, ost: SoundtrackResult | undefined, app: App, plugin: StoryScorePlugin) {

	container.empty();

	const playerContainer = container.createEl("div", { cls: "resonance-inline-player storyscore-track-card" });

	const cover = playerContainer.createEl("div", { cls: "storyscore-track-cover" });

	if (ost && ost.cover) {
		let coverPath = ost.cover;
		if (coverPath.startsWith("[[") && coverPath.endsWith("]]")) {
			coverPath = coverPath.substring(2, coverPath.length - 2);
		}
		
		const imageFile = app.metadataCache.getFirstLinkpathDest(coverPath, "");
		if (imageFile) {
			const imageUrl = app.vault.getResourcePath(imageFile);
			cover.style.backgroundImage = `url("${imageUrl}")`;
			cover.style.backgroundColor = "transparent";
		}
	} else if (!ost) {
		const defaultLogoPath = app.vault.adapter.getResourcePath(`.obsidian/plugins/storyscore/assets/ns-logo.png`);
		cover.style.backgroundImage = `url("${defaultLogoPath}")`;
		cover.style.backgroundColor = "transparent";
		cover.style.objectFit = "contain";
	}

	const infoDiv = playerContainer.createEl("div", { cls: "storyscore-track-info" });

	infoDiv.createEl("h4", { text: track.title, cls: "resonance-track-title" }).style.margin = "0";
	
	if (track.description) {
		const descEl = infoDiv.createEl("span", { cls: "storyscore-track-desc" });

		const parts = track.description.split(/(\[\[.*?\]\])/g);
		parts.forEach(part => {
			if (part.startsWith('[[') && part.endsWith(']]')) {
				const inner = part.slice(2, -2);
				const split = inner.split('|');
				const linkPath = split[0] || "";
				const linkAlias = split[1] || linkPath;

				const linkEl = descEl.createEl("a", { text: linkAlias, cls: "internal-link" });
				linkEl.style.cursor = "pointer";
				linkEl.onclick = (e) => {
					e.preventDefault();
					app.workspace.openLinkText(linkPath, track.file.path, false);
				};
			} else if (part.length > 0) {
				descEl.appendChild(document.createTextNode(part));
			}
		});
	}
	
	const typeObj = TRACK_TYPES.find(t => t.id === track.type);
	let typeStr = track.type;
	if (typeObj) typeStr = t(typeObj.labelKey as any);

	const statusObj = TRACK_STATUSES.find(s => s.id === track.status);
	let statusStr = track.status;
	if (statusObj) statusStr = t(statusObj.labelKey as any);

	const ostTitle = ost ? ost.title : t('CARD_NO_ALBUM');
	const trackType = typeStr ? (typeStr.charAt(0).toUpperCase() + typeStr.slice(1)) : "";
	const trackStatus = statusStr ? (statusStr.charAt(0).toUpperCase() + statusStr.slice(1)) : "";
	
	let subtitleText = ostTitle;
	if (trackType && trackType !== t('CARD_UNKNOWN_TYPE') && trackType !== "Desconocido") subtitleText += ` • ${trackType}`;
	if (trackStatus && trackStatus !== t('CARD_NO_STATUS') && trackStatus !== "Sin estado") subtitleText += ` • ${trackStatus}`;
	
	infoDiv.createEl("span", { text: subtitleText, cls: "storyscore-track-subtitle" });
	infoDiv.createEl("small", { text: `ID: ${track.id}`, cls: "storyscore-track-id" });

	const rightControls = playerContainer.createEl("div", { cls: "storyscore-track-controls" });
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

	const buttonsBox = rightControls.createEl("div", { cls: "storyscore-track-buttons" });
	
	const btnEdit = buttonsBox.createEl("button", { text: t('CARD_EDIT'), cls: "storyscore-track-btn" });
	btnEdit.onclick = () => {
		new NewTrackModal(app, track.file, plugin).open();
	};

	const btnDelete = buttonsBox.createEl("button", { text: t('CARD_DELETE'), cls: "mod-warning storyscore-track-btn" });
	btnDelete.onclick = () => {
		const modal = new Modal(app);
		modal.titleEl.setText(t('CARD_DELETE_TITLE'));
		modal.contentEl.createEl("p", { text: t('CARD_DELETE_CONFIRM', track.title) });
		
		const btnContainer = modal.contentEl.createEl("div", { cls: "storyscore-modal-buttons" });
		
		const cancelBtn = btnContainer.createEl("button", { text: t('CANCEL') });
		cancelBtn.onclick = () => modal.close();
		
		const confirmBtn = btnContainer.createEl("button", { text: t('DELETE'), cls: "mod-warning" });
		confirmBtn.onclick = async () => {
			await app.vault.trash(track.file, true);
			new Notice(t('CARD_DELETED_NOTICE', track.title));
			modal.close();
		};
		
		modal.open();
	};
}
