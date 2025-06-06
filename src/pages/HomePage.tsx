import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { topicsService } from "@/db/client";
import { TopicPanel } from "@/components/TopicPanel";
import type { Topic } from "@/types";

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
		<div className="p-6 max-w-4xl mx-auto space-y-6">
			<h1 className="text-3xl font-semibold">Выбор темы</h1>

			<div className="flex gap-4">
				<Button onClick={startTestAll}>Тест по всем темам</Button>
				<Button variant="outline" onClick={startTestSelected}>
					Тест по выбранным темам
				</Button>
			</div>

			<Accordion type="multiple" className="w-full">
				{topics.map(topic => (
					<TopicPanel
						key={topic.id}
						topic={topic}
						checked={selectedTopics.includes(topic.id)}
						onToggleChecked={() => toggleTopicSelection(topic.id)}
					/>
				))}
			</Accordion>
		</div>
	);
}
