import { ItemView, WorkspaceLeaf, debounce } from 'obsidian';
import { NewSoundtrackModal } from "./add-sountrack";
import { NewTrackModal } from "./add-track";
import { NewLeitmotifModal } from "./add-leitmotif";
import { renderTrackCard } from "./components/track-card";
import { getSoundtracks } from "../core/queries/soundtrack-queries";
import { getAllTracks } from "../core/queries/track-queries";
import { t } from "../locales/lenguajes";
import type StoryScorePlugin from '../main';

export const VIEW_TYPE_STORYSCORE = "storyscore-view";

export class StoryScoreView extends ItemView {
	currentAlbumFilter: string = "all";
	plugin: StoryScorePlugin;

	debouncedRender = debounce(() => {
		this.renderView();
	}, 500, true);

	constructor(leaf: WorkspaceLeaf, plugin: StoryScorePlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType() { return VIEW_TYPE_STORYSCORE; }
	getDisplayText() { return t('MANAGER_TITLE'); }
	getIcon(): string { return "music"; }

	async onOpen() {
		await this.renderView();

		this.registerEvent(this.app.metadataCache.on('changed', this.debouncedRender));
		this.registerEvent(this.app.vault.on('create', this.debouncedRender));
		this.registerEvent(this.app.vault.on('delete', this.debouncedRender));
		this.registerEvent(this.app.vault.on('rename', this.debouncedRender));
		this.registerEvent((this.app.workspace as any).on('csschange', this.debouncedRender));
	}

	async renderView() {
		const container = this.contentEl;
		container.empty();

		const settings = this.plugin.settings;
		const baseFolder = settings.baseFolder || 'StoryScore';
		const compactMode = settings.compactMode || false;
		const isDarkTheme = document.body.classList.contains('theme-dark');

		container.addClass('storyscore-manager-container');
		if (isDarkTheme) {
			container.addClass('storyscore-theme-dark');
		}

		this.renderHeader(container, compactMode, isDarkTheme);
		this.renderToolbar(container);
		this.renderTrackList(container, baseFolder);
	}

	renderHeader(container: HTMLElement, compactMode: boolean, isDarkTheme: boolean) {
		const staffBox = container.createEl('div', { cls: 'storyscore-staff-box' });
		if (compactMode) staffBox.addClass('compact');

		if (!compactMode) {
			for(let i = 0; i < 4; i++) {
				staffBox.createEl('div', { cls: 'storyscore-staff-line' });
			}
		}

		const titleBox = staffBox.createEl('div', { cls: 'storyscore-title-box' });
		if (compactMode) titleBox.addClass('compact');

		const logoFilename = isDarkTheme ? 'logo-white.png' : 'logo-black.png';
		const logoPath = this.app.vault.adapter.getResourcePath(`.obsidian/plugins/storyscore/assets/plugin/${logoFilename}`);
		
		const logo = titleBox.createEl('img', { cls: 'storyscore-logo' });
		logo.src = logoPath;
		if (compactMode) logo.addClass('compact');

		const textContainer = titleBox.createEl('div', { cls: 'storyscore-text-container' });
		if (compactMode) textContainer.addClass('compact');

		const title = textContainer.createEl('h2', { text: t('MANAGER_TITLE'), cls: 'storyscore-title' });
		if (compactMode) title.addClass('compact');

		const version = textContainer.createEl('span', { text: 'v1.0.0', cls: 'storyscore-version' });
		if (compactMode) version.addClass('compact');

		if (!compactMode) {
			staffBox.createEl('span', { text: '𝄞', cls: 'storyscore-clef' });
			const notesContainer = staffBox.createEl('div', { cls: 'storyscore-notes-container' });
			
			const note1 = notesContainer.createEl('span', { text: '♩', cls: 'storyscore-note-1' });
			const note2 = notesContainer.createEl('span', { text: '♪', cls: 'storyscore-note-2' });
			const note3 = notesContainer.createEl('span', { text: '♫', cls: 'storyscore-note-3' });
		}
	}

	renderToolbar(container: HTMLElement) {
		const hBox = container.createEl('div', { cls: 'storyscore-toolbar' });

		const createColoredButton = (parent: HTMLElement, fullText: string) => {
			const btn = parent.createEl('button', { cls: 'storyscore-toolbar-btn' });
			const spaceIdx = fullText.indexOf(' ');
			if (spaceIdx > 0 && spaceIdx < 5) { 
				const emoji = fullText.substring(0, spaceIdx);
				const rest = fullText.substring(spaceIdx);
				btn.createEl('span', { text: emoji, cls: 'storyscore-toolbar-emoji' });
				btn.appendChild(document.createTextNode(rest.trim()));
			} else {
				btn.setText(fullText);
			}
			return btn;
		};

		const btnRefreshAll = createColoredButton(hBox, t('MANAGER_REFRESH_ALL'));
		btnRefreshAll.onclick = () => this.renderView();

		const btnAddProject = createColoredButton(hBox, t('MANAGER_ADD_SOUNDTRACK'));
		btnAddProject.onclick = () => { new NewSoundtrackModal(this.app, this.plugin).open(); };

		const btnAddTrack = createColoredButton(hBox, t('MANAGER_ADD_TRACK'));
		btnAddTrack.onclick = () => { new NewTrackModal(this.app, undefined, this.plugin).open(); };

		const btnAddLeitmotif = createColoredButton(hBox, t('MANAGER_ADD_LEITMOTIF'));
		btnAddLeitmotif.onclick = () => { new NewLeitmotifModal(this.app, this.plugin).open(); };
	}

	renderTrackList(container: HTMLElement, baseFolder: string) {
		const ostList = getSoundtracks(this.app, baseFolder);
		const trackList = getAllTracks(this.app, baseFolder);

		const trackListContainer = container.createEl('div', { cls: 'storyscore-track-list-container' });

		const projectSelect = trackListContainer.createEl('select', { cls: 'dropdown storyscore-project-select' });

		projectSelect.createEl('option', { text: t('MANAGER_ALL_TRACKS'), value: 'all' });

		ostList.forEach(ost => {
			const opt = projectSelect.createEl('option', { text: ost.title, value: ost.id });
			if (ost.id === this.currentAlbumFilter) {
				opt.selected = true;
			}
		});

		projectSelect.onchange = () => {
			this.currentAlbumFilter = projectSelect.value;
			this.renderView();
		};

		let filteredTracks = trackList;
		if (this.currentAlbumFilter !== 'all') {
			filteredTracks = trackList.filter(track => track.albumId === this.currentAlbumFilter);
		}

		if (filteredTracks.length === 0) {
			trackListContainer.createEl('p', { text: t('MANAGER_EMPTY_FILTER'), cls: 'storyscore-empty-filter' });
		} else {
			filteredTracks.forEach(track => {
				const cardWrapper = trackListContainer.createEl('div');
				const ost = ostList.find(o => o.id === track.albumId);
				renderTrackCard(cardWrapper, track, ost, this.app, this.plugin);
			});
		}
	}

	async onClose() {}
}
