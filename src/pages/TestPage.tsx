import { useEffect, useState, useMemo, useRef } from "react";
import { Loader2, Timer, CheckCircle, ArrowBigUpDash } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { RandomService, ModuleService } from "@/db/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
import { AnimatedProgress } from "@/components/ProgressBar";
import { AnimatedTimerBadge } from "@/components/AnimatedTimer";
import { AnimatedBadge } from "@/components/AnimatedResults";
import type { Question, Answer } from "@/types";

function TestPage() {
	const location = useLocation();
	const navigate = useNavigate();

	// Тип для ответов пользователя
	type UserAnswers = Record<Question["id"], Answer["id"][]>;

	// Тип ID тоста берём прямо из сигнатуры toast()
	type ToastId = ReturnType<typeof toast>;

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

	const toastIdRef = useRef<ToastId | null>(null);

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

	const confirmedCount = confirmedAnswers.size;
	const totalCount = questions.length;
	const progress = totalCount > 0 ? (confirmedCount / totalCount) * 100 : 0;

	// Вычисляем максимальное количество цифр
	const maxDigits = Math.max(
		String(results.correct).length,
		String(results.partial).length,
		String(results.incorrect).length
	);

	// maxDigits — это количество цифр самого большого числа
	const getBadgeWidth = (maxDigits: number) => {
		switch (maxDigits) {
			case 1:
				return "2.3rem";
			case 2:
				return "3rem";
			case 3:
				return "5rem";
			default:
				return `${2.5 + 1.5 * (maxDigits - 1)}rem`; // на всякий случай для больших чисел
		}
	};

	// Создаём style для одинаковой ширины
	const badgeWidthStyle = { minWidth: getBadgeWidth(maxDigits) };

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

	const handleHideResults = () => {
		setIsResultDialogOpen(false);

		toastIdRef.current = toast.custom(
			t => (
				<motion.div
					className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl"
					initial={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
					animate={{
						boxShadow: [
							"0 4px 12px rgba(0,0,0,0.1)",
							"0 4px 20px rgba(0,0,0,0.3)",
							"0 4px 12px rgba(0,0,0,0.1)"
						]
					}}
					transition={{ duration: 2, repeat: Infinity }}
				>
					<div className="flex flex-col gap-2 p-4 bg-white dark:bg-neutral-900 shadow-xl rounded-xl border border-gray-200 dark:border-neutral-700">
						<h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center  gap-2">
							<CheckCircle className="w-6 h-6 text-green-500" />
							Тест пройден!
						</h2>
						<p className="text-sm text-gray-600 dark:text-gray-300">
							Вы можете посмотреть результаты
						</p>
						<button
							onClick={() => {
								setIsResultDialogOpen(true);
								toast.dismiss(t);
								toastIdRef.current = null;
							}}
							className="flex items-center justify-center gap-2 px-3 py-1.5 mt-1 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-all"
						>
							<ArrowBigUpDash className="w-4 h-4" />
							Результаты
						</button>
					</div>
				</motion.div>
			),
			{
				duration: Infinity,
				position: "bottom-center"
			}
		);
	};

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

							const borderColor =
								status === "correct"
									? "border-green-400"
									: status === "partial"
										? "border-yellow-400"
										: status === "incorrect"
											? "border-red-400"
											: "border-gray-400";

							const shadowColor =
								status === "correct"
									? "rgba(34,197,94,0.3)" // green-500
									: status === "partial"
										? "rgba(245,158,11,0.3)" // yellow-500
										: status === "incorrect"
											? "rgba(239,68,68,0.3)" // red-500
											: "white";

							const isConfirmed = confirmedAnswers.has(q.id);
							const isCurrent = idx === currentIndex;

							return (
								<div key={q.id} className="relative">
									{/* Обводка для текущего вопроса */}
									{isCurrent &&
										(!isConfirmed ? (
											<motion.div
												className={`absolute -inset-1 rounded-full border-2 ${borderColor} border-t-transparent border-b-transparent`}
												animate={{ rotate: 360 }}
												transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
											/>
										) : (
											<div
												className={`absolute -inset-1 rounded-full border-2 ${borderColor} opacity-70`}
											/>
										))}

									<motion.button
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
										style={{
											boxShadow: `0 0 8px 3px ${shadowColor}` // свечение
										}}
									>
										{idx + 1}
									</motion.button>
								</div>
							);
						})}
					</div>

					{/* Progress количества подвтержденных вопросов */}
					<div className="flex flex-col gap-2 my-4">
						<div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
							<span>
								Подтверждено: {confirmedCount} / {totalCount}
							</span>
							<span>{Math.round(progress)}%</span>
						</div>

						<AnimatedProgress progress={progress} />
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
													<span className="underline mr-1">
														Вопрос {questions.indexOf(question) + 1}
													</span>
													:{" " + question.text}
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
						<DialogTitle className="text-xl font-bold">Тест завершён</DialogTitle>
						<DialogDescription>Вы ответили на все вопросы. Вот ваши результаты:</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 mt-4">
						<div className="flex justify-between items-center">
							<span className="font-medium">Правильных:</span>
							<AnimatedBadge
								value={results.correct}
								className={"bg-green-400 text-white"}
								style={badgeWidthStyle}
							/>
						</div>
						<div className="flex justify-between items-center">
							<span className="font-medium">Частично правильных:</span>
							<AnimatedBadge
								value={results.partial}
								className={"bg-yellow-400 text-white"}
								style={badgeWidthStyle}
							/>
						</div>
						<div className="flex justify-between items-center">
							<span className="font-medium">Неправильных:</span>
							<AnimatedBadge
								value={results.incorrect}
								className={"bg-red-500 text-white"}
								style={badgeWidthStyle}
							/>
						</div>

						<Separator />

						<DialogDescription className="flex items-center gap-2">
							<Timer className="w-5 h-5 text-gray-600" />:
							<AnimatedTimerBadge elapsedTime={elapsedTime} />
						</DialogDescription>
					</div>

					<DialogFooter className="flex justify-between mt-6">
						<Button variant="secondary" onClick={handleHideResults}>
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
								setCurrentIndex(0);
								// Вернуть карусель на первый вопрос
								carouselApi?.scrollTo(0);
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
