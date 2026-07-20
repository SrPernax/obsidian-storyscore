import { App, PluginSettingTab, Setting, setIcon, sanitizeHTMLToDom } from 'obsidian';
import StoryScorePlugin from './main';
import { t } from './locales/lenguajes';

export interface StoryScoreSettings {
	baseFolder: string;
	compactMode: boolean;
}

export const DEFAULT_SETTINGS: StoryScoreSettings = {
	baseFolder: 'StoryScore',
	compactMode: false,
};

export class StoryScoreSettingTab extends PluginSettingTab {
	plugin: StoryScorePlugin;
	activeTab: 'folders' | 'help' | 'design' = 'folders';

	constructor(app: App, plugin: StoryScorePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		
		const headerBox = containerEl.createDiv({ cls: 'storyscore-settings-header' });

		const isDarkTheme = document.body.classList.contains('theme-dark');
		const logoFilename = isDarkTheme ? 'logo-white.png' : 'logo-black.png';
		const logoPath = this.app.vault.adapter.getResourcePath(`.obsidian/plugins/storyscore/assets/plugin/${logoFilename}`);
		
		const logo = headerBox.createEl('img', { cls: 'storyscore-settings-logo' });
		logo.src = logoPath;

		const textContainer = headerBox.createDiv({ cls: 'storyscore-settings-title-box' });
		textContainer.createSpan({ text: 'StoryScore', cls: 'storyscore-settings-title' });
		textContainer.createSpan({ text: `v${this.plugin.manifest.version}`, cls: 'storyscore-settings-version' });
		
		const wrapper = containerEl.createDiv({ cls: 'storyscore-settings-wrapper' });
		
		const sidebar = wrapper.createDiv({ cls: 'storyscore-settings-sidebar' });
		
		this.createSidebarButton(sidebar, 'folder', t('SETTINGS_TAB_FOLDERS'), 'folders');
		this.createSidebarButton(sidebar, 'brush', t('SETTINGS_TAB_DESIGN'), 'design');
		this.createSidebarButton(sidebar, 'help-circle', t('SETTINGS_TAB_HELP'), 'help');
		
		const footer = sidebar.createDiv({ cls: 'storyscore-settings-footer' });
		footer.createSpan({ text: t('SETTINGS_CREATED_BY') });
		const authorBtn = footer.createEl('button', { text: 'Pernax', cls: 'storyscore-settings-author-btn' });
		authorBtn.onclick = () => window.open("https://github.com/SrPernax");
		
		const content = wrapper.createDiv({ cls: 'storyscore-settings-content' });
		
		if (this.activeTab === 'folders') {
			this.renderFoldersTab(content);
		} else if (this.activeTab === 'design') {
			this.renderDesignTab(content);
		} else if (this.activeTab === 'help') {
			this.renderHelpTab(content);
		}
	}
	
	createSidebarButton(container: HTMLElement, iconId: string, label: string, tabId: 'folders' | 'help' | 'design') {
		const btn = container.createEl('button', { cls: 'storyscore-settings-tab-btn' });
		if (this.activeTab === tabId) {
			btn.addClass('is-active');
		}
		
		const iconEl = btn.createSpan();
		setIcon(iconEl, iconId);
		btn.createSpan({ text: label });
		
		btn.onclick = () => {
			this.activeTab = tabId;
			this.display();
		};
	}
	
	renderFoldersTab(container: HTMLElement) {
		new Setting(container)
			.setName(t('SETTINGS_BASE_FOLDER_NAME'))
			.setDesc(t('SETTINGS_BASE_FOLDER_DESC'))
			.addText((text) =>
				text
					.setPlaceholder(t('SETTINGS_BASE_FOLDER_PLACEHOLDER'))
					.setValue(this.plugin.settings.baseFolder)
					.onChange(async (value) => {
						this.plugin.settings.baseFolder = value.trim() || 'StoryScore';
						await this.plugin.saveSettings();
					}),
			);
	}
	
	renderDesignTab(container: HTMLElement) {
		new Setting(container)
			.setName(t('SETTINGS_COMPACT_MODE'))
			.setDesc(t('SETTINGS_COMPACT_MODE_DESC'))
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.compactMode)
				.onChange(async (value) => {
					this.plugin.settings.compactMode = value;
					await this.plugin.saveSettings();
				})
			);
	}

	renderHelpTab(container: HTMLElement) {
		container.createDiv({ cls: 'storyscore-settings-spacer' });
		
		const guides = [
			{ title: t('HELP_GUIDE1_TITLE'), desc: t('HELP_GUIDE1_DESC') },
			{ title: t('HELP_GUIDE2_TITLE'), desc: t('HELP_GUIDE2_DESC') },
			{ title: t('HELP_GUIDE3_TITLE'), desc: t('HELP_GUIDE3_DESC') },
			{ title: t('HELP_GUIDE4_TITLE'), desc: t('HELP_GUIDE4_DESC') },
			{ title: t('HELP_GUIDE5_TITLE'), desc: t('HELP_GUIDE5_DESC') }
		];
		
		for(const guide of guides) {
			const details = container.createEl('details', { cls: 'storyscore-help-guide' });
			const summary = details.createEl('summary', { cls: 'storyscore-help-guide-summary' });
			summary.setText(guide.title);
			
			const contentDiv = details.createDiv({ cls: 'storyscore-help-guide-content' });
			contentDiv.appendChild(sanitizeHTMLToDom(guide.desc));
		}
		
		container.createDiv({ cls: 'storyscore-settings-spacer' });
		const s1 = new Setting(container)
			.setName(t('HELP_SUPPORT_DEV'))
			.setDesc(t('HELP_SUPPORT_DEV_DESC'))
			.addButton(btn => btn.setButtonText(t('HELP_BUY_COFFEE')).onClick(() => {
				window.open("https://ko-fi.com/pernax");
			}));
		const i1 = s1.nameEl.createSpan({ cls: 'storyscore-help-icon' });
		setIcon(i1, 'heart');
		s1.nameEl.prepend(i1);
		s1.nameEl.addClass('storyscore-setting-name');
			
		container.createDiv({ cls: 'storyscore-settings-spacer' });
		const s2 = new Setting(container)
			.setName(t('HELP_PLUGIN_INFO'))
			.setDesc(t('HELP_PLUGIN_INFO_DESC'))
			.addButton(btn => btn.setButtonText(t('HELP_GITHUB')).onClick(() => {
				window.open("https://github.com/SrPernax/obsidian-storyscore");
			}));
		const i2 = s2.nameEl.createSpan({ cls: 'storyscore-help-icon' });
		setIcon(i2, 'info');
		s2.nameEl.prepend(i2);
		s2.nameEl.addClass('storyscore-setting-name');
			
		const s3 = new Setting(container)
			.setName(t('HELP_CONTACT'))
			.setDesc(t('HELP_CONTACT_DESC'))
			.addButton(btn => btn.setButtonText(t('HELP_OPEN_ISSUE')).onClick(() => {
				window.open("https://github.com/SrPernax/obsidian-storyscore/issues/new");
			}));
		const i3 = s3.nameEl.createSpan({ cls: 'storyscore-help-icon' });
		setIcon(i3, 'bug');
		s3.nameEl.prepend(i3);
		s3.nameEl.addClass('storyscore-setting-name');
	}
}
