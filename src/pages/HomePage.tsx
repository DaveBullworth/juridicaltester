import { useEffect, useState } from "react";
import { topicsService } from "../db/client";
import { Topic } from "@/types";
import { TopicPanel } from "../components/TopicPanel";

export default function HomePage() {
	const [topics, setTopics] = useState<Topic[]>([]);
	const [selectedTopics, setSelectedTopics] = useState<number[]>([]);

	useEffect(() => {
		topicsService.getAll().then(setTopics);
	}, []);

	const toggleTopicSelection = (id: number) => {
		setSelectedTopics(prev => (prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]));
	};

	const startTestAll = () => {
		console.log("Начать тест по всем темам");
	};

	const startTestSelected = () => {
		console.log("Начать тест по выбранным темам:", selectedTopics);
	};

	return (
		<div className="p-4 max-w-4xl mx-auto">
			<h1 className="text-2xl font-bold mb-4">Выбор темы</h1>

			<div className="flex gap-2 mb-4">
				<button onClick={startTestAll} className="btn btn-primary">
					Тест по всем темам
				</button>
				<button onClick={startTestSelected} className="btn btn-outline">
					Тест по выбранным темам
				</button>
			</div>

			{topics.map(topic => (
				<TopicPanel
					key={topic.id}
					topic={topic}
					checked={selectedTopics.includes(topic.id)}
					onToggleChecked={() => toggleTopicSelection(topic.id)}
				/>
			))}
		</div>
	);
}
