export interface TrackResult {
	path: string;
	basename: string;
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
