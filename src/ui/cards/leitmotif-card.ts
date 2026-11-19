import { App, setIcon } from 'obsidian';
import { openNoteByPath } from '../../adapters/obsidian-storage';
import { LeitmotifResult } from '../../core/models/leitmotif-result';
import { LeitmotifInfoModal } from '../../ui/modals/info/leitmotif-info';
import type StoryScorePlugin from '../../main';
import { stripWikiLink, parseWikiLink } from '../../core/parsing/wiki-link';

export function renderLeitmotifCard(container: HTMLElement, lm: LeitmotifResult, app: App, plugin: StoryScorePlugin) {
	container.empty();

	const cardContainer = container.createDiv({ cls: "resonance-inline-player storyscore-track-card storyscore-leitmotif-card" });

	const lmColor = lm.color || "#808080";
	cardContainer.style.background = `linear-gradient(135deg, ${lmColor}22 0%, var(--background-secondary) 100%)`;

	const infoDiv = cardContainer.createDiv({ cls: "storyscore-track-info" });
	const titleEl = infoDiv.createEl("h4", { text: lm.title, cls: "resonance-track-title storyscore-track-info-title" });
	titleEl.style.cursor = "pointer";
	titleEl.onclick = () => {
		openNoteByPath(app, lm.path);
	};

	if (lm.entityType || lm.motifType) {
		const subtitleEl = infoDiv.createSpan({ cls: "storyscore-track-subtitle" });
		if (lm.entityType) {
			subtitleEl.appendText(lm.entityType);
			if (lm.entityNote) {
				subtitleEl.appendText(" (");
				const noteName = stripWikiLink(lm.entityNote);
				const linkEl = subtitleEl.createEl("a", { text: noteName, cls: "internal-link" });
				linkEl.style.cursor = "pointer";
				linkEl.onclick = (e) => {
					e.preventDefault();
					void app.workspace.openLinkText(noteName, lm.path, false);
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
			const link = parseWikiLink(part);
			if (link) {
				const linkEl = descEl.createEl("a", { text: link.alias, cls: "internal-link" });
				linkEl.addClass("internal-link");
				linkEl.style.cursor = "pointer";
				linkEl.onclick = (e) => {
					e.preventDefault();
					void app.workspace.openLinkText(link.target, lm.path, false);
				};
			} else if (part.length > 0) {
				descEl.appendChild(document.createTextNode(part));
			}
		});
	}

	if (lm.audio) {
		const audioElement = infoDiv.createEl("audio", { cls: "storyscore-track-audio", attr: { style: "width: 100%; margin-top: 10px;" } });
		audioElement.setAttribute("controls", "true");

		const audioPath = stripWikiLink(lm.audio);

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
