// @ts-ignore
import { App, Modal } from 'obsidian';
import NsLogo from '../../../assets/plugin/ns-logo.svg';
import { TrackResult } from '../../../core/models/track-result';
import { SoundtrackResult } from '../../../core/models/soundtrack-result';
import StoryScorePlugin from '../../../main';
import { t } from '../../../i18n';
import { stripWikiLink } from '../../../lib/wiki-link';
import { TRACK_STATUSES, TRACK_TYPES } from '../../../core/constants/taxonomy';
import { getLeitmotifById } from '../../../core/repository/leitmotif-queries';
import { LeitmotifTagButton } from '../../components/leitmotif-tag';
import { NewTrackModal } from '../creators/add-track';
import { InformationControl } from '../../components/information-control';

export class TrackInfoModal extends Modal {
	track: TrackResult;
	ost: SoundtrackResult | undefined;
	plugin: StoryScorePlugin;

	constructor(app: App, track: TrackResult, ost: SoundtrackResult | undefined, plugin: StoryScorePlugin) {
		super(app);
		this.track = track;
		this.ost = ost;
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		this.modalEl.addClass("storyscore-track-info-modal");

		const header = contentEl.createEl("h2", { text: t('INFO_MODAL_TITLE'), cls: "story-info-header" });

		contentEl.createEl("hr", { cls: "storyinfo-separator" });

		const topSection = contentEl.createDiv({ cls: "story-info-top-section" });

		// Left: Album Cover
		const coverBox = topSection.createDiv({ cls: "story-info-cover-box" });
		const cover = coverBox.createDiv({ cls: "story-info-cover" });

		let hasCover = false;
		if (this.ost && this.ost.cover) {
			let coverPath = this.ost.cover;
			coverPath = stripWikiLink(coverPath);
			const imageFile = this.app.metadataCache.getFirstLinkpathDest(coverPath, "");
			if (imageFile) {
				const imageUrl = this.app.vault.getResourcePath(imageFile);
				cover.style.backgroundImage = `url("${imageUrl}")`;
				cover.addClass("story-info-cover-transparent");
				hasCover = true;
			}
		}

		if (!hasCover) {
			cover.style.backgroundImage = `url('data:image/svg+xml;base64,${NsLogo}')`;
			cover.addClass("story-info-cover-default");
		}
		coverBox.createDiv({ text: this.track.id, attr: { style: "font-size: 13px; font-family: monospace; color: var(--text-muted); text-align: center; margin-top: 5px;" } });

		// Middle: Details
		const detailsBox = topSection.createDiv({ cls: "story-info-details" });

		const titleRow = detailsBox.createDiv({ cls: "story-info-row" });
		titleRow.createSpan({ text: t('INFO_NAME') + ":", cls: "story-info-label" });
		titleRow.createSpan({ text: this.track.title, cls: "story-info-value" });

		const ostRow = detailsBox.createDiv({ cls: "story-info-row" });
		ostRow.createSpan({ text: t('INFO_SOUNDTRACK') + ":", cls: "story-info-label" });
		ostRow.createSpan({ text: this.ost ? this.ost.title : t('CARD_NO_ALBUM'), cls: "story-info-value" });

		const descRow = detailsBox.createDiv({ cls: "story-info-row" });
		descRow.createSpan({ text: t('INFO_DESC') + ":", cls: "story-info-label" });
		descRow.createSpan({ text: this.track.description || "-", cls: "story-info-value storyinfo-desc-value" });

		// Audio
		const audioElement = contentEl.createEl("audio", { cls: "story-info-audio storyscore-track-audio storyinfo-audio" });
		audioElement.setAttribute("controls", "true");
		audioElement.style.width = "100%";
		audioElement.style.marginTop = "5px";

		if (this.track.audio) {
			let audioPath = this.track.audio;
			audioPath = stripWikiLink(audioPath);

			const audioFile = this.app.metadataCache.getFirstLinkpathDest(audioPath, "");
			if (audioFile) {
				audioElement.src = this.app.vault.getResourcePath(audioFile);
			}
		}

		contentEl.createEl("hr", { cls: "storyinfo-separator" });

		// Bottom Section
		const bottomSection = contentEl.createDiv({ cls: "story-info-bottom-section" });

		const leftPanel = bottomSection.createDiv({ cls: "story-info-left-panel" });

		// Map values
		const typeObj = TRACK_TYPES.find(t => t.id === this.track.type);
		let typeStr = this.track.type;
		// @ts-ignore
		if (typeObj) typeStr = t(typeObj.labelKey as unknown);

		const statusObj = TRACK_STATUSES.find(s => s.id === this.track.status);
		let statusStr = this.track.status;
		// @ts-ignore
		if (statusObj) statusStr = t(statusObj.labelKey as unknown);

		let diegesisStr = this.track.diegesis;
		if (diegesisStr === "diegetic" || diegesisStr === "in") diegesisStr = "Diegético";
		if (diegesisStr === "non-diegetic" || diegesisStr === "out") diegesisStr = "Extradiegético";
		if (diegesisStr === "n/a" || diegesisStr === "mixed") diegesisStr = "N/A";

		leftPanel.createEl("strong", { text: t('INFO_TYPE') });
		leftPanel.createDiv({ text: typeStr || "-", cls: "story-info-panel-value" });

		leftPanel.createEl("strong", { text: t('INFO_STATUS') });
		leftPanel.createDiv({ text: statusStr || "-", cls: "story-info-panel-value" });

		leftPanel.createEl("strong", { text: t('INFO_DIEGESIS') });
		leftPanel.createDiv({ text: diegesisStr || "-", cls: "story-info-panel-value" });

		leftPanel.createEl("strong", { text: t('INFO_LEITMOTIFS') });
		const lmsBox = leftPanel.createDiv({ cls: "story-info-panel-value", attr: { style: "display: flex; flex-wrap: wrap; gap: 5px;" } });

		if (this.track.leitmotifs && this.track.leitmotifs.length > 0) {
			const baseFolder = this.plugin.settings.baseFolder || 'StoryScore';

			this.track.leitmotifs.forEach(lm => {
				const lmClean = stripWikiLink(lm);
				const lmResult = getLeitmotifById(this.app, baseFolder, lmClean);
				if (lmResult) {
					new LeitmotifTagButton(this.app, lmsBox, lmResult, this.plugin, () => {
						this.close();
					});
				} else {
					lmsBox.createSpan({ text: lmClean, cls: 'storyscore-leitmotif-pill', attr: { style: 'opacity: 0.5', title: 'Leitmotif not found' } });
				}
			});
		} else {
			lmsBox.setText("-");
		}


		if (this.track.lyrics) {
			const rightPanel = bottomSection.createDiv({ cls: "story-info-right-panel" });
			rightPanel.createEl("strong", { text: t('INFO_LYRICS') });
			rightPanel.createDiv({ text: this.track.lyrics, cls: "story-info-lyrics-value" });
		} else {
			leftPanel.style.width = "100%";
		}

		contentEl.createEl("hr", { cls: "storyinfo-separator" });

		new InformationControl({
			app: this.app,
			plugin: this.plugin,
			containerEl: contentEl,
			file: this.track.file,
			id: this.track.id,
			title: this.track.title,
			onEdit: () => new NewTrackModal(this.app, this.track.file, this.plugin).open(),
			onCloseModal: () => this.close()
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
