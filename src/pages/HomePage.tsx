import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogDescription
} from "@/components/ui/dialog";
import { TopicsService } from "@/db/client";
import { TopicPanel } from "@/components/TopicPanel";
import type { Topic, Module } from "@/types";

export default function HomePage() {
	const navigate = useNavigate();
	const [topics, setTopics] = useState<Topic[]>([]);
	const [selectedTopics, setSelectedTopics] = useState<number[]>([]);
	const [openItem, setOpenItem] = useState<string>("");
	const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
	const [modulesMap, setModulesMap] = useState<Record<number, Module[]>>({});
	const [loadingTopics, setLoadingTopics] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
	const [confirmAction, setConfirmAction] = useState<"all" | "selected" | null>(null);
	const [questionCount, setQuestionCount] = useState<number>(1);
	const [inputValue, setInputValue] = useState<string>("1");

	const maxQuestions =
		confirmAction === "all"
			? topics.reduce((sum, topic) => sum + (topic.questionCount ?? 0), 0)
			: topics
					.filter(topic => selectedTopics.includes(topic.id))
					.reduce((sum, topic) => sum + (topic.questionCount ?? 0), 0);

	// === MAIN CHECKBOX STATE ===
	const allSelected = selectedTopics.length === topics.length && topics.length > 0;

	useEffect(() => {
		TopicsService.getAll()
			.then(data => {
				setTopics(data);
				setLoadingTopics(false);
			})
			.catch(e => {
				console.error(e);
				setError("Не удалось загрузить список тем.");
				setLoadingTopics(false);
			});
	}, []);

	useEffect(() => {
		if (isConfirmModalOpen) {
			let maxCount = 0;
			if (confirmAction === "all") {
				maxCount = topics.reduce((sum, topic) => sum + (topic.questionCount ?? 0), 0);
			} else if (confirmAction === "selected") {
				maxCount = topics
					.filter(topic => selectedTopics.includes(topic.id))
					.reduce((sum, topic) => sum + (topic.questionCount ?? 0), 0);
			}
			// Автоустановим макс или хотя бы 1
			setQuestionCount(maxCount > 0 ? maxCount : 1);
		}
	}, [isConfirmModalOpen, confirmAction, topics, selectedTopics]);

	const toggleTopicSelection = (id: number) => {
		setSelectedTopics(prev => (prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]));
	};

	const handleStartTest = () => {
		if (confirmAction) {
			navigate("/test", {
				state: {
					mode: confirmAction === "all" ? "all" : "themes",
					themeIds: confirmAction === "selected" ? selectedTopics : undefined,
					count: questionCount
				}
			});
		}

		// Закрываем модалку
		setIsConfirmModalOpen(false);
		setConfirmAction(null);
	};

	const onRequestOpen = async (id: string) => {
		if (openItem === id) {
			setOpenItem("");
			return;
		}

		if (loadingMap[id]) return;

		setLoadingMap(prev => ({ ...prev, [id]: true }));

		try {
			if (!modulesMap[Number(id)]) {
				const data = await TopicsService.getOneWithModules(Number(id));
				setModulesMap(prev => ({ ...prev, [Number(id)]: data.modules }));
			}
			setOpenItem(id);
		} catch (e) {
			console.error(e);
			setError("Не удалось загрузить модули для выбранной темы.");
		} finally {
			setLoadingMap(prev => ({ ...prev, [id]: false }));
		}
	};

	const handleToggleAll = (checked: boolean) => {
		if (checked) {
			setSelectedTopics(topics.map(topic => topic.id));
		} else {
			setSelectedTopics([]);
		}
	};

	// при вводе руками
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const raw = e.target.value;
		setInputValue(raw);

		// если пусто — пока просто не трогаем questionCount
		if (raw === "") return;

		const num = Number(raw);

		if (!isNaN(num)) {
			// clamp в пределах [1, maxQuestions]
			const clamped = Math.min(Math.max(num, 1), maxQuestions);
			setQuestionCount(clamped);
		}
	};

	// при уходе фокуса из инпута — "доводим" пустое значение до валидного
	const handleInputBlur = () => {
		if (inputValue === "") {
			setInputValue("1");
			setQuestionCount(1);
		} else {
			setInputValue(String(questionCount));
		}
	};

	// при изменении слайдера
	const handleSliderChange = (values: number[]) => {
		const val = values[0];
		setQuestionCount(val);
		setInputValue(String(val));
	};

	return (
		<div className="p-6 max-w-4xl mx-auto space-y-6">
			<h1 className="text-3xl font-semibold">Выбор темы</h1>

			<div className="flex gap-4">
				<Button
					className="cursor-pointer"
					onClick={() => {
						setConfirmAction("all");
						setIsConfirmModalOpen(true);
					}}
				>
					Тест по всем темам
				</Button>
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<div>
								<Button
									className="cursor-pointer"
									variant="outline"
									disabled={selectedTopics.length === 0}
									onClick={() => {
										setConfirmAction("selected");
										setIsConfirmModalOpen(true);
									}}
								>
									Тест по выбранным темам
								</Button>
							</div>
						</TooltipTrigger>
						{selectedTopics.length === 0 && (
							<TooltipContent>Выберите хотя бы одну тему</TooltipContent>
						)}
					</Tooltip>
				</TooltipProvider>
			</div>

			{/* Select All Checkbox */}
			<div className="flex items-center space-x-2">
				<Checkbox
					checked={allSelected}
					onCheckedChange={checked => handleToggleAll(checked === true)}
					id="select-all"
				/>
				<Label htmlFor="select-all" className="text-sm font-medium leading-none cursor-pointer">
					Выбрать все темы
				</Label>
			</div>

			{loadingTopics ? (
				// Показываем skeletonы (например, 4 заглушки)
				Array.from({ length: 4 }).map((_, i) => (
					<div key={i} className="mb-2">
						<Skeleton className="h-20 w-full rounded-lg" />
					</div>
				))
			) : (
				<Accordion type="single" className="w-full" value={openItem}>
					{topics.map(topic => (
						<TopicPanel
							key={topic.id}
							topic={topic}
							checked={selectedTopics.includes(topic.id)}
							onToggleChecked={() => toggleTopicSelection(topic.id)}
							onRequestOpen={() => onRequestOpen(String(topic.id))}
							loading={!!loadingMap[String(topic.id)]}
							isOpen={openItem === String(topic.id)}
							modules={modulesMap[topic.id] || []} // Передаём модули сюда
						/>
					))}
				</Accordion>
			)}

			{error && (
				<Alert variant="destructive">
					<AlertTitle>Ошибка</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{/* Confirm Modal */}
			<Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Вы уверены?</DialogTitle>
					</DialogHeader>
					<DialogDescription className="text-sm text-muted-foreground mb-4">
						Вы действительно хотите начать тест{" "}
						{confirmAction === "all" ? "по всем темам" : "по выбранным темам"}?
					</DialogDescription>

					{confirmAction === "selected" && selectedTopics.length > 0 && (
						<div className="mb-4">
							<p className="text-sm font-medium mb-2">Выбранные темы:</p>
							<ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
								{topics
									.filter(topic => selectedTopics.includes(topic.id))
									.map(topic => (
										<li key={topic.id}>{topic.title}</li>
									))}
							</ul>
						</div>
					)}

					{/* Выбор количества вопросов */}
					<div className="mb-4">
						<p className="text-sm font-medium mb-2">Количество вопросов:</p>
						<div className="flex items-center gap-2">
							<Input
								type="number"
								className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
								min={1}
								max={maxQuestions}
								value={inputValue}
								onChange={handleInputChange}
								onBlur={handleInputBlur}
							/>

							{/* Ползунок (Slider из ShadCN) */}
							<div className="flex-1">
								<Slider
									value={[questionCount]}
									min={1}
									max={maxQuestions}
									step={1}
									onValueChange={handleSliderChange}
								/>
							</div>
						</div>
					</div>

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
