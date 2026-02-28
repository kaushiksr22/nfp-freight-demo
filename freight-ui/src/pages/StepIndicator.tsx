interface Props {
    currentStep: 1 | 2 | 3;
  }
  
  export default function StepIndicator({ currentStep }: Props) {
    const steps = ["Select Shipments", "Choose Forwarder", "Confirmation"];
  
    return (
      <div className="mb-10">
        <div className="flex items-center justify-between">
          {steps.map((label, index) => {
            const stepNumber = (index + 1) as 1 | 2 | 3;
            const isActive = currentStep === stepNumber;
            const isCompleted = currentStep > stepNumber;
  
            return (
              <div key={label} className="flex-1 flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                  ${
                    isCompleted
                      ? "bg-green-600 text-white"
                      : isActive
                      ? "bg-slate-900 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {stepNumber}
                </div>
                <span
                  className={`ml-3 text-sm ${
                    isActive ? "text-slate-900 font-medium" : "text-slate-500"
                  }`}
                >
                  {label}
                </span>
  
                {index < steps.length - 1 && (
                  <div className="flex-1 h-px bg-slate-300 mx-4"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }