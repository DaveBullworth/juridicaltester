import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ChevronDown, Play } from "lucide-react";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogDescription
} from "@/components/ui/dialog";
import type { Module, Topic } from "@/types";

type Props = {
	topic: Topic;
	checked: boolean;
	onToggleChecked: () => void;
	onRequestOpen: () => void | Promise<void>;
	loading: boolean;
	isOpen: boolean;
	modules: Module[];
};

export function TopicPanel({
	topic,
	checked,
	onToggleChecked,
	onRequestOpen,
	loading,
	isOpen,
	modules
}: Props) {
	const navigate = useNavigate();
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
	const [confirmModule, setConfirmModule] = useState<Module | null>(null);
	const [questionCount, setQuestionCount] = useState<number>(topic.questionCount ?? 1);

	const handleStartTest = () => {
		const state = confirmModule
			? { mode: "module", moduleId: confirmModule.id }
			: { mode: "theme", themeId: topic.id, count: questionCount };

		navigate("/test", { state });

		// Закрываем модалку и сбрасываем модуль
		setIsConfirmModalOpen(false);
		setConfirmModule(null);
	};

	return (
		<div className="flex justify-between gap-4 w-full items-start">
			{/* Левая часть — Accordion */}
			<AccordionItem className="flex-1 cursor-pointer" value={String(topic.id)}>
				<Card className="w-full py-0">
					<div className="flex justify-between  w-full items-center">
						{/* Заголовок */}
						<AccordionTrigger
							className="flex items-center justify-between px-4 py-4 text-base font-semibold text-left cursor-pointer"
							onClick={e => {
								e.preventDefault();
								onRequestOpen();
							}}
						>
							{/* Слева: номер и заголовок */}
							<div className="flex items-center gap-3">
								<div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white font-semibold select-none">
									{topic.order}
								</div>
								<h4 className="scroll-m-20 text-xl tracking-tight">{topic.title}</h4>
							</div>

							{/* Справа: иконка загрузки/стрелки */}
							<div className="flex items-center gap-2">
								<p className="text-muted-foreground text-xs">{topic.questionCount} вопросов</p>
								{/* Иконка loader или стрелка */}
								{loading ? (
									<Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
								) : (
									<ChevronDown
										className={`w-4 h-4 text-muted-foreground pointer-events-none shrink-0 translate-y-0.5 transition-transform duration-200 ${
											isOpen ? "rotate-180" : ""
										}`}
									/>
								)}
							</div>
						</AccordionTrigger>

						{/* Чекбокс */}
						<Tooltip>
							<TooltipTrigger asChild className="flex mr-4">
								<div>
									<Checkbox
										checked={checked}
										onCheckedChange={onToggleChecked}
										onClick={e => e.stopPropagation()}
										onPointerDown={e => e.preventDefault()} // блокируем фокус и раскрытие панели
										aria-label={`Выбрать тему ${topic.title}`}
									/>
								</div>
							</TooltipTrigger>
							<TooltipContent>
								<p>Выбрать тему для теста по выбранным темам</p>
							</TooltipContent>
						</Tooltip>
					</div>

					<AccordionContent className="bg-gray-100 rounded-b-[10px]">
						<Separator />
						<CardContent className="p-4 cursor-default">
							{modules.length > 0 ? (
								<ul className="divide-y divide-gray-200 bg-white dark:divide-gray-700 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
									{modules.map(module => (
										<li
											key={module.id}
											className="flex items-center justify-between px-4 py-2 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300
													 hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors duration-150 select-none
													 active:bg-indigo-100 dark:active:bg-indigo-800"
											onClick={() => {
												setConfirmModule(module);
												setIsConfirmModalOpen(true);
											}}
										>
											{/* Слева порядковый номер + название */}
											<div className="flex items-center gap-3">
												<div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-white text-xs select-none">
													{module.order ?? modules.indexOf(module) + 1}
												</div>
												<span>{module.title}</span>
											</div>

											{/* Справа: кол-во вопросов + разделитель + кнопка play */}
											<div className="flex items-center gap-3">
												{/* Кол-во вопросов */}
												<span className="text-muted-foreground text-xs select-none">
													{module.questionCount} вопросов
												</span>

												{/* Кнопка play */}
												<Tooltip>
													<TooltipTrigger asChild>
														<Play className="w-4 h-4" />
													</TooltipTrigger>
													<TooltipContent>
														<p>Тест по модулю</p>
													</TooltipContent>
												</Tooltip>
											</div>
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

			{/* Правая панель — внешняя */}
			<div className="flex flex-row items-center justify-center mt-3">
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="outline"
							size="icon"
							onClick={e => {
								e.stopPropagation();
								setConfirmModule(null); // тема
								setIsConfirmModalOpen(true);
							}}
						>
							<Play className="w-4 h-4" />
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>Тест по теме</p>
					</TooltipContent>
				</Tooltip>
			</div>

			{/* Confirm Modal */}
			<Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Вы уверены?</DialogTitle>
					</DialogHeader>
					<DialogDescription className="text-sm text-muted-foreground mb-4">
						Вы действительно хотите начать тест{" "}
						{confirmModule
							? `по модулю "${confirmModule.title}" в теме "${topic.title}"?`
							: `по теме "${topic.title}"?`}
					</DialogDescription>
					{/* Выбор количества вопросов */}
					{!confirmModule && (
						<div className="mb-4">
							<p className="text-sm font-medium mb-2">Количество вопросов:</p>
							<div className="flex items-center gap-2">
								<Input
									type="number"
									className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
									min={1}
									max={topic.questionCount}
									value={questionCount}
									onChange={e => setQuestionCount(Number(e.target.value))}
								/>

								{/* Ползунок (Slider из ShadCN) */}
								<div className="flex-1">
									<Slider
										value={[questionCount]}
										min={1}
										max={topic.questionCount}
										step={1}
										onValueChange={([value]) => setQuestionCount(value)}
									/>
								</div>
							</div>
						</div>
					)}
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsConfirmModalOpen(false)}>
							Отмена
						</Button>
						<Button onClick={handleStartTest}>Начать тест</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
