import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Mail, XCircle } from 'lucide-react';
import { useState } from 'react';

export default function NewsletterSubscribe() {
	const [email, setEmail] = useState('');
	const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
	const [message, setMessage] = useState('');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!email) return;

		setStatus('loading');

		try {
			const response = await fetch('/api/newsletter/subscribe', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email }),
			});

			const data = await response.json();

			if (!response.ok) throw new Error(data.message);

			setStatus('success');
			setMessage('Thanks for subscribing! Check your email to confirm.');
			setEmail('');
		} catch (error) {
			setStatus('error');
			setMessage(error instanceof Error ? error.message : 'Failed to subscribe. Please try again.');
		}
	};

	return (
		<div className="bg-primary/5 rounded-lg p-8">
			<div className="max-w-xl mx-auto">
				<div className="flex items-center gap-3 mb-4">
					<Mail className="w-6 h-6 text-primary" />
					<h3 className="text-xl font-serif text-neutral">Join the Okapi Club</h3>
				</div>

				<p className="text-neutral/70 mb-6">
					Subscribe to receive updates about new products, exclusive offers, and everything Okapi!
				</p>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="relative">
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="Enter your email"
							className="input input-bordered w-full pr-12"
							disabled={status === 'loading' || status === 'success'}
							aria-label="Email address"
						/>
						{status === 'loading' && (
							<Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-primary" />
						)}
					</div>

					{status === 'idle' && (
						<motion.button
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							className="btn btn-primary w-full"
							type="submit"
						>
							Subscribe
						</motion.button>
					)}

					{status === 'success' && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							className="flex items-center gap-2 text-success p-3 bg-success/10 rounded-lg"
						>
							<CheckCircle2 className="w-5 h-5" />
							<span>{message}</span>
						</motion.div>
					)}

					{status === 'error' && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							className="flex items-center gap-2 text-error p-3 bg-error/10 rounded-lg"
						>
							<XCircle className="w-5 h-5" />
							<span>{message}</span>
						</motion.div>
					)}
				</form>

				<p className="text-xs text-neutral/50 mt-4">
					By subscribing, you agree to receive marketing emails. You can unsubscribe at any time.
				</p>
			</div>
		</div>
	);
}