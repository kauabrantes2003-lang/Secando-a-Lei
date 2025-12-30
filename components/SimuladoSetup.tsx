
import React, { useState } from 'react';
import { LawBlock, StudyPlan } from '../types';

interface SimuladoSetupProps {
  plan: StudyPlan;
  onStart: (selectedBlocks: LawBlock[]) => void;
  onCancel: () => void;
}

const SimuladoSetup: React.FC<SimuladoSetupProps> = ({ plan, onStart, onCancel }) => {
  const [selectedIds, setSelectedIds] = useState<number[]>(plan.blocks.map(b => b.day));

  const toggleBlock = (day: number) => {
    setSelectedIds(prev => 
      prev.includes(day) ? prev.filter(id => id !== day) : [...prev, day]
    );
  };

  const handleStart = () => {
    const selected = plan.blocks.filter(b => selectedIds.includes(b.day));
    if (selected.length === 0) return;
    onStart(selected);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-xl border border-slate-200 animate-in fade-in zoom-in duration-300">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 font-serif">Simulado Personalizado</h2>
          <p className="text-slate-500 mt-2">Selecione os tópicos estudados para gerar um exame de 10 questões inéditas.</p>
        </div>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
           </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 max-h-96 overflow-y-auto p-1">
        {plan.blocks.map((block) => (
          <div 
            key={block.day}
            onClick={() => toggleBlock(block.day)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
              selectedIds.includes(block.day) 
                ? 'border-indigo-600 bg-indigo-50' 
                : 'border-slate-100 bg-slate-50 hover:border-slate-300'
            }`}
          >
            <div className={`w-6 h-6 rounded flex items-center justify-center border ${
              selectedIds.includes(block.day) ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'
            }`}>
              {selectedIds.includes(block.day) && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <span className="text-xs font-bold text-indigo-600 uppercase">Dia {block.day}</span>
              <h4 className="font-bold text-slate-800 line-clamp-1">{block.title}</h4>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={() => setSelectedIds(plan.blocks.map(b => b.day))}
          className="px-6 py-3 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
        >
          Selecionar Tudo
        </button>
        <button 
          onClick={() => setSelectedIds([])}
          className="px-6 py-3 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
        >
          Limpar Seleção
        </button>
        <div className="flex-1"></div>
        <button 
          onClick={handleStart}
          disabled={selectedIds.length === 0}
          className={`px-10 py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 hover:bg-indigo-700 active:scale-95 ${selectedIds.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Gerar Simulado ⚡
        </button>
      </div>
    </div>
  );
};

export default SimuladoSetup;
