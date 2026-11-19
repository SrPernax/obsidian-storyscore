export interface LeitmotifResult {
	path: string;
	basename: string;
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
