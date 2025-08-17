import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { RandomService, ModuleService } from "@/db/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
	DialogHeader,
	DialogTitle,
	DialogFooter
} from "@/components/ui/dialog";
import { type CarouselApi } from "@/components/ui/carousel";
import type { Question, Answer } from "@/types";

function TestPage() {
	const location = useLocation();
	const navigate = useNavigate();

	const { mode, moduleId, themeId, themeIds, count } = (location.state || {}) as {
		mode: "module" | "theme" | "themes" | "all";
		moduleId?: number;
		themeId?: number;
		themeIds?: number[];
		count?: number;
	};

	const [carouselApi, setCarouselApi] = useState<CarouselApi>();
	const [currentIndex, setCurrentIndex] = useState(0);

	const [questions, setQuestions] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	// confirmedAnswers: Set questionId для подтверждённых вопросов
	const [confirmedAnswers, setConfirmedAnswers] = useState(new Set());
	// Текущее состояние ответов пользователя
	const [userAnswers, setUserAnswers] = useState<Record<string | number, (string | number)[]>>({});
	// состояние модалки выхода
	const [showExitDialog, setShowExitDialog] = useState(false);

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
	function handleToggleAnswer(questionId: string | number, answerId: string | number) {
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
		setConfirmedAnswers(prev => new Set(prev).add(questionId));
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
					{/* Навигация по вопросам с цветными лампочками */}
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

							return (
								<button
									key={q.id}
									className={`w-8 h-8 flex items-center justify-center rounded-full text-white text-sm font-bold cursor-pointer ${color}`}
									onClick={() => carouselApi?.scrollTo(idx)}
								>
									{idx + 1}
								</button>
							);
						})}
					</div>

					{/* Carousel с вопросами */}
					<Carousel setApi={setCarouselApi} className="mb-6">
						<CarouselContent>
							{questions.map((question: Question) => {
								return (
									<CarouselItem key={question.id}>
										<div className="flex flex-col justify-between p-1 h-full">
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
		</div>
	);
}

export default TestPage;
