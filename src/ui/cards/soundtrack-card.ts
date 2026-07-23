import { App, setIcon } from 'obsidian';
import { SoundtrackResult } from '../../core/results/soundtrack-result';
import NsLogo from '../../../assets/plugin/ns-logo.svg';
import { SoundtrackInfoModal } from '../informations/soundtrack-info';
import type StoryScorePlugin from '../../main';

export function renderSoundtrackCard(container: HTMLElement, ost: SoundtrackResult, app: App, plugin: StoryScorePlugin) {
	container.empty();

	const cardContainer = container.createDiv({ cls: "resonance-inline-player storyscore-track-card storyscore-soundtrack-card" });

	const cover = cardContainer.createDiv({ cls: "storyscore-track-cover storyscore-soundtrack-cover" });

	let hasCover = false;
	if (ost.cover) {
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
		cover.style.backgroundImage = `url('data:image/svg+xml;base64,${NsLogo}')`;
		cover.addClass("storyscore-track-cover-default");
	}

	const infoDiv = cardContainer.createDiv({ cls: "storyscore-track-info" });

	const titleEl = infoDiv.createEl("h4", { text: ost.title, cls: "resonance-track-title storyscore-track-info-title" });
	titleEl.style.cursor = "pointer";
	titleEl.onclick = () => {
		void app.workspace.getLeaf().openFile(ost.file);
	};
	
	if (ost.description) {
		const descEl = infoDiv.createSpan({ cls: "storyscore-track-desc" });
		const parts = ost.description.split(/(\[\[.*?\]\])/g);
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
					void app.workspace.openLinkText(linkPath, ost.file.path, false);
				};
			} else if (part.length > 0) {
				descEl.appendChild(document.createTextNode(part));
			}
		});
	}

	const rightControls = cardContainer.createDiv({ attr: { style: "display: flex; margin-left: auto; align-items: center;" } });
	
	const btnInfo = rightControls.createEl("button", { cls: "storyscore-icon-btn", attr: { 'aria-label': 'Info', style: 'padding: 5px 20px;' } });
	setIcon(btnInfo, "info");
	btnInfo.onclick = () => {
		new SoundtrackInfoModal(app, ost, plugin).open();
	};
}
