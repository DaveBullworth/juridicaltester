import { useState } from "react";
import { ChevronDown, Play } from "lucide-react";
import { topicsService } from "../db/client";
import { Module, Topic } from "@/types";

type Props = {
	topic: Topic;
	checked: boolean;
	onToggleChecked: () => void;
};

export function TopicPanel({ topic, checked, onToggleChecked }: Props) {
	const [expanded, setExpanded] = useState(false);
	const [modules, setModules] = useState<Module[]>([]);

	const handleExpand = async () => {
		if (!expanded) {
			const data = await topicsService.getOneWithModules(topic.id);
			setModules(data.modules);
		}
		setExpanded(prev => !prev);
	};

	const handleStartTest = () => {
		console.log("Начать тест по теме:", topic);
	};

	return (
		<div className="border rounded mb-2 overflow-hidden">
			<div
				className="flex items-center justify-between p-3 cursor-pointer bg-gray-100 hover:bg-gray-200"
				onClick={handleExpand}
				onKeyDown={e => {
					if (e.key === "Enter" || e.key === " ") handleExpand();
				}}
				role="button"
				tabIndex={0}
			>
				<div className="flex items-center gap-2">
					<ChevronDown className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
					<span className="font-semibold">{topic.name}</span>
				</div>

				<div className="flex items-center gap-2">
					<button
						title="Тест по этой теме"
						onClick={e => {
							e.stopPropagation();
							handleStartTest();
						}}
					>
						<Play className="w-5 h-5 text-blue-500" />
					</button>
					<input
						type="checkbox"
						checked={checked}
						onChange={e => {
							e.stopPropagation();
							onToggleChecked();
						}}
					/>
				</div>
			</div>

			{expanded && (
				<div className="p-3 bg-white border-t">
					<ul className="list-disc list-inside text-sm text-gray-800">
						{modules.map(module => (
							<li key={module.id}>
								{module.name} — {module.questionCount} вопросов
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}
