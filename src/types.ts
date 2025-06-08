export interface Topic {
	id: number;
	title: string;
	order: number;
	questionCount?: number;
}

export interface Module {
	id: number;
	title: string;
	order: number;
	topicId: number;
	questionCount?: number;
}

export interface Answer {
	id: number | string;
	text: string;
	isCorrect: boolean;
}

export interface Question {
	id: number | string;
	text: string;
	answers: Answer[];
}
