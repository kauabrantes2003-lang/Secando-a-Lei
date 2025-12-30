
import React, { useState, useEffect } from 'react';
import { LawBlock, Question } from '../types';
import { generateQuestionsForBlock } from '../services/geminiService';

interface QuizViewProps {
  block: LawBlock;
  onFinish: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({ block, onFinish }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const q = await generateQuestionsForBlock(block);
        setQuestions(q);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, [block]);

  const handleOptionSelect = (idx: number) => {
    if (showResult) return;
    setSelectedOption(idx);
    setShowResult(true);
    if (idx === questions[currentIdx].correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(c => c + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setLoading(true); // Temporary state to show finishing
      setTimeout(onFinish, 1500);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-12 text-center flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-8"></div>
        <h2 className="text-2xl font-bold text-slate-800">Gerando Questões Inéditas...</h2>
        <p className="text-slate-500 mt-2">Aguarde, o Cérebro IA está analisando a letra da lei para testar sua retenção.</p>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-xl border border-slate-200 my-12">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-500 uppercase text-xs tracking-widest">
          Simulado Inédito - Questão {currentIdx + 1}/{questions.length}
        </h3>
        <div className="text-indigo-600 font-bold">Acertos: {score}</div>
      </div>

      <div className="mb-8">
        <p className="text-xl font-medium text-slate-800 leading-relaxed">
          {currentQ.question}
        </p>
      </div>

      <div className="space-y-4 mb-10">
        {currentQ.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleOptionSelect(idx)}
            disabled={showResult}
            className={`w-full text-left p-5 rounded-xl border-2 transition-all flex items-start gap-4 ${
              showResult
                ? idx === currentQ.correctAnswer
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                  : selectedOption === idx
                  ? 'border-rose-500 bg-rose-50 text-rose-800'
                  : 'border-slate-100 text-slate-400'
                : 'border-slate-200 hover:border-indigo-500 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <span className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold border-2 ${
               showResult 
                ? idx === currentQ.correctAnswer ? 'bg-emerald-500 text-white border-emerald-500' : selectedOption === idx ? 'bg-rose-500 text-white border-rose-500' : 'border-slate-100 text-slate-300'
                : 'border-slate-300 text-slate-400'
            }`}>
              {String.fromCharCode(65 + idx)}
            </span>
            <span className="flex-1">{option}</span>
          </button>
        ))}
      </div>

      {showResult && (
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8 animate-in fade-in slide-in-from-top-4">
          <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
            {selectedOption === currentQ.correctAnswer ? '✅ Correto!' : '❌ Ops, não foi dessa vez.'}
          </h4>
          <p className="text-slate-600 text-sm italic">
            {currentQ.explanation}
          </p>
          <button 
            onClick={nextQuestion}
            className="mt-6 w-full py-3 bg-indigo-600 text-white rounded-lg font-bold shadow hover:bg-indigo-700"
          >
            {currentIdx < questions.length - 1 ? 'Próxima Questão' : 'Ver Resultado Final'}
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizView;
