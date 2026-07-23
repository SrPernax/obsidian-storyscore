import {TFile} from "obsidian";
export interface TrackResult {
	file: TFile;
	id: string;
	title: string;
	description?: string;
	albumId: string;
	audio?: string;
	type?: string;
	status?: string;
	lyrics?: string;
	diegesis?: string;
	leitmotifs?: string[];
}
