import { useEffect, useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { RandomService, ModuleService } from "@/db/client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
	Carousel,
	CarouselContent,
	CarouselPrevious,
	CarouselNext,
	CarouselItem
} from "@/components/ui/carousel";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter
} from "@/components/ui/dialog";
import { type CarouselApi } from "@/components/ui/carousel";
import type { Question, Answer } from "@/types";
import { Badge } from "@/components/ui/badge";

function TestPage() {
	const location = useLocation();
	const navigate = useNavigate();

	// Тип для ответов пользователя
	type UserAnswers = Record<Question["id"], Answer["id"][]>;

	const { mode, moduleId, themeId, themeIds, count } = (location.state || {}) as {
		mode: "module" | "theme" | "themes" | "all";
		moduleId?: number;
		themeId?: number;
		themeIds?: number[];
		count?: number;
	};

	const [carouselApi, setCarouselApi] = useState<CarouselApi>();
	const [currentIndex, setCurrentIndex] = useState(0);

	const [questions, setQuestions] = useState<Question[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	// confirmedAnswers: Set questionId для подтверждённых вопросов
	const [confirmedAnswers, setConfirmedAnswers] = useState(new Set());
	// Текущее состояние ответов пользователя
	const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
	// состояние модалки выхода
	const [showExitDialog, setShowExitDialog] = useState(false);

	const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);
	const [startTime, setStartTime] = useState(() => Date.now());
	const [elapsedTime, setElapsedTime] = useState(0);

	const results = useMemo(() => {
		let correct = 0;
		let partial = 0;
		let incorrect = 0;

		for (const q of questions) {
			const status = getQuestionStatus(q);
			if (status === "correct") correct++;
			else if (status === "partial") partial++;
			else if (status === "incorrect") incorrect++;
		}

		return { correct, partial, incorrect };
	}, [questions, confirmedAnswers, userAnswers]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				setError(null);

				if (mode === "module" && moduleId) {
					const res = await ModuleService.getOneWithQuestionsAndAnswers(moduleId);
					setQuestions(res.questions);
				} else if (mode === "theme" && themeId && count) {
					const res = await RandomService.getRandomByTheme(themeId, count);
					setQuestions(res);
				} else if (mode === "themes" && themeIds && count) {
					const res = await RandomService.getRandomGlobal(count, themeIds);
					setQuestions(res);
				} else if (mode === "all" && count) {
					const res = await RandomService.getRandomGlobal(count);
					setQuestions(res);
				} else {
					throw new Error("Некорректные параметры запуска теста.");
				}
			} catch (e) {
				console.error(e);
				setError("Ошибка при загрузке теста.");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [mode, moduleId, themeId, themeIds, count]);

	useEffect(() => {
		if (!carouselApi) return;

		setCurrentIndex(carouselApi.selectedScrollSnap()); // при инициализации
		carouselApi.on("select", () => {
			setCurrentIndex(carouselApi.selectedScrollSnap());
		});
	}, [carouselApi]);

	// Получить статус вопроса для цвета лампочки
	function getQuestionStatus(
		question: Question
	): "correct" | "partial" | "incorrect" | "unanswered" {
		if (!confirmedAnswers.has(question.id)) return "unanswered";

		const selected = userAnswers[question.id] || [];
		const correctAnswers = question.answers.filter(a => a.isCorrect).map(a => a.id);

		const isCorrect =
			selected.length === correctAnswers.length &&
			selected.every(ansId => correctAnswers.includes(ansId));

		if (isCorrect) return "correct";

		// === Проверка на "почти правильный" ===
		// Сколько правильных пропустил
		const missedCorrect = correctAnswers.filter(id => !selected.includes(id));
		// Сколько выбрал лишних неправильных
		const extraWrong = selected.filter(id => !correctAnswers.includes(id));

		// Если ровно одна ошибка (либо 1 пропущен, либо 1 лишний) → partial
		if (
			(missedCorrect.length === 1 && extraWrong.length === 0) ||
			(missedCorrect.length === 0 && extraWrong.length === 1)
		) {
			return "partial";
		}

		return "incorrect";
	}

	// Переключение выбора ответа (если вопрос не подтвержден)
	function handleToggleAnswer(questionId: Question["id"], answerId: Answer["id"]) {
		if (confirmedAnswers.has(questionId)) return;

		setUserAnswers(prev => {
			const selected = prev[questionId] || [];
			if (selected.includes(answerId)) {
				// убрать
				return { ...prev, [questionId]: selected.filter(id => id !== answerId) };
			} else {
				// добавить
				return { ...prev, [questionId]: [...selected, answerId] };
			}
		});
	}

	// Подтверждение ответа на вопрос
	function handleConfirmAnswer(questionId: string | number) {
		if (!userAnswers[questionId] || userAnswers[questionId].length === 0) return;

		setConfirmedAnswers(prev => {
			const updated = new Set(prev).add(questionId);

			// Проверяем, все ли вопросы подтверждены
			if (updated.size === questions.length) {
				const now = Date.now();
				setElapsedTime(now - startTime);
				setIsResultDialogOpen(true);
			}

			return updated;
		});
	}

	return (
		<div className="max-w-4xl mx-auto px-4 py-8">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">
					Тест{" "}
					{mode === "module"
						? `по модулю ${moduleId}`
						: mode === "theme"
							? `по теме ${themeId}`
							: mode === "themes"
								? "по выбранным темам"
								: "по всем темам"}
				</h1>
				<Button variant="outline" onClick={() => setShowExitDialog(true)}>
					Выйти из теста
				</Button>
			</div>

			{loading ? (
				<div className="flex justify-center items-center h-40">
					<Loader2 className="w-8 h-8 animate-spin" />
				</div>
			) : error ? (
				<div className="text-red-500">{error}</div>
			) : (
				<>
					{/* Навигация по вопросам с анимацией лампочек */}
					<div className="flex flex-wrap gap-2 mb-6">
						{questions.map((q, idx) => {
							const status = getQuestionStatus(q);
							const color =
								status === "correct"
									? "bg-green-500"
									: status === "partial"
										? "bg-yellow-500"
										: status === "incorrect"
											? "bg-red-500"
											: "bg-gray-300";

							const isConfirmed = confirmedAnswers.has(q.id);

							return (
								<motion.button
									key={q.id}
									onClick={() => carouselApi?.scrollTo(idx)}
									className={`w-9 h-9 flex items-center justify-center rounded-full text-white text-sm font-bold cursor-pointer ${color}`}
									whileHover={{ scale: 1.1 }}
									whileTap={{ scale: 1.05 }}
									animate={
										isConfirmed
											? { y: [0, -8, 0, -4, 0] } // подпрыгивание
											: {}
									}
									transition={isConfirmed ? { duration: 0.6, times: [0, 0.3, 0.6, 0.8, 1] } : {}}
								>
									{idx + 1}
								</motion.button>
							);
						})}
					</div>

					{/* Carousel с вопросами */}
					<Carousel setApi={setCarouselApi} className="mb-6">
						<CarouselContent>
							{questions.map((question: Question) => {
								const status = getQuestionStatus(question);

								let borderClass = "border-gray-300";
								let bgClass = "bg-white";
								if (status === "correct") {
									borderClass = "border-green-500";
									bgClass = "bg-green-50";
								} else if (status === "partial") {
									borderClass = "border-yellow-500";
									bgClass = "bg-yellow-50";
								} else if (status === "incorrect") {
									borderClass = "border-red-500";
									bgClass = "bg-red-50";
								}

								return (
									<CarouselItem key={question.id}>
										<div
											className={`flex flex-col justify-between h-full p-4 rounded-2xl border-2 shadow-md transition-colors duration-500 ${borderClass} ${bgClass}`}
										>
											<div className="flex flex-col gap-2">
												<h2 className="text-lg font-semibold mb-4">
													Вопрос {questions.indexOf(question) + 1}: {question.text}
												</h2>
												{question.answers.map((answer: Answer) => {
													const isConfirmed = confirmedAnswers.has(question.id);
													const selectedAnswers = userAnswers[question.id] || [];
													const isSelected = selectedAnswers.includes(answer.id);

													// Подсветка после подтверждения
													let highlightClass = "";
													let checkboxClass = "";
													if (isConfirmed) {
														if (answer.isCorrect) {
															highlightClass = "text-green-600"; // правильный
															checkboxClass = "!bg-green-600";
														}
														if (isSelected && !answer.isCorrect) {
															highlightClass = "text-red-600"; // выбранный, но неправильный
															checkboxClass = "!bg-red-600";
														}
													}

													return (
														<label
															key={answer.id}
															className={`flex items-center gap-2 cursor-pointer select-none transition-colors duration-500 ${isConfirmed ? "cursor-default" : ""} ${highlightClass}`}
														>
															<Checkbox
																className={`cursor-pointer transition-colors duration-500 ${checkboxClass}`}
																disabled={isConfirmed}
																checked={isSelected}
																onCheckedChange={() => handleToggleAnswer(question.id, answer.id)}
															/>
															<span>{answer.text}</span>
														</label>
													);
												})}
											</div>
										</div>
									</CarouselItem>
								);
							})}
						</CarouselContent>
						<CarouselPrevious />
						<CarouselNext />
					</Carousel>
					{/* Кнопка Подтвердить ответ — под каруселью */}
					<div className="w-full flex justify-center mt-4">
						<Button
							className="cursor-pointer"
							disabled={
								confirmedAnswers.has(questions[currentIndex]?.id ?? "") ||
								(userAnswers[questions[currentIndex]?.id ?? ""]?.length ?? 0) === 0
							}
							onClick={() => handleConfirmAnswer(questions[currentIndex].id)}
						>
							Подтвердить ответ
						</Button>
					</div>
				</>
			)}
			{/* Диалог подтверждения выхода */}
			<Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Выйти из теста?</DialogTitle>
					</DialogHeader>
					<p>Ваш прогресс не будет сохранён.</p>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowExitDialog(false)}>
							Отмена
						</Button>
						<Button
							variant="destructive"
							onClick={() => {
								setShowExitDialog(false);
								navigate("/");
							}}
						>
							Выйти
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Диалог окончания теста */}
			<Dialog open={isResultDialogOpen} onOpenChange={setIsResultDialogOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle className="text-xl font-bold">Тест завершён 🎉</DialogTitle>
						<DialogDescription>Вы ответили на все вопросы. Вот ваши результаты:</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 mt-4">
						<div className="flex justify-between items-center">
							<span className="font-medium">Правильных:</span>
							<Badge variant="default" className="text-base px-3 py-1 bg-green-400">
								{results.correct}
							</Badge>
						</div>
						<div className="flex justify-between items-center">
							<span className="font-medium">Частично правильных:</span>
							<Badge variant="default" className="text-base px-3 py-1 bg-yellow-400">
								{results.partial}
							</Badge>
						</div>
						<div className="flex justify-between items-center">
							<span className="font-medium">Неправильных:</span>
							<Badge variant="destructive" className="text-base px-3 py-1">
								{results.incorrect}
							</Badge>
						</div>

						<Separator />

						<DialogDescription className="flex items-center gap-2">
							Время на тест:
							<Badge variant="secondary" className="text-base px-2 py-1 font-semibold">
								{String(Math.floor(elapsedTime / 60)).padStart(2, "0")}:
								{String(elapsedTime % 60).padStart(2, "0")}
							</Badge>
						</DialogDescription>
					</div>

					<DialogFooter className="flex justify-between mt-6">
						<Button variant="secondary" onClick={() => setIsResultDialogOpen(false)}>
							Скрыть
						</Button>
						<Button
							variant="outline"
							onClick={() => {
								// перезапуск
								setUserAnswers({});
								setConfirmedAnswers(new Set());
								setStartTime(Date.now());
								setIsResultDialogOpen(false);
							}}
						>
							Перезапустить
						</Button>
						<Button variant="destructive" onClick={() => navigate("/")}>
							Выйти
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

export default TestPage;
