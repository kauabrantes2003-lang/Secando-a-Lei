
import React, { useState } from 'react';
import { StudyPlan } from '../types';

interface DashboardProps {
  projects: StudyPlan[];
  onSelect: (plan: StudyPlan) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ projects, onSelect, onDelete, onNew }) => {
  const [copied, setCopied] = useState(false);
  const pixKey = "mentoriabrantes@gmail.com";

  const copyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 font-serif mb-2">Seus Cronogramas</h1>
          <p className="text-slate-500">Gerencie seus planos de estudo ativos e acompanhe sua evolução.</p>
        </div>
        <button 
          onClick={onNew}
          className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2"
        >
          <span>✨ Novo Cronograma</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {projects.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-4xl mb-6">📂</div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Nenhum projeto encontrado</h3>
              <p className="text-slate-500 max-w-sm mb-8">Comece criando seu primeiro cronograma inteligente baseado em qualquer legislação.</p>
              <button 
                onClick={onNew}
                className="text-blue-600 font-bold hover:underline"
              >
                Clique aqui para começar
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project) => {
                const progressPct = Math.round((project.completedDays?.length || 0) / project.totalDays * 100);
                
                return (
                  <div 
                    key={project.id}
                    className="group bg-white rounded-3xl border border-slate-200 p-8 hover:shadow-2xl hover:border-blue-200 transition-all relative overflow-hidden flex flex-col h-full"
                  >
                    <div className="absolute top-0 right-0 p-4">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}
                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                        title="Excluir projeto"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>

                    <div className="mb-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                          ⚖️
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-black text-slate-900">{progressPct}%</span>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Progresso</p>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {project.name}
                      </h3>
                      <p className="text-sm text-slate-400 font-medium uppercase tracking-wider line-clamp-1">
                        {project.lawTitle}
                      </p>
                    </div>

                    <div className="mt-auto space-y-4">
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-6">
                        <div 
                          className="h-full bg-blue-600 transition-all duration-1000" 
                          style={{ width: `${progressPct}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Duração:</span>
                        <span className="font-bold text-slate-700">{project.totalDays} dias</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Concluídos:</span>
                        <span className="font-bold text-emerald-600">{(project.completedDays?.length || 0)} / {project.totalDays}</span>
                      </div>
                      <button 
                        onClick={() => onSelect(project)}
                        className="w-full mt-4 py-3 bg-slate-900 text-white rounded-xl font-bold group-hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                      >
                        Continuar Estudo
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar Support Area */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-indigo-900 to-[#000b1a] rounded-3xl p-8 text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden border border-white/10 sticky top-24">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 blur-3xl rounded-full"></div>
            
            <h2 className="text-2xl font-bold font-serif mb-4 flex items-center gap-2">
              <span className="text-3xl">☕</span> Apoie este projeto
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              O <strong>Secando a Lei</strong> é mantido com muito esforço para ajudar concurseiros de todo o Brasil. 
              Colabore com qualquer valor para ajudar no crescimento e manutenção deste ecossistema inteligente.
            </p>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">Chave PIX (E-mail)</p>
              <div className="flex items-center justify-between gap-3">
                <code className="text-xs font-mono text-slate-100 break-all">{pixKey}</code>
                <button 
                  onClick={copyPix}
                  className={`flex-shrink-0 p-2 rounded-lg transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
                  title="Copiar Chave PIX"
                >
                  {copied ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-slate-400 italic">"Pequenos gestos constroem grandes aprovações."</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
