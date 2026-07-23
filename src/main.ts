import {Editor, MarkdownView, MarkdownFileInfo, Plugin, WorkspaceLeaf} from 'obsidian';
import { DEFAULT_SETTINGS, StoryScoreSettings, StoryScoreSettingTab } from './settings';
import { NewTrackModal } from "./ui/creators/add-track";
import { StoryScoreView, VIEW_TYPE_STORYSCORE } from "./ui/manager";
import { NewSoundtrackModal } from "./ui/creators/add-sountrack";
import { TrackInsertModal } from "./core/commands/insert-track";
import { SoundtrackInsertModal } from "./core/commands/insert-soundtrack";
import { LeitmotifInsertModal } from "./core/commands/insert-leitmotif";

import {renderTrackCard} from "./ui/cards/track-card";
import {renderSoundtrackCard} from "./ui/cards/soundtrack-card";
import {renderLeitmotifCard} from "./ui/cards/leitmotif-card";
import {getTrackById} from "./core/queries/track-queries";
import {getSoundtrackById} from "./core/queries/soundtrack-queries";
import {getLeitmotifById} from "./core/queries/leitmotif-queries";
import { NewLeitmotifModal } from "./ui/creators/add-leitmotif";
import { t } from "./locales/lenguajes";

export default class StoryScorePlugin extends Plugin {
	settings!: StoryScoreSettings;

	async onload() {
		await this.loadSettings();

		this.registerView(
			VIEW_TYPE_STORYSCORE,
			(leaf) => new StoryScoreView(leaf, this)
		);

		this.addRibbonIcon('library', t('CMD_OPEN_STORYSCORE'), () => {
			void this.activateView();
		});

		this.addRibbonIcon('disc', t('CMD_NEW_SOUNDTRACK'), (_evt: MouseEvent) => {
			new NewSoundtrackModal(this.app, null, this).open();
		});

		this.addRibbonIcon('music', t('CMD_NEW_TRACK'), () => {
			new NewTrackModal(this.app, undefined, this).open();
		});

		this.addRibbonIcon('audio-lines', t('CMD_NEW_LEITMOTIF'), () => {
			new NewLeitmotifModal(this.app, null, this).open();
		});

		this.addCommand({
			id: 'open-lobby',
			name: t('CMD_OPEN_MANAGER'),
			callback: () => {
				void this.activateView();
			},
		});

		this.addCommand({
			id: 'add-new-track',
			name: t('CMD_NEW_TRACK'),
			callback: () => {
				new NewTrackModal(this.app, undefined, this).open();
			},
		});

		this.addCommand({
			id: 'add-new-ost',
			name: t('CMD_NEW_SOUNDTRACK'),
			callback: () => {
				new NewSoundtrackModal(this.app, null, this).open();
			},
		});

		this.addCommand({
			id: 'add-new-leitmotif',
			name: t('CMD_NEW_LEITMOTIF'),
			callback: () => {
				new NewLeitmotifModal(this.app, null, this).open();
			},
		});

		this.addCommand({
			id: 'insert-track',
			name: t('CMD_INSERT_TRACK'),
			
			editorCallback: (editor: Editor, view: MarkdownView | MarkdownFileInfo) => {
				new TrackInsertModal(this.app, editor, this).open();
			}
		});

		this.addCommand({
			id: 'insert-ost',
			name: t('CMD_INSERT_OST') || 'Insert Soundtrack Card',
			editorCallback: (editor: Editor, view: MarkdownView | MarkdownFileInfo) => {
				new SoundtrackInsertModal(this.app, editor, this).open();
			}
		});

		this.addCommand({
			id: 'insert-lm',
			name: t('CMD_INSERT_LM') || 'Insert Leitmotif Card',
			editorCallback: (editor: Editor, view: MarkdownView | MarkdownFileInfo) => {
				new LeitmotifInsertModal(this.app, editor, this).open();
			}
		});
		
		this.addSettingTab(new StoryScoreSettingTab(this.app, this));

		this.registerMarkdownCodeBlockProcessor("storyscore", (source, el, ctx) => {
			let inputId = source.trim();

			if (inputId.toLowerCase().startsWith('id:')) {
				inputId = inputId.substring(3).trim();
			} else if (inputId.toLowerCase().startsWith('st:')) {
				inputId = inputId.substring(3).trim();
			} else if (inputId.toLowerCase().startsWith('ost:')) {
				inputId = inputId.substring(4).trim();
			}
			
			const baseFolder = this.settings.baseFolder || 'StoryScore';
			
			if (inputId.startsWith('LM-')) {
				const lm = getLeitmotifById(this.app, baseFolder, inputId);
				if (lm) {
					renderLeitmotifCard(el, lm, this.app, this);
				} else {
					el.createEl("p", { text: t('CODEBLOCK_ERR', inputId), cls: "resonance-error" });
				}
				return;
			}
			
			if (inputId.startsWith('ST-')) {
				const ost = getSoundtrackById(this.app, baseFolder, inputId);
				if (ost) {
					renderSoundtrackCard(el, ost, this.app, this);
				} else {
					el.createEl("p", { text: t('CODEBLOCK_ERR', inputId), cls: "resonance-error" });
				}
				return;
			}
			
			const track = getTrackById(this.app, baseFolder, inputId);
			if (track) {
				const ost = getSoundtrackById(this.app, baseFolder, track.albumId);
				renderTrackCard(el, track, ost, this.app, this);
			} else {
				el.createEl("p", { text: t('CODEBLOCK_ERR', inputId), cls: "resonance-error" });
			}
		});
	}

	async activateView() {
		const { workspace } = this.app;
		let leaf: WorkspaceLeaf;

		const leaves = workspace.getLeavesOfType(VIEW_TYPE_STORYSCORE);

		if (leaves.length > 0) {
			leaf = leaves[0]!;
		} else {
			leaf = workspace.getLeaf('tab')!;
			await leaf.setViewState({ type: VIEW_TYPE_STORYSCORE, active: true });
		}

		void workspace.revealLeaf(leaf);
	}

	onunload() {
		
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<StoryScoreSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
