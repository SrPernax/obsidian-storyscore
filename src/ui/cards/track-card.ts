import { App, setIcon } from 'obsidian';
import { openNoteByPath } from '../../adapters/obsidian-storage';
import { TrackResult } from '../../core/models/track-result';
import { SoundtrackResult } from '../../core/models/soundtrack-result';
import { t } from '../../i18n';
import { TRACK_TYPES, TRACK_STATUSES } from '../../core/constants/taxonomy';
import type StoryScorePlugin from '../../main';
import { stripWikiLink, parseWikiLink } from '../../core/parsing/wiki-link';

import NsLogo from '../../../assets/plugin/ns-logo.svg';
import { TrackInfoModal } from '../modals/info/track-info';

export function renderTrackCard(container: HTMLElement, track: TrackResult, ost: SoundtrackResult | undefined, app: App, plugin: StoryScorePlugin) {
	container.empty();

	const playerContainer = container.createDiv({ cls: "resonance-inline-player storyscore-track-card" });

	const cover = playerContainer.createDiv({ cls: "storyscore-track-cover" });

	let hasCover = false;
	if (ost && ost.cover) {
		const coverPath = stripWikiLink(ost.cover);

		const imageFile = app.metadataCache.getFirstLinkpathDest(coverPath, "");
		if (imageFile) {
			const imageUrl = app.vault.getResourcePath(imageFile);
			cover.style.backgroundImage = `url("${imageUrl}")`;
			cover.addClass("storyscore-track-cover-transparent");
			hasCover = true;
		}
	}

	if (!hasCover) {
		cover.style.backgroundImage = `url('data:image/svg+xml;base64,${NsLogo}')`;
		cover.addClass("storyscore-track-cover-default");
	}

	const infoDiv = playerContainer.createDiv({ cls: "storyscore-track-info" });

	const titleEl = infoDiv.createEl("h4", { text: track.title, cls: "resonance-track-title storyscore-track-info-title" });
	titleEl.style.cursor = "pointer";
	titleEl.onclick = () => {
		openNoteByPath(app, track.path);
	};

	if (track.description) {
		const descEl = infoDiv.createSpan({ cls: "storyscore-track-desc" });

		const parts = track.description.split(/(\[\[.*?\]\])/g);
		parts.forEach(part => {
			const link = parseWikiLink(part);
			if (link) {
				const linkEl = descEl.createEl("a", { text: link.alias, cls: "internal-link" });
				linkEl.addClass("storyscore-track-link-icon");
				linkEl.onclick = (e) => {
					e.preventDefault();
					void app.workspace.openLinkText(link.target, track.path, false);
				};
			} else if (part.length > 0) {
				descEl.appendChild(document.createTextNode(part));
			}
		});
	}

	const typeObj = TRACK_TYPES.find(t => t.id === track.type);
	let typeStr = track.type;
	if (typeObj) typeStr = t(typeObj.labelKey as Parameters<typeof t>[0]);

	const statusObj = TRACK_STATUSES.find(s => s.id === track.status);
	let statusStr = track.status;
	if (statusObj) statusStr = t(statusObj.labelKey as Parameters<typeof t>[0]);

	const trackType = typeStr ? (typeStr.charAt(0).toUpperCase() + typeStr.slice(1)) : "";
	const trackStatus = statusStr ? (statusStr.charAt(0).toUpperCase() + statusStr.slice(1)) : "";

	let subtitleText = "";
	if (trackType && trackType !== t('CARD_UNKNOWN_TYPE') && trackType !== "Desconocido") subtitleText = trackType;
	if (trackStatus && trackStatus !== t('CARD_NO_STATUS') && trackStatus !== "Sin estado") {
		subtitleText += subtitleText ? ` • ${trackStatus}` : trackStatus;
	}

	infoDiv.createSpan({ text: subtitleText, cls: "storyscore-track-subtitle" });

	const audioElement = infoDiv.createEl("audio", { cls: "storyscore-track-audio", attr: { style: "width: 100%; margin-top: 10px;" } });
	audioElement.setAttribute("controls", "true");

	if (track.audio) {
		const audioPath = stripWikiLink(track.audio);

		const audioFile = app.metadataCache.getFirstLinkpathDest(audioPath, "");
		if (audioFile) {
			audioElement.src = app.vault.getResourcePath(audioFile);
		}
	}

	const rightControls = playerContainer.createDiv({ attr: { style: "display: flex; margin-left: auto; align-items: center;" } });
	const btnInfo = rightControls.createEl("button", { cls: "storyscore-icon-btn", attr: { 'aria-label': 'Info', style: 'padding: 5px 20px;' } });
	setIcon(btnInfo, "info");
	btnInfo.onclick = () => {
		new TrackInfoModal(app, track, ost, plugin).open();
	};
}
