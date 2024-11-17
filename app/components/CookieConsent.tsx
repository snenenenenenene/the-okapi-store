"use client"
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart, Mail, ShieldCheck, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CookiePreferences {
	necessary: boolean;
	analytics: boolean;
	marketing: boolean;
}

const getCookieConsent = (): CookiePreferences | null => {
	if (typeof window === 'undefined') return null;
	const consent = localStorage.getItem('cookie-consent');
	return consent ? JSON.parse(consent) : null;
};

const setCookieConsent = (consent: CookiePreferences) => {
	localStorage.setItem('cookie-consent', JSON.stringify(consent));
	// Here you would also trigger your analytics/marketing tools based on preferences
};

export default function CookieConsent() {
	const [showBanner, setShowBanner] = useState(false);
	const [preferences, setPreferences] = useState<CookiePreferences>({
		necessary: true,
		analytics: false,
		marketing: false
	});
	const [showPreferences, setShowPreferences] = useState(false);

	useEffect(() => {
		const existingConsent = getCookieConsent();
		if (!existingConsent) {
			setShowBanner(true);
		} else {
			setPreferences(existingConsent);
		}
	}, []);

	const handleAcceptAll = () => {
		const newPreferences = {
			necessary: true,
			analytics: true,
			marketing: true
		};
		setPreferences(newPreferences);
		setCookieConsent(newPreferences);
		setShowBanner(false);
	};

	const handleSavePreferences = () => {
		setCookieConsent(preferences);
		setShowBanner(false);
		setShowPreferences(false);
	};

	const handleRejectAll = () => {
		const newPreferences = {
			necessary: true,
			analytics: false,
			marketing: false
		};
		setPreferences(newPreferences);
		setCookieConsent(newPreferences);
		setShowBanner(false);
	};

	if (!showBanner) return null;

	return (
		<AnimatePresence>
			<motion.div
				initial={{ y: 100, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				exit={{ y: 100, opacity: 0 }}
				className="fixed bottom-0 left-0 right-0 z-50 bg-base-100 shadow-lg border-t border-primary/10"
				role="dialog"
				aria-labelledby="cookie-consent-title"
				aria-describedby="cookie-consent-description"
			>
				<div className="container mx-auto p-6">
					{!showPreferences ? (
						<div className="flex flex-col md:flex-row items-center justify-between gap-6">
							<div className="flex-1">
								<h2
									id="cookie-consent-title"
									className="text-lg font-serif text-neutral mb-2"
								>
									Cookie Settings
								</h2>
								<p
									id="cookie-consent-description"
									className="text-sm text-neutral/70"
								>
									We use cookies to enhance your shopping experience. Choose your preferences below.
								</p>
							</div>
							<div className="flex flex-col sm:flex-row gap-2">
								<button
									onClick={() => setShowPreferences(true)}
									className="btn btn-ghost"
									aria-label="Customize cookie preferences"
								>
									Customize
								</button>
								<button
									onClick={handleRejectAll}
									className="btn btn-outline hover:bg-error/10 hover:border-error"
									aria-label="Reject all non-essential cookies"
								>
									Reject All
								</button>
								<button
									onClick={handleAcceptAll}
									className="btn btn-primary"
									aria-label="Accept all cookies"
								>
									Accept All
								</button>
							</div>
						</div>
					) : (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="space-y-6"
						>
							<div className="flex justify-between items-center">
								<h2 className="text-2xl font-serif text-neutral">Cookie Preferences</h2>
								<button
									onClick={() => setShowPreferences(false)}
									className="btn btn-ghost btn-circle"
									aria-label="Close preferences panel"
								>
									<X size={24} />
								</button>
							</div>

							<div className="space-y-4">
								<div className="group hover:bg-primary/5 p-4 rounded-lg transition-all duration-300">
									<div className="flex items-center gap-4">
										<ShieldCheck className="w-6 h-6 text-primary" />
										<div className="flex-1">
											<div className="flex items-center justify-between">
												<h3 className="font-serif text-neutral">Essential Cookies</h3>
												<input
													type="checkbox"
													checked={preferences.necessary}
													disabled
													className="checkbox checkbox-primary"
													aria-label="Essential cookies (required)"
												/>
											</div>
											<p className="text-sm text-neutral/70 mt-1">
												Required for the website to function properly. Cannot be disabled.
											</p>
										</div>
									</div>
								</div>

								<div className="group hover:bg-primary/5 p-4 rounded-lg transition-all duration-300">
									<div className="flex items-center gap-4">
										<BarChart className="w-6 h-6 text-primary" />
										<div className="flex-1">
											<div className="flex items-center justify-between">
												<h3 className="font-serif text-neutral">Analytics Cookies</h3>
												<input
													type="checkbox"
													checked={preferences.analytics}
													onChange={(e) => setPreferences(prev => ({
														...prev,
														analytics: e.target.checked
													}))}
													className="checkbox checkbox-primary"
													aria-label="Analytics cookies"
												/>
											</div>
											<p className="text-sm text-neutral/70 mt-1">
												Help us improve by measuring how you interact with our store.
											</p>
										</div>
									</div>
								</div>

								<div className="group hover:bg-primary/5 p-4 rounded-lg transition-all duration-300">
									<div className="flex items-center gap-4">
										<Mail className="w-6 h-6 text-primary" />
										<div className="flex-1">
											<div className="flex items-center justify-between">
												<h3 className="font-serif text-neutral">Marketing Cookies</h3>
												<input
													type="checkbox"
													checked={preferences.marketing}
													onChange={(e) => setPreferences(prev => ({
														...prev,
														marketing: e.target.checked
													}))}
													className="checkbox checkbox-primary"
													aria-label="Marketing cookies"
												/>
											</div>
											<p className="text-sm text-neutral/70 mt-1">
												Allow us to personalize your experience and send you relevant content.
											</p>
										</div>
									</div>
								</div>
							</div>

							<div className="flex justify-end gap-2 pt-4 border-t border-base-200">
								<button
									onClick={handleRejectAll}
									className="btn btn-outline hover:bg-error/10 hover:border-error"
									aria-label="Reject all non-essential cookies"
								>
									Reject All
								</button>
								<button
									onClick={handleSavePreferences}
									className="btn btn-primary"
									aria-label="Save cookie preferences"
								>
									Save Preferences
								</button>
							</div>
						</motion.div>
					)}
				</div>
			</motion.div>
		</AnimatePresence>
	);
}