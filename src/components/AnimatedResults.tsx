import { motion, useMotionValue, animate } from "framer-motion";
import { useEffect, useState } from "react";

interface AnimatedBadgeProps {
	value: number;
	className?: string;
	style?: React.CSSProperties;
}

export function AnimatedBadge({ value, className, style }: AnimatedBadgeProps) {
	const motionVal = useMotionValue(0); // значение от 0
	const [display, setDisplay] = useState(0);

	// При value меняем motionVal
	useEffect(() => {
		const controls = animate(motionVal, value, {
			duration: 0.8,
			ease: "easeOut",
			onUpdate: v => setDisplay(Math.floor(v))
		});
		return () => controls.stop();
	}, [value]);

	return (
		<motion.div
			className={`text-base py-1 flex items-center justify-center rounded ${className}`}
			style={style}
		>
			{display}
		</motion.div>
	);
}
