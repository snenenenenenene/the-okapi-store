import { Loader2 } from 'lucide-react'

export function LoadingSpinner() {
	return (
		<div
			role="status"
			className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
		>
			<Loader2 className="h-8 w-8 animate-spin text-primary" />
			<span className="sr-only">Loading...</span>
		</div>
	)
}