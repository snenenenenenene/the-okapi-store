'use client';

import { createContext, useContext, useReducer, type ReactNode } from "react";
import type { CheckoutStep } from "./CheckoutSteps";

interface ShippingData {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
}

interface CheckoutState {
  step: CheckoutStep;
  shippingData: ShippingData | null;
  isProcessing: boolean;
  error: string | null;
}

type CheckoutAction =
  | { type: "SET_STEP"; payload: CheckoutStep }
  | { type: "SET_SHIPPING_DATA"; payload: ShippingData }
  | { type: "SET_PROCESSING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

const initialState: CheckoutState = {
  step: "shipping",
  shippingData: null,
  isProcessing: false,
  error: null,
};

function checkoutReducer(state: CheckoutState, action: CheckoutAction): CheckoutState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.payload };
    case "SET_SHIPPING_DATA":
      return { ...state, shippingData: action.payload };
    case "SET_PROCESSING":
      return { ...state, isProcessing: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

interface CheckoutContextType {
  state: CheckoutState;
  dispatch: React.Dispatch<CheckoutAction>;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export const CheckoutProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(checkoutReducer, initialState);

  return (
    <CheckoutContext.Provider value={{ state, dispatch }}>
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return context;
};

CheckoutProvider.displayName = "CheckoutProvider";
