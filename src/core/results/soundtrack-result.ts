import {TFile} from "obsidian";

export interface SoundtrackResult {
	file: TFile;
	id: string;
	title: string;
	cover?: string;
}
