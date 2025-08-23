import { motion, useMotionValue, animate, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Timer } from "lucide-react";

interface ResultsStatsProps {
	results: {
		correct: number;
		partial: number;
		incorrect: number;
	};
	elapsedTime: number;
	badgeWidthStyle: React.CSSProperties;
}

/* -------------------- Анимированный бейдж -------------------- */
const AnimatedBadge = ({
	value,
	className,
	style,
	delay = 0
}: {
	value: number;
	className?: string;
	style?: React.CSSProperties;
	delay?: number;
}) => {
	const motionVal = useMotionValue(0);
	const [display, setDisplay] = useState(0);

	useEffect(() => {
		const controls = animate(motionVal, value, {
			duration: 0.6,
			delay,
			ease: "easeOut",
			onUpdate: v => setDisplay(Math.floor(v))
		});
		return () => controls.stop();
	}, [value, delay]);

	return (
		<motion.div
			className={`text-base py-1 flex items-center justify-center rounded ${className}`}
			style={style}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ delay }}
		>
			{display}
		</motion.div>
	);
};

/* -------------------- Анимированный таймер -------------------- */
const AnimatedTimerBadge = ({ elapsedTime }: { elapsedTime: number }) => {
	const totalSeconds = Math.floor(elapsedTime / 1000);

	const [displaySeconds, setDisplaySeconds] = useState(0);
	const value = useMotionValue(0);
	const motionSeconds = useTransform(value, val => Math.floor(val));

	useEffect(() => {
		value.set(0);
		const duration = 1.5; // сек
		const interval = 16;
		const steps = (duration * 1000) / interval;
		let currentStep = 0;

		const timer = setInterval(() => {
			currentStep++;
			const nextValue = (totalSeconds * currentStep) / steps;
			value.set(nextValue);
			if (currentStep >= steps) clearInterval(timer);
		}, interval);

		return () => clearInterval(timer);
	}, [totalSeconds, value]);

	useEffect(() => {
		const unsubscribe = motionSeconds.on("change", val => setDisplaySeconds(val));
		return unsubscribe;
	}, [motionSeconds]);

	const minutes = Math.floor(displaySeconds / 60);
	const seconds = displaySeconds % 60;

	return (
		<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
			<Badge variant="secondary" className="text-base px-3 py-1 text-black tabular-nums">
				{`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`}
			</Badge>
		</motion.div>
	);
};

/* -------------------- Основной компонент -------------------- */
export function ResultStats({ results, elapsedTime, badgeWidthStyle }: ResultsStatsProps) {
	const labels = [
		{
			label: "Правильных:",
			value: results.correct,
			className: "bg-green-400 text-white"
		},
		{
			label: "Частично правильных:",
			value: results.partial,
			className: "bg-yellow-400 text-white"
		},
		{
			label: "Неправильных:",
			value: results.incorrect,
			className: "bg-red-500 text-white"
		}
	];

	return (
		<div className="space-y-4 mt-4">
			{labels.map((item, index) => {
				const baseDelay = index * 1; // задержка для каждой строки
				return (
					<div key={item.label} className="flex justify-between items-center">
						{/* Плавное пошаговое появление текста */}
						<motion.span
							className="font-medium"
							initial={{ opacity: 0, y: -5 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{
								duration: 0.4,
								delay: baseDelay,
								ease: "easeOut"
							}}
						>
							{item.label}
						</motion.span>

						{/* Бейдж появляется и считает ЧЕРЕЗ 0.3с после текста */}
						<AnimatedBadge
							value={item.value}
							className={item.className}
							style={badgeWidthStyle}
							delay={baseDelay + 0.3}
						/>
					</div>
				);
			})}

			<Separator />

			<div className="flex items-center gap-2">
				<Timer className="w-5 h-5 text-gray-600" />:
				<AnimatedTimerBadge elapsedTime={elapsedTime} />
			</div>
		</div>
	);
}
