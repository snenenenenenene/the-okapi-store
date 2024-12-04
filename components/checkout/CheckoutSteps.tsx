import { cn } from "@/lib/utils";

export type CheckoutStep = "shipping" | "review" | "payment";

interface CheckoutStepsProps {
  currentStep: CheckoutStep;
}

const steps: { id: CheckoutStep; label: string }[] = [
  { id: "shipping", label: "Shipping" },
  { id: "review", label: "Review" },
  { id: "payment", label: "Payment" },
];

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = steps.findIndex(s => s.id === currentStep) > index;

          return (
            <li key={step.id} className="md:flex-1">
              <div className="group flex flex-col border-l-4 border-sand-200 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                <span className="text-sm font-medium text-vintage-grey">
                  Step {index + 1}
                </span>
                <span
                  className={cn(
                    "text-sm font-medium",
                    isActive && "text-vintage-black",
                    isCompleted && "text-sand-600",
                    !isActive && !isCompleted && "text-sand-400"
                  )}
                >
                  {step.label}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
