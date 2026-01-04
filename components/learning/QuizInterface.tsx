import React, { useState } from 'react';

interface QuizContent {
    question: string;
    options: string[];
    correct_answer: string;
}

interface QuizInterfaceProps {
    content: QuizContent;
    onAnswer: (isCorrect: boolean) => void;
}

const QuizInterface: React.FC<QuizInterfaceProps> = ({ content, onAnswer }) => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const handleSubmit = () => {
        if (!selectedOption) return;

        const isCorrect = selectedOption === content.correct_answer;
        setHasSubmitted(true);

        // Delay moving to next step to show feedback
        setTimeout(() => {
            onAnswer(isCorrect);
            setSelectedOption(null);
            setHasSubmitted(false);
        }, 1500);
    };

    return (
        <div className="max-w-xl mx-auto">
            <h3 className="text-xl font-bold mb-6 text-center">{content.question}</h3>

            <div className="space-y-4">
                {content.options.map((option, index) => {
                    let buttonClass = "w-full p-4 rounded-xl border-2 text-left transition-all text-lg font-medium ";

                    if (hasSubmitted) {
                        if (option === content.correct_answer) {
                            buttonClass += "bg-green-100 border-green-500 text-green-800";
                        } else if (option === selectedOption) {
                            buttonClass += "bg-red-100 border-red-500 text-red-800";
                        } else {
                            buttonClass += "bg-white border-gray-200 opacity-50";
                        }
                    } else {
                        if (option === selectedOption) {
                            buttonClass += "bg-blue-50 border-blue-500 shadow-md transform scale-[1.02]";
                        } else {
                            buttonClass += "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300";
                        }
                    }

                    return (
                        <button
                            key={index}
                            onClick={() => !hasSubmitted && setSelectedOption(option)}
                            className={buttonClass}
                            disabled={hasSubmitted}
                        >
                            {option}
                        </button>
                    );
                })}
            </div>

            <div className="mt-8 flex justify-center">
                <button
                    onClick={handleSubmit}
                    disabled={!selectedOption || hasSubmitted}
                    className={`
            w-full md:w-auto px-10 py-4 text-lg font-bold rounded-full transition-all shadow-lg
            ${hasSubmitted
                            ? 'bg-gray-400 cursor-not-allowed text-white'
                            : !selectedOption
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-green-500 hover:bg-green-600 text-white transform hover:scale-105'
                        }
          `}
                >
                    {hasSubmitted ? 'Checking...' : 'Check Answer'}
                </button>
            </div>
        </div>
    );
};

export default QuizInterface;
