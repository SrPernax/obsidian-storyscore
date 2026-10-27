import { App, setIcon } from 'obsidian';
import { SoundtrackResult } from '../../core/models/soundtrack-result';
import NsLogo from '../../../assets/plugin/ns-logo.svg';
import { SoundtrackInfoModal } from '../../ui/modals/info/soundtrack-info';
import type StoryScorePlugin from '../../main';
import { stripWikiLink, parseWikiLink } from '../../lib/wiki-link';

export function renderSoundtrackCard(container: HTMLElement, ost: SoundtrackResult, app: App, plugin: StoryScorePlugin) {
	container.empty();

	const cardContainer = container.createDiv({ cls: "resonance-inline-player storyscore-track-card storyscore-soundtrack-card" });

	const cover = cardContainer.createDiv({ cls: "storyscore-track-cover storyscore-soundtrack-cover" });

	let hasCover = false;
	if (ost.cover) {
		let coverPath = ost.cover;
		coverPath = stripWikiLink(coverPath);
		
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
			const link = parseWikiLink(part);
			if (link) {
				const linkEl = descEl.createEl("a", { text: link.alias, cls: "internal-link" });
				linkEl.addClass("storyscore-track-link-icon");
				linkEl.onclick = (e) => {
					e.preventDefault();
					void app.workspace.openLinkText(link.target, ost.file.path, false);
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