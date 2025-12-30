
import React, { useState } from 'react';
import { LawBlock } from '../types';
import { explainLegalTerm } from '../services/geminiService';

interface StudySessionProps {
  block: LawBlock;
  isCompleted: boolean;
  onToggleComplete: () => void;
  onTakeQuiz: () => void;
  onBack: () => void;
}

const StudySession: React.FC<StudySessionProps> = ({ block, isCompleted, onToggleComplete, onTakeQuiz, onBack }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);

  const handleSelection = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (text && text.length > 2 && text.length < 100) {
      setSelectedText(text);
    }
  };

  const askAI = async () => {
    if (!selectedText) return;
    setIsExplaining(true);
    try {
      const explanation = await explainLegalTerm(selectedText, block.summary || '');
      setInsight(explanation);
    } catch (error) {
      setInsight("Desculpe, não consegui explicar este termo no momento.");
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar Content / Reading */}
      <div className="flex-1 overflow-y-auto p-8 bg-white" onMouseUp={handleSelection}>
        <div className="flex justify-between items-start mb-6">
          <button onClick={onBack} className="text-indigo-600 flex items-center gap-2 hover:underline font-bold">
            ← Voltar ao Cronograma
          </button>
          
          <button 
            onClick={onToggleComplete}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border-2 ${
              isCompleted 
                ? 'bg-emerald-50 border-emerald-500 text-emerald-600' 
                : 'bg-white border-slate-200 text-slate-400 hover:border-emerald-500 hover:text-emerald-600'
            }`}
          >
            {isCompleted ? (
              <><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg> Dia Concluído</>
            ) : (
              'Marcar como Concluído'
            )}
          </button>
        </div>

        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full mb-4 inline-block">
          DIA {block.day}
        </span>
        <h1 className="text-3xl font-bold text-slate-900 mb-6 font-serif">{block.title}</h1>
        
        <div className="prose prose-slate max-w-none">
          <h4 className="text-lg font-semibold text-slate-700 mb-2">Resumo Didático da Lei:</h4>
          <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap mb-12">
            {block.summary}
          </p>
          
          <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-r-lg mb-8">
            <h5 className="font-bold text-amber-800 mb-2">Dica de Estudo:</h5>
            <p className="text-amber-700 text-sm italic">
              Selecione qualquer palavra ou frase difícil para ver a explicação simplificada do nosso Cérebro IA à direita.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col items-center">
             <h4 className="text-slate-800 font-bold mb-4">Finalizou a leitura?</h4>
             <div className="flex gap-4">
                <button 
                  onClick={onTakeQuiz}
                  className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2"
                >
                   🚀 Testar Retenção com IA
                </button>
                {!isCompleted && (
                  <button 
                    onClick={onToggleComplete}
                    className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                  >
                     Check no Dia ✅
                  </button>
                )}
             </div>
          </div>

          <div className="h-40"></div>
        </div>
      </div>

      {/* AI Assistant Sidebar */}
      <div className="w-full lg:w-96 bg-slate-50 border-l border-slate-200 p-6 flex flex-col shadow-inner">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xl">
            🧠
          </div>
          <h3 className="font-bold text-slate-800">Assistente IA</h3>
        </div>

        {selectedText ? (
          <div className="mb-6 p-4 bg-white rounded-lg border border-indigo-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className="text-xs text-slate-400 mb-1 uppercase font-bold">Termo Selecionado:</p>
            <p className="font-medium text-slate-800 italic mb-4">"{selectedText}"</p>
            <button 
              onClick={askAI}
              className={`w-full py-2 bg-indigo-600 text-white rounded-md text-sm font-bold transition-all hover:bg-indigo-700 flex items-center justify-center gap-2 ${isExplaining ? 'opacity-50' : ''}`}
              disabled={isExplaining}
            >
              {isExplaining ? (
                 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : 'Explicar Agora'}
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 p-8 border-2 border-dashed border-slate-200 rounded-xl mb-6">
            <p className="text-sm">Selecione um termo no texto para análise da IA.</p>
          </div>
        )}

        {insight && (
          <div className="flex-1 bg-white p-6 rounded-xl border border-slate-200 overflow-y-auto mb-6 shadow-sm animate-in zoom-in-95 duration-300">
            <h4 className="text-indigo-600 font-bold text-sm mb-3 uppercase flex items-center gap-2">
              Explicação Didática
            </h4>
            <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
              {insight}
            </div>
          </div>
        )}

        <button 
          onClick={onTakeQuiz}
          className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
        >
          Questões do Dia
        </button>
      </div>
    </div>
  );
};

export default StudySession;
