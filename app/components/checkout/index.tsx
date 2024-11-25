// /components/checkout/index.tsx
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, ChevronLeft, Loader2, MapPin } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { SUPPORTED_COUNTRIES, ShippingAddress, CheckoutItem, CheckoutState } from "@/types/checkout";
import { CheckoutService } from "@/lib/checkout";
import { useCartStore } from "@/store/cartStore";
import { formatEuroPrice } from "@/utils/formatters";
import { useRouter } from "next/navigation";

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Context Setup
const CheckoutContext = createContext<any>(undefined);

const initialState: CheckoutState = {
	step: "shipping",
	shippingAddress: {
		name: "",
		email: "",
		phone: "",
		address1: "",
		address2: "",
		city: "",
		state: "",
		country: "BE",
		zip: "",
	},
	isProcessing: false,
};

export function CheckoutProvider({ children, initialCart }: { children: ReactNode; initialCart: CheckoutItem[] }) {
	const [state, setState] = useState<CheckoutState>({
		...initialState,
		cart: initialCart,
	});

	const setShippingAddress = (address: ShippingAddress) =>
		setState(prev => ({ ...prev, shippingAddress: address }));

	const setStep = (step: CheckoutState["step"]) =>
		setState(prev => ({ ...prev, step }));

	const setError = (error: string | undefined) =>
		setState(prev => ({ ...prev, error }));

	const setProcessing = (isProcessing: boolean) =>
		setState(prev => ({ ...prev, isProcessing }));

	const setStripeSessionId = (sessionId: string) =>
		setState(prev => ({ ...prev, stripeSessionId: sessionId }));

	const setOrderId = (orderId: string) =>
		setState(prev => ({ ...prev, orderId }));

	const resetCheckout = () => setState(initialState);

	return (
		<CheckoutContext.Provider value={{
			state,
			setShippingAddress,
			setStep,
			setError,
			setProcessing,
			setStripeSessionId,
			setOrderId,
			resetCheckout,
		}}>
			{children}
		</CheckoutContext.Provider>
	);
}

export function useCheckout() {
	const context = useContext(CheckoutContext);
	if (!context) {
		throw new Error("useCheckout must be used within a CheckoutProvider");
	}
	return context;
}

