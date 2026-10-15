import { easeInOut } from 'framer-motion'

export const stepVariants = {
	enter: (dir: number) => ({ x: dir > 0 ? 32 : -32, opacity: 0 }),
	center: { x: 0, opacity: 1 },
	exit: (dir: number) => ({ x: dir > 0 ? -32 : 32, opacity: 0 }),
}

export const stepTransition = { duration: 0.2, ease: easeInOut }
