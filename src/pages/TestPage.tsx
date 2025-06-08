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

	const [questions, setQuestions] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	// confirmedAnswers: Set questionId для подтверждённых вопросов
	const [confirmedAnswers, setConfirmedAnswers] = useState(new Set());
	// Текущее состояние ответов пользователя
	const [userAnswers, setUserAnswers] = useState<Record<string | number, (string | number)[]>>({});

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

		// Проверка на частично правильный (выбрали часть правильных, но не все)
		const hasCorrect = selected.some(ansId => correctAnswers.includes(ansId));
		if (hasCorrect) return "partial";

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
				<Button variant="outline" onClick={() => navigate("/")}>
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
								const isConfirmed = confirmedAnswers.has(question.id);
								const selectedAnswers = userAnswers[question.id] || [];

								return (
									<CarouselItem key={question.id}>
										<div className="flex flex-col justify-between p-1 h-full">
											<div className="flex flex-col gap-2">
												<h2 className="text-lg font-semibold mb-4">
													Вопрос {questions.indexOf(question) + 1}: {question.text}
												</h2>
												{question.answers.map((answer: Answer) => (
													<label
														key={answer.id}
														className={`flex items-center gap-2 cursor-pointer select-none ${
															isConfirmed ? "opacity-70 cursor-default" : ""
														}`}
													>
														<Checkbox
															className="cursor-pointer"
															disabled={isConfirmed}
															checked={selectedAnswers.includes(answer.id)}
															onCheckedChange={() => handleToggleAnswer(question.id, answer.id)}
														/>
														<span>{answer.text}</span>
													</label>
												))}
											</div>

											<div className="w-full flex justify-center">
												<Button
													disabled={isConfirmed || selectedAnswers.length === 0}
													onClick={() => handleConfirmAnswer(question.id)}
												>
													Подтвердить ответ
												</Button>
											</div>
										</div>
									</CarouselItem>
								);
							})}
						</CarouselContent>
						<CarouselPrevious />
						<CarouselNext />
					</Carousel>
				</>
			)}
		</div>
	);
}

export default TestPage;
