import { App, setIcon } from 'obsidian';
import { LeitmotifResult } from '../../core/results/leitmotif-result';
import { LeitmotifInfoModal } from '../informations/leitmotif-info';
import type StoryScorePlugin from '../../main';

export function renderLeitmotifCard(container: HTMLElement, lm: LeitmotifResult, app: App, plugin: StoryScorePlugin) {
	container.empty();

	const cardContainer = container.createDiv({ cls: "resonance-inline-player storyscore-track-card storyscore-leitmotif-card" });
	
	const lmColor = lm.color || "#808080";
	cardContainer.style.background = `linear-gradient(135deg, ${lmColor}22 0%, var(--background-secondary) 100%)`;
	

	const infoDiv = cardContainer.createDiv({ cls: "storyscore-track-info" });
	const titleEl = infoDiv.createEl("h4", { text: lm.title, cls: "resonance-track-title storyscore-track-info-title" });
	titleEl.style.cursor = "pointer";
	titleEl.onclick = () => {
		void app.workspace.getLeaf().openFile(lm.file);
	};

	if (lm.entityType || lm.motifType) {
		const subtitleEl = infoDiv.createSpan({ cls: "storyscore-track-subtitle" });
		if (lm.entityType) {
			subtitleEl.appendText(lm.entityType);
			if (lm.entityNote) {
				subtitleEl.appendText(" (");
				let noteName = lm.entityNote;
				if (noteName.startsWith("[[") && noteName.endsWith("]]")) {
					noteName = noteName.substring(2, noteName.length - 2);
				}
				const linkEl = subtitleEl.createEl("a", { text: noteName, cls: "internal-link" });
				linkEl.style.cursor = "pointer";
				linkEl.onclick = (e) => {
					e.preventDefault();
					void app.workspace.openLinkText(noteName, lm.file.path, false);
				};
				subtitleEl.appendText(")");
			}
		}
		if (lm.entityType && lm.motifType) {
			subtitleEl.appendText(" • ");
		}
		if (lm.motifType) {
			subtitleEl.appendText(lm.motifType);
		}
	}

	if (lm.description) {
		const descEl = infoDiv.createSpan({ cls: "storyscore-track-desc" });
		const parts = lm.description.split(/(\[\[.*?\]\])/g);
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
					void app.workspace.openLinkText(linkPath, lm.file.path, false);
				};
			} else if (part.length > 0) {
				descEl.appendChild(document.createTextNode(part));
			}
		});
	}

	if (lm.audio) {
		const audioElement = infoDiv.createEl("audio", { cls: "storyscore-track-audio", attr: { style: "width: 100%; margin-top: 10px;" } });
		audioElement.setAttribute("controls", "true");

		let audioPath = lm.audio;
		if (audioPath.startsWith("[[") && audioPath.endsWith("]]")) {
			audioPath = audioPath.substring(2, audioPath.length - 2);
		}
		
		const audioFile = app.metadataCache.getFirstLinkpathDest(audioPath, "");
		if (audioFile) {
			audioElement.src = app.vault.getResourcePath(audioFile);
		}
	}

	const rightControls = cardContainer.createDiv({ attr: { style: "display: flex; margin-left: auto; align-items: center;" } });
	
	const btnInfo = rightControls.createEl("button", { cls: "storyscore-icon-btn", attr: { 'aria-label': 'Info', style: 'padding: 5px 20px;' } });
	setIcon(btnInfo, "info");
	btnInfo.onclick = () => {
		new LeitmotifInfoModal(app, lm, plugin).open();
	};
}
