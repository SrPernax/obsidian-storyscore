import {App, ButtonComponent, Notice, TFile} from 'obsidian';
import {LeitmotifData} from "../../core/dtos/leitmotif-data";
import {LeitmotifResult} from "../../core/results/leitmotif-result";
import {LeitmotifInfoModal} from "../informations/leitmotif-info";

import type StoryScorePlugin from "../../main";

export class LeitmotifTagButton {
	public button: HTMLButtonElement;
	constructor(
		app: App,
		public containerEl: HTMLElement,
		public leitmotif: LeitmotifResult,
		plugin: StoryScorePlugin,
		onClickCallback?: () => void
	) {
		const btnComponent = new ButtonComponent(containerEl)
			.setButtonText(leitmotif.title) 
			.onClick(() => {
				if (onClickCallback) onClickCallback();
				new LeitmotifInfoModal(app, leitmotif, plugin).open();
			});
		
		btnComponent.buttonEl.addClass("storyscore-leitmotif-tag");
		btnComponent.buttonEl.addClass("storyscore-leitmotif-pill");
		btnComponent.buttonEl.addClass("storyscore-clickable-tag");
		
		if (leitmotif.color) {
			btnComponent.buttonEl.style.background = `linear-gradient(135deg, ${leitmotif.color}80 0%, var(--background-secondary) 100%)`;
			btnComponent.buttonEl.style.border = `1px solid ${leitmotif.color}40`;
		}

		this.button = btnComponent.buttonEl;
	}
}
