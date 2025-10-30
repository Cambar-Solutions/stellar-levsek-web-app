export function StepProgress({ steps, currentStep }) {
  return (
    <div className="w-full mb-8">
      {/* Labels de los pasos */}
      <div className="flex justify-between mb-3 px-1">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep

          return (
            <div key={step.id} className="flex-1 text-center">
              <span
                className={`
                  text-xs font-medium transition-colors duration-300
                  ${isCurrent ? 'text-purple-700' : ''}
                  ${isCompleted ? 'text-purple-600' : ''}
                  ${!isCompleted && !isCurrent ? 'text-gray-400' : ''}
                `}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Barras de progreso */}
      <div className="flex gap-2">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep
          const isActive = stepNumber <= currentStep

          return (
            <div key={step.id} className="flex-1">
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`
                    h-full transition-all duration-500 ease-out rounded-full
                    ${isActive ? 'w-full bg-gradient-to-r from-purple-600 to-blue-600' : 'w-0'}
                  `}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
