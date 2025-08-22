import { motion } from "framer-motion";

interface AnimatedProgressProps {
	progress: number;
}

export function AnimatedProgress({ progress }: AnimatedProgressProps) {
	// Цвет прогресса
	const getColor = () => {
		if (progress === 100) return "bg-black-500";
		if (progress > 60) return "bg-green-500";
		if (progress > 30) return "bg-yellow-500";
		return "bg-red-500";
	};

	return (
		<div className="relative w-full h-2 rounded-full bg-gray-200 overflow-hidden">
			{/* Основная цветная заливка */}
			<motion.div
				className={`h-full ${getColor()} rounded-full relative overflow-hidden`}
				initial={{ width: 0 }}
				animate={{ width: `${progress}%` }}
				transition={{ duration: 0.4, ease: "easeOut" }}
			>
				{/* Двигающиеся полоски теперь ВНУТРИ заливки */}
				{progress < 100 && (
					<motion.div
						className="absolute inset-0 rounded-full opacity-30 pointer-events-none"
						style={{
							backgroundImage:
								"linear-gradient(135deg, rgba(255,255,255,0.4) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.4) 75%, transparent 75%, transparent)",
							backgroundSize: "40px 40px"
						}}
						animate={{
							backgroundPosition: ["0px 0px", "40px 0px"]
						}}
						transition={{
							duration: 1,
							ease: "linear",
							repeat: Infinity
						}}
					/>
				)}
			</motion.div>
		</div>
	);
}