// Steps Component
export function CheckoutSteps() {
	const { state } = useCheckout();
	const STEPS = [
		{ id: "shipping", label: "Shipping" },
		{ id: "review", label: "Review" },
		{ id: "payment", label: "Payment" },
	] as const;

	const currentStepIndex = STEPS.findIndex(step => step.id === state.step);

	return (
		<div className="relative mb-8">
			<div className="flex justify-between">
				{STEPS.map((step, index) => {
					const isComplete = index < currentStepIndex;
					const isCurrent = index === currentStepIndex;

					return (
						<div key={step.id} className="flex flex-1 items-center">
							<div className="flex flex-col items-center flex-1">
								<div className={`
                  w-8 h-8 rounded-full flex items-center justify-center border-2
                  ${isComplete ? 'bg-primary border-primary text-white' :
										isCurrent ? 'border-primary text-primary' :
											'border-base-300 text-base-300'}
                `}>
									{isComplete ? <Check className="w-5 h-5" /> : <span>{index + 1}</span>}
								</div>
								<span className={`
                  mt-2 text-sm font-medium
                  ${isCurrent ? 'text-primary' :
										isComplete ? 'text-neutral' : 'text-base-300'}
                `}>
									{step.label}
								</span>
							</div>
							{index < STEPS.length - 1 && (
								<div className={`
                  h-[2px] flex-1 mx-4 mt-4
                  ${index < currentStepIndex ? 'bg-primary' : 'bg-base-300'}
                `} />
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

// Shipping Form Component
export function ShippingForm() {
	const { state, setShippingAddress, setStep, setError } = useCheckout();
	const [validating, setValidating] = useState(false);
	const [address, setAddress] = useState<ShippingAddress>(state.shippingAddress);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setAddress(prev => ({ ...prev, [name]: value }));
		setError(undefined);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setValidating(true);
		setError(undefined);

		try {
			await CheckoutService.validateShippingAddress(address);
			const rates = await CheckoutService.calculateShippingRates(address);

			if (!rates || rates.length === 0) {
				throw new Error("No shipping methods available for this address");
			}

			setShippingAddress(address);
			setStep("review");
		} catch (error) {
			setError(error instanceof Error ? error.message : "Failed to validate address");
		} finally {
			setValidating(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label htmlFor="name" className="label">Full Name</label>
					<input
						type="text"
						id="name"
						name="name"
						value={address.name}
						onChange={handleInputChange}
						className="input input-bordered w-full"
						placeholder="John Doe"
						required
					/>
				</div>

				<div>
					<label htmlFor="email" className="label">Email</label>
					<input
						type="email"
						id="email"
						name="email"
						value={address.email}
						onChange={handleInputChange}
						className="input input-bordered w-full"
						placeholder="john@example.com"
						required
					/>
				</div>

				<div>
					<label htmlFor="phone" className="label">Phone</label>
					<input
						type="tel"
						id="phone"
						name="phone"
						value={address.phone}
						onChange={handleInputChange}
						className="input input-bordered w-full"
						placeholder="+32 470 123 456"
						required
					/>
				</div>

				<div>
					<label htmlFor="country" className="label">Country</label>
					<select
						id="country"
						name="country"
						value={address.country}
						onChange={handleInputChange}
						className="select select-bordered w-full"
						required
					>
						{SUPPORTED_COUNTRIES.map(country => (
							<option key={country.code} value={country.code}>
								{country.name}
							</option>
						))}
					</select>
				</div>

				<div className="md:col-span-2">
					<label htmlFor="address1" className="label">Address</label>
					<input
						type="text"
						id="address1"
						name="address1"
						value={address.address1}
						onChange={handleInputChange}
						className="input input-bordered w-full"
						placeholder="Street address"
						required
					/>
				</div>

				<div className="md:col-span-2">
					<label htmlFor="address2" className="label">
						Address Line 2 (Optional)
					</label>
					<input
						type="text"
						id="address2"
						name="address2"
						value={address.address2}
						onChange={handleInputChange}
						className="input input-bordered w-full"
						placeholder="Apartment, suite, etc."
					/>
				</div>

				<div>
					<label htmlFor="city" className="label">City</label>
					<input
						type="text"
						id="city"
						name="city"
						value={address.city}
						onChange={handleInputChange}
						className="input input-bordered w-full"
						required
					/>
				</div>

				<div>
					<label htmlFor="state" className="label">State/Province</label>
					<input
						type="text"
						id="state"
						name="state"
						value={address.state}
						onChange={handleInputChange}
						className="input input-bordered w-full"
						required
					/>
				</div>

				<div>
					<label htmlFor="zip" className="label">Postal Code</label>
					<input
						type="text"
						id="zip"
						name="zip"
						value={address.zip}
						onChange={handleInputChange}
						className="input input-bordered w-full"
						required
					/>
				</div>
			</div>

			<div className="flex justify-end mt-8">
				<button
					type="submit"
					className="btn btn-primary"
					disabled={validating}
				>
					{validating ? (
						<>
							<Loader2 className="w-4 h-4 animate-spin mr-2" />
							Validating...
						</>
					) : (
						<>
							Continue to Review
							<ChevronRight className="w-4 h-4 ml-2" />
						</>
					)}
				</button>
			</div>
		</form>
	);
}

// Order Review Component
export function OrderReview() {
	const { state, setStep, setError } = useCheckout();
	const { cart, getTotalPrice } = useCartStore();

	const handleBack = () => setStep("shipping");
	const handleContinue = () => setStep("payment");

	return (
		<div className="space-y-8">
			<div className="bg-base-200 p-6 rounded-lg">
				<div className="flex items-center gap-2 mb-4">
					<MapPin className="w-5 h-5 text-primary" />
					<h3 className="font-bold">Shipping Address</h3>
				</div>

				<div className="text-sm space-y-1">
					<p>{state.shippingAddress.name}</p>
					<p>{state.shippingAddress.address1}</p>
					{state.shippingAddress.address2 && (
						<p>{state.shippingAddress.address2}</p>
					)}
					<p>
						{state.shippingAddress.city}, {state.shippingAddress.state}{" "}
						{state.shippingAddress.zip}
					</p>
					<p>{state.shippingAddress.country}</p>
					<p>{state.shippingAddress.phone}</p>
					<p>{state.shippingAddress.email}</p>
				</div>
			</div>

			<div className="border-t border-base-300 pt-6">
				<h3 className="font-bold mb-4">Order Summary</h3>
				<div className="space-y-4">
					{cart.map(item => (
						<div key={item.id} className="flex justify-between items-center">
							<div className="flex items-center gap-4">
								<img
									src={item.image}
									alt={item.name}
									className="w-16 h-16 object-cover rounded"
								/>
								<div>
									<p className="font-medium">{item.name}</p>
									<p className="text-sm text-base-content/70">
										Quantity: {item.quantity}
									</p>
								</div>
							</div>
							<p className="font-medium">
								{formatEuroPrice(item.price * item.quantity)}
							</p>
						</div>
					))}
				</div>

				<div className="border-t border-base-300 mt-4 pt-4">
					<div className="flex justify-between items-center font-bold">
						<span>Total</span>
						<span>{formatEuroPrice(getTotalPrice())}</span>
					</div>
				</div>
			</div>

			<div className="flex justify-between mt-8">
				<button
					type="button"
					onClick={handleBack}
					className="btn btn-outline"
				>
					<ChevronLeft className="w-4 h-4 mr-2" />
					Back
				</button>

				<button
					type="button"
					onClick={handleContinue}
					className="btn btn-primary"
				>
					Continue to Payment
					<ChevronRight className="w-4 h-4 ml-2" />
				</button>
			</div>
		</div>
	);
}

// Payment Step Component
export function PaymentStep() {
	const { state, setError, setProcessing, setStripeSessionId } = useCheckout();
	const { cart } = useCartStore();

	const handleBack = () => setStep("review");

	const handlePayment = async () => {
		setProcessing(true);
		setError(undefined);

		try {
			const response = await fetch('/api/stripe/create-checkout-session', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					items: cart,
					shippingAddress: state.shippingAddress,
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Failed to create checkout session');
			}

			const { sessionId } = await response.json();
			setStripeSessionId(sessionId);

			const stripe = await stripePromise;
			if (!stripe) {
				throw new Error('Failed to load payment system');
			}

			const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
			if (stripeError) {
				throw stripeError;
			}
		} catch (error) {
			setError(error instanceof Error ? error.message : 'Payment processing failed');
		} finally {
			setProcessing(false);
		}
	};

	return (
		<div className="space-y-8">
			<div className="bg-base-200 p-6 rounded-lg">
				<h3 className="font-bold mb-4">Payment Details</h3>
				<p className="text-base-content/70">
					You will be redirected to our secure payment provider to complete your purchase.
				</p>

				<div className="mt-4">
					<div className="flex justify-between items-center font-bold">
						<span>Total to Pay:</span>
						<span className="text-2xl text-primary">
							{formatEuroPrice(cart.reduce((sum, item) => sum + item.price * item.quantity, 0))}
						</span>
					</div><div className="mt-4 text-sm text-base-content/70">
						<p>By proceeding with the payment, you agree to our:</p>
						<ul className="list-disc list-inside mt-2">
							<li>Terms of Service</li>
							<li>Privacy Policy</li>
							<li>Return Policy</li>
						</ul>
					</div>
				</div>
			</div>

			<div className="flex justify-between mt-8">
				<button
					type="button"
					onClick={handleBack}
					className="btn btn-outline"
				>
					<ChevronLeft className="w-4 h-4 mr-2" />
					Back to Review
				</button>

				<button
					type="button"
					onClick={handlePayment}
					className="btn btn-primary"
					disabled={state.isProcessing}
				>
					{state.isProcessing ? (
						<>
							<Loader2 className="w-4 h-4 animate-spin mr-2" />
							Processing...
						</>
					) : (
						<>
							Proceed to Payment
							<ChevronRight className="w-4 h-4 ml-2" />
						</>
					)}
				</button>
			</div>
		</div>
	);
}

// Main Checkout Flow Component
export function CheckoutFlow() {
	const { state } = useCheckout();

	return (
		<div className="space-y-8">
			<CheckoutSteps />

			{state.error && (
				<div className="bg-error/10 text-error px-4 py-3 rounded-lg">
					{state.error}
				</div>
			)}

			{state.isProcessing && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-base-100 p-8 rounded-lg flex items-center gap-4">
						<Loader2 className="w-6 h-6 animate-spin text-primary" />
						<p className="text-lg">Processing your order...</p>
					</div>
				</div>
			)}

			<AnimatePresence mode="wait">
				{state.step === "shipping" && (
					<motion.div
						key="shipping"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
					>
						<ShippingForm />
					</motion.div>
				)}

				{state.step === "review" && (
					<motion.div
						key="review"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
					>
						<OrderReview />
					</motion.div>
				)}

				{state.step === "payment" && (
					<motion.div
						key="payment"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
					>
						<PaymentStep />
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

// Main Checkout Component Export
export function Checkout() {
	const { cart, getTotalItems } = useCartStore();
	const router = useRouter();

	// Redirect if cart is empty
	useEffect(() => {
		if (getTotalItems() === 0) {
			router.push("/");
		}
	}, [getTotalItems, router]);

	if (getTotalItems() === 0) {
		return null;
	}

	return (
		<CheckoutProvider initialCart={cart}>
			<div className="min-h-screen bg-base-100 py-12">
				<div className="container mx-auto px-4 max-w-4xl">
					<CheckoutFlow />
				</div>
			</div>
		</CheckoutProvider>
	);
}