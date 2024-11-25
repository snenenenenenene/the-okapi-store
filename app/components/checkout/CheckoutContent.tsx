// /components/checkout/CheckoutContext.tsx
"use client";

import { CheckoutState, ShippingAddress } from "@/types/checkout";
import { createContext, useContext, useState, ReactNode } from "react";

interface CheckoutContextType {
	state: CheckoutState;
	setShippingAddress: (address: ShippingAddress) => void;
	setStep: (step: CheckoutState["step"]) => void;
	setError: (error: string | undefined) => void;
	setProcessing: (isProcessing: boolean) => void;
	setStripeSessionId: (sessionId: string) => void;
	setOrderId: (orderId: string) => void;
	resetCheckout: () => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

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
		country: "BE", // Default to Belgium
		zip: "",
	},
	isProcessing: false,
};

export function CheckoutProvider({
	children,
	initialCart,
}: {
	children: ReactNode;
	initialCart: any[];
}) {
	const [state, setState] = useState<CheckoutState>({
		...initialState,
		cart: initialCart,
	});

	const setShippingAddress = (address: ShippingAddress) => {
		setState(prev => ({ ...prev, shippingAddress: address }));
	};

	const setStep = (step: CheckoutState["step"]) => {
		setState(prev => ({ ...prev, step }));
	};

	const setError = (error: string | undefined) => {
		setState(prev => ({ ...prev, error }));
	};

	const setProcessing = (isProcessing: boolean) => {
		setState(prev => ({ ...prev, isProcessing }));
	};

	const setStripeSessionId = (sessionId: string) => {
		setState(prev => ({ ...prev, stripeSessionId: sessionId }));
	};

	const setOrderId = (orderId: string) => {
		setState(prev => ({ ...prev, orderId }));
	};

	const resetCheckout = () => {
		setState(initialState);
	};

	return (
		<CheckoutContext.Provider
			value={{
				state,
				setShippingAddress,
				setStep,
				setError,
				setProcessing,
				setStripeSessionId,
				setOrderId,
				resetCheckout,
			}}
		>
			{children}
		</CheckoutContext.Provider>
	);
}

export function useCheckout() {
	const context = useContext(CheckoutContext);
	if (context === undefined) {
		throw new Error("useCheckout must be used within a CheckoutProvider");
	}
	return context;
}