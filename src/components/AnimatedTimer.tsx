import { useMotionValue, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

interface AnimatedTimerBadgeProps {
	elapsedTime: number; // миллисекунды
}

export function AnimatedTimerBadge({ elapsedTime }: AnimatedTimerBadgeProps) {
	const totalSeconds = Math.floor(elapsedTime / 1000);

	const [displaySeconds, setDisplaySeconds] = useState(0);
	const value = useMotionValue(0);

	// Преобразуем motionValue в целое число для отображения
	const motionSeconds = useTransform(value, val => Math.floor(val));

	useEffect(() => {
		value.set(0);
		const duration = 2; // длительность анимации в секундах
		const interval = 16; // примерно 60fps
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

	// Подписываемся на motionValue для обновления состояния
	useEffect(() => {
		const unsubscribe = motionSeconds.on("change", val => setDisplaySeconds(val));
		return unsubscribe;
	}, [motionSeconds]);

	const minutes = Math.floor(displaySeconds / 60);
	const seconds = displaySeconds % 60;

	return (
		<Badge variant="secondary" className="text-base px-3 py-1 text-black tabular-nums">
			{`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`}
		</Badge>
	);
}
