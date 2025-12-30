
import React, { useState, useEffect, useMemo } from 'react';
import { LawBlock, Question } from '../types';
import { generateSimulado } from '../services/geminiService';
import { jsPDF } from 'jspdf';

interface SimuladoExamProps {
  blocks: LawBlock[];
  onFinish: () => void;
}

const SimuladoExam: React.FC<SimuladoExamProps> = ({ blocks, onFinish }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [time, setTime] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  // Chave única para este conjunto de blocos
  const storageKey = useMemo(() => {
    const ids = blocks.map(b => b.day).join('_');
    return `simulado_progress_${ids}`;
  }, [blocks]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const q = await generateSimulado(blocks);
        setQuestions(q);
        
        // Tentar restaurar progresso após carregar questões
        const savedProgress = localStorage.getItem(storageKey);
        if (savedProgress) {
          try {
            const parsed = JSON.parse(savedProgress);
            setCurrentIdx(parsed.currentIdx || 0);
            setUserAnswers(parsed.userAnswers || {});
            setTime(parsed.time || 0);
          } catch (e) {
            console.error("Erro ao restaurar progresso:", e);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [blocks, storageKey]);

  // Salvar progresso automaticamente
  useEffect(() => {
    if (!loading && !isFinished && questions.length > 0) {
      const progress = {
        currentIdx,
        userAnswers,
        time
      };
      localStorage.setItem(storageKey, JSON.stringify(progress));
    }
  }, [currentIdx, userAnswers, time, loading, isFinished, questions.length, storageKey]);

  useEffect(() => {
    if (loading || isFinished) return;
    const interval = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [loading, isFinished]);

  const handleFinishExam = () => {
    setIsFinished(true);
    localStorage.removeItem(storageKey); // Limpa o progresso ao finalizar
  };

  const handleFinishAndExit = () => {
    localStorage.removeItem(storageKey);
    onFinish();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (optionIdx: number) => {
    if (isFinished) return;
    setUserAnswers(prev => ({ ...prev, [currentIdx]: optionIdx }));
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswer) correct++;
    });
    return correct;
  };

  const exportResultsToPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      const margin = 20;
      let yOffset = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const contentWidth = pageWidth - (margin * 2);

      // Header
      doc.setFillColor(0, 11, 26); // Brand Navy
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('Secando a Lei', margin, 20);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Gabarito Comentado do Simulado', margin, 28);
      
      yOffset = 55;

      // Stats
      const score = calculateScore();
      doc.setTextColor(0, 11, 26);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`Resultado: ${score} de ${questions.length} acertos`, margin, yOffset);
      yOffset += 8;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Tempo total: ${formatTime(time)} | Data: ${new Date().toLocaleDateString('pt-BR')}`, margin, yOffset);
      yOffset += 15;

      // Horizontal line
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, yOffset, pageWidth - margin, yOffset);
      yOffset += 15;

      // Questions
      questions.forEach((q, idx) => {
        if (yOffset > 240) {
          doc.addPage();
          yOffset = 20;
        }

        // Question Number
        doc.setFillColor(241, 245, 249);
        doc.rect(margin, yOffset - 5, contentWidth, 10, 'F');
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(`QUESTÃO ${idx + 1} (Foco: Dia ${q.blockId})`, margin + 5, yOffset + 2);
        yOffset += 15;

        // Question Text
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        const questionLines = doc.splitTextToSize(q.question, contentWidth);
        doc.text(questionLines, margin, yOffset);
        yOffset += (questionLines.length * 6) + 5;

        // User Answer
        const userAnswerIdx = userAnswers[idx];
        const isCorrect = userAnswerIdx === q.correctAnswer;
        
        doc.setFont('helvetica', 'bold');
        
        if (isCorrect) {
          doc.setTextColor(16, 185, 129);
        } else if (userAnswerIdx === undefined) {
          doc.setTextColor(100, 116, 139);
        } else {
          doc.setTextColor(244, 63, 94);
        }

        const userStatusText = userAnswerIdx !== undefined 
            ? `Sua Resposta: ${String.fromCharCode(65 + userAnswerIdx)}) ${q.options[userAnswerIdx]}`
            : 'Sua Resposta: Não respondida';
        const userLines = doc.splitTextToSize(userStatusText, contentWidth);
        doc.text(userLines, margin, yOffset);
        yOffset += (userLines.length * 6) + 2;

        // Correct Answer
        doc.setTextColor(16, 185, 129);
        const correctText = `Gabarito Oficial: ${String.fromCharCode(65 + q.correctAnswer)}) ${q.options[q.correctAnswer]}`;
        const correctLines = doc.splitTextToSize(correctText, contentWidth);
        doc.text(correctLines, margin, yOffset);
        yOffset += (correctLines.length * 6) + 5;

        // Explanation
        doc.setTextColor(71, 85, 105);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        const explanationLines = doc.splitTextToSize(`Comentário: ${q.explanation}`, contentWidth);
        doc.text(explanationLines, margin, yOffset);
        yOffset += (explanationLines.length * 5) + 20;
      });

      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('Simulado gerado por IA - Secando a Lei © 2024', margin, 285);

      doc.save(`Resultado_Simulado_${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      alert("Erro ao gerar PDF do simulado.");
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-20 text-center flex flex-col items-center">
        <div className="relative w-24 h-24 mb-10">
           <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
           <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Montando Prova...</h2>
        <p className="text-slate-500 max-w-sm">O Cérebro IA está selecionando os pontos mais importantes dos seus {blocks.length} dias de estudo.</p>
      </div>
    );
  }

  if (isFinished) {
    const score = calculateScore();
    const pct = (score / questions.length) * 100;
    return (
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-xl border border-slate-200 mt-10 animate-in zoom-in-95">
        <div className="text-center mb-12">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${pct >= 70 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
            <span className="text-3xl font-bold">{score}/{questions.length}</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 font-serif">Resultado do Simulado</h2>
          <p className="text-slate-500 mt-2">Você completou o simulado em {formatTime(time)}.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="p-6 bg-slate-50 rounded-xl">
             <h4 className="font-bold text-slate-800 mb-4">Desempenho Geral</h4>
             <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${pct}%` }}></div>
             </div>
             <p className="text-sm text-slate-600 mt-4">
               {pct >= 70 ? 'Parabéns! Seu nível de retenção está excelente para concursos de alto nível.' : 'Bom esforço, mas a "letra da lei" exige mais revisões constantes.'}
             </p>
          </div>
          <div className="p-6 bg-slate-50 rounded-xl">
             <h4 className="font-bold text-slate-800 mb-4">Ações Disponíveis</h4>
             <div className="flex flex-col gap-3">
                <button 
                  onClick={exportResultsToPDF}
                  disabled={isExporting}
                  className={`flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg font-bold shadow hover:bg-emerald-700 transition-all ${isExporting ? 'opacity-50' : ''}`}
                >
                  {isExporting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : '📄 Exportar Gabarito (PDF)'}
                </button>
                <ul className="text-xs space-y-2 text-slate-500 mt-2">
                  <li className="flex items-center gap-2">✅ Revisar dias com erros</li>
                  <li className="flex items-center gap-2">✅ Refazer simulado em 48h</li>
                </ul>
             </div>
          </div>
        </div>

        <button 
          onClick={handleFinishAndExit}
          className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
        >
          Finalizar e Voltar ao Plano
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
      {/* Exam Navigator Sidebar */}
      <div className="w-full lg:w-80 bg-slate-50 border-r border-slate-200 p-6 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-bold text-slate-800">Simulado</h3>
          <span className="text-indigo-600 font-mono font-bold text-xl">{formatTime(time)}</span>
        </div>

        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
           <p className="text-xs text-blue-700 font-medium flex items-center gap-1">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
               <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
             </svg>
             Progresso salvo automaticamente
           </p>
        </div>

        <div className="grid grid-cols-5 gap-2 mb-8">
          {questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              className={`h-10 rounded-lg flex items-center justify-center font-bold text-sm border-2 transition-all ${
                currentIdx === idx ? 'border-indigo-600 bg-indigo-50 text-indigo-700' :
                userAnswers[idx] !== undefined ? 'border-slate-300 bg-slate-300 text-slate-600' :
                'border-slate-200 bg-white text-slate-400'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        <div className="mt-auto">
          <button 
            onClick={handleFinishExam}
            className="w-full py-3 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 shadow-md shadow-rose-100 transition-all"
          >
            Entregar Prova
          </button>
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 overflow-y-auto p-12 bg-white flex flex-col items-center">
        <div className="max-w-3xl w-full">
          <div className="flex items-center gap-2 mb-8">
             <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded uppercase">
               Dia {currentQ.blockId}
             </span>
             <span className="text-slate-400 text-xs">•</span>
             <span className="text-slate-400 text-xs uppercase">Questão {currentIdx + 1}</span>
          </div>

          <p className="text-2xl font-medium text-slate-900 mb-12 leading-relaxed">
            {currentQ.question}
          </p>

          <div className="space-y-4 mb-12">
            {currentQ.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                className={`w-full text-left p-6 rounded-2xl border-2 transition-all flex items-start gap-4 ${
                  userAnswers[currentIdx] === idx
                    ? 'border-indigo-600 bg-indigo-50 ring-4 ring-indigo-50'
                    : 'border-slate-100 bg-white hover:border-slate-300'
                }`}
              >
                <span className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold border-2 ${
                  userAnswers[currentIdx] === idx ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-300 text-slate-400'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className={`flex-1 ${userAnswers[currentIdx] === idx ? 'text-indigo-900 font-semibold' : 'text-slate-700'}`}>
                  {option}
                </span>
              </button>
            ))}
          </div>

          <div className="flex justify-between pt-8 border-t border-slate-100">
            <button 
              onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="px-6 py-3 text-slate-500 font-bold hover:text-indigo-600 disabled:opacity-30"
            >
              ← Anterior
            </button>
            <button 
              onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={currentIdx === questions.length - 1}
              className="px-10 py-3 bg-indigo-600 text-white rounded-lg font-bold shadow-lg shadow-indigo-100 disabled:opacity-30"
            >
              Próxima →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimuladoExam;
