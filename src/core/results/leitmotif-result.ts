import { TFile } from "obsidian";

export interface LeitmotifResult {
	file: TFile;
	id: string;
	title: string;
	description?: string;
	entityType?: string;
	entityNote?: string;
	motifType?: string;
	audio?: string;
	musicalAnnotations: string;
	color?: string;
	customEntityType?: string;
}
