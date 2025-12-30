
import React, { useState, useMemo } from 'react';
import { StudyPlan, LawBlock } from '../types';
import { jsPDF } from 'jspdf';

interface StudyPlanViewProps {
  plan: StudyPlan;
  onSelectBlock: (block: LawBlock) => void;
  onBack: () => void;
}

const StudyPlanView: React.FC<StudyPlanViewProps> = ({ plan, onSelectBlock, onBack }) => {
  const [isExporting, setIsExporting] = useState(false);
  
  const groups = useMemo(() => {
    const map: Record<string, LawBlock[]> = {};
    plan.blocks.forEach(block => {
      const g = block.group || 'Geral';
      if (!map[g]) map[g] = [];
      map[g].push(block);
    });
    return map;
  }, [plan]);

  const groupNames = Object.keys(groups);
  const [activeGroup, setActiveGroup] = useState(groupNames[0] || 'Geral');

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      const margin = 20;
      let yOffset = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const contentWidth = pageWidth - (margin * 2);

      doc.setFillColor(0, 11, 26);
      doc.rect(0, 0, pageWidth, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('Secando a Lei', margin, 20);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Projeto: ${plan.name}`, margin, 28);
      
      yOffset = 55;
      doc.setTextColor(0, 11, 26);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      const titleLines = doc.splitTextToSize(plan.lawTitle, contentWidth);
      doc.text(titleLines, margin, yOffset);
      yOffset += (titleLines.length * 8) + 5;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 116, 139);
      doc.text(`Cronograma de ${plan.totalDays} dias gerado por IA`, margin, yOffset);
      yOffset += 15;

      doc.setDrawColor(226, 232, 240);
      doc.line(margin, yOffset, pageWidth - margin, yOffset);
      yOffset += 15;

      plan.blocks.forEach((block) => {
        if (yOffset > 250) {
          doc.addPage();
          yOffset = 20;
        }
        doc.setFillColor(238, 242, 255);
        doc.roundedRect(margin, yOffset - 5, 25, 8, 2, 2, 'F');
        doc.setTextColor(79, 70, 229);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`DIA ${block.day}`, margin + 3, yOffset + 1);
        yOffset += 12;
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        const blockTitleLines = doc.splitTextToSize(block.title, contentWidth);
        doc.text(blockTitleLines, margin, yOffset);
        yOffset += (blockTitleLines.length * 7);
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Grupo: ${block.group || 'Geral'} | Foco: ${block.articles}`, margin, yOffset);
        yOffset += 8;
        doc.setTextColor(51, 65, 85);
        doc.setFontSize(11);
        const summaryLines = doc.splitTextToSize(block.summary || '', contentWidth);
        doc.text(summaryLines, margin, yOffset);
        yOffset += (summaryLines.length * 6) + 15;
      });
      doc.save(`Cronograma_${plan.name.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error(error);
      alert("Erro ao exportar PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
        <div>
          <button onClick={onBack} className="text-sm font-bold text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-1 group">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Voltar ao Dashboard
          </button>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-4xl font-bold text-slate-900 font-serif">{plan.name}</h1>
            <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full uppercase tracking-widest border border-slate-200">
              {plan.totalDays} DIAS
            </span>
          </div>
          <p className="text-slate-500 font-medium">{plan.lawTitle}</p>
        </div>
        <button 
          onClick={exportToPDF}
          disabled={isExporting}
          className={`flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 ${isExporting ? 'opacity-50' : ''}`}
        >
          {isExporting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : '📄 Baixar PDF'}
        </button>
      </div>

      <div className="flex overflow-x-auto pb-4 mb-8 scrollbar-hide border-b border-slate-200 gap-2">
        {groupNames.map(name => (
          <button
            key={name}
            onClick={() => setActiveGroup(name)}
            className={`px-6 py-3 rounded-t-2xl font-bold whitespace-nowrap transition-all border-b-2 ${
              activeGroup === name 
                ? 'text-blue-600 border-blue-600 bg-blue-50/50' 
                : 'text-slate-400 border-transparent hover:text-slate-600'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {groups[activeGroup]?.map((block) => {
          const isDone = plan.completedDays.includes(block.day);
          
          return (
            <div 
              key={block.day}
              className={`group bg-white p-8 rounded-3xl border transition-all cursor-pointer relative ${
                isDone ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1'
              }`}
              onClick={() => onSelectBlock(block)}
            >
              <div className="flex justify-between items-start mb-6">
                <span className={`px-4 py-1.5 text-xs font-black rounded-xl uppercase tracking-widest ${
                  isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  DIA {block.day}
                </span>
                {isDone && (
                  <span className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
              
              <h3 className={`text-xl font-bold mb-4 line-clamp-2 leading-snug transition-colors ${
                isDone ? 'text-emerald-900' : 'text-slate-900 group-hover:text-blue-600'
              }`}>
                {block.title}
              </h3>
              
              <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed">
                {block.summary}
              </p>
              
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  ⚖️ {block.articles}
                </span>
                <span className={`text-xs font-bold transition-opacity ${
                  isDone ? 'text-emerald-600' : 'text-blue-600 opacity-0 group-hover:opacity-100'
                }`}>
                  {isDone ? 'CONCLUÍDO' : 'ESTUDAR AGORA'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudyPlanView;
