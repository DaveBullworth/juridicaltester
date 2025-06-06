import { useState } from "react";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Play } from "lucide-react";
import { topicsService } from "@/db/client";
import type { Module, Topic } from "@/types";

type Props = {
	topic: Topic;
	checked: boolean;
	onToggleChecked: () => void;
};

export function TopicPanel({ topic, checked, onToggleChecked }: Props) {
	const [modules, setModules] = useState<Module[]>([]);
	const [loaded, setLoaded] = useState(false);

	const handleExpand = async () => {
		if (!loaded) {
			const data = await topicsService.getOneWithModules(topic.id);
			setModules(data.modules);
			setLoaded(true);
		}
	};

	const handleStartTest = () => {
		console.log("Начать тест по теме:", topic);
	};

	return (
		<AccordionItem className="!border-b-0" value={String(topic.id)} onClick={handleExpand}>
			<Card className="w-full">
				<AccordionTrigger className="flex items-center justify-between px-4 py-0">
					<span className="text-base font-medium text-left">{topic.title}</span>

					<div className="flex items-center gap-3">
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									onClick={e => {
										e.stopPropagation();
										handleStartTest();
									}}
								>
									<Play className="w-4 h-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Тест по теме</p>
							</TooltipContent>
						</Tooltip>

						<Checkbox
							checked={checked}
							onCheckedChange={() => {
								// Тут вообще если-что есть value
								onToggleChecked();
							}}
							onClick={e => e.stopPropagation()}
						/>
					</div>
				</AccordionTrigger>

				<AccordionContent>
					<CardContent className="pb-4 pt-2">
						{modules.length > 0 ? (
							<ul className="space-y-1 text-sm text-muted-foreground pl-4 list-disc">
								{modules.map(module => (
									<li key={module.id}>
										{module.title} — {module.questionCount} вопросов
									</li>
								))}
							</ul>
						) : (
							<p className="text-sm text-muted-foreground">Нет модулей</p>
						)}
					</CardContent>
				</AccordionContent>
			</Card>
		</AccordionItem>
	);
}
