export interface Topic {
	id: number;
	title: string;
	description?: string;
	order: number;
}

export interface Module {
	id: number;
	title: string;
	order: number;
	topicId: number;
	questionCount?: number;
}
