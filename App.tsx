
import React, { useState, useEffect } from 'react';
import { AppState, StudyPlan, LawBlock, User } from './types';
import Hero from './components/Hero';
import Login from './components/Login';
import Methodology from './components/Methodology';
import LawUpload from './components/LawUpload';
import Dashboard from './components/Dashboard';
import StudyPlanView from './components/StudyPlanView';
import StudySession from './components/StudySession';
import QuizView from './components/QuizView';
import SimuladoSetup from './components/SimuladoSetup';
import SimuladoExam from './components/SimuladoExam';
import SecandoLogo from './components/SecandoLogo';
import { generateStudyPlan, LawSource } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<StudyPlan[]>([]);
  const [activePlan, setActivePlan] = useState<StudyPlan | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<LawBlock | null>(null);
  const [simuladoBlocks, setSimuladoBlocks] = useState<LawBlock[]>([]);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [copiedContact, setCopiedContact] = useState(false);

  const contactEmail = "mentoriabrantes@gmail.com";

  // 1. Verificar Sessão ao Carregar
  useEffect(() => {
    const session = localStorage.getItem('secandolalei_session');
    if (session) {
      const user = JSON.parse(session) as User;
      setCurrentUser(user);
      setAppState(AppState.DASHBOARD);
    }
  }, []);

  // 2. Carregar Projetos Específicos do Usuário
  useEffect(() => {
    if (currentUser) {
      const storageKey = `projects_${currentUser.email}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          setProjects(JSON.parse(saved));
        } catch (e) {
          console.error("Erro ao carregar projetos do usuário:", e);
          setProjects([]);
        }
      } else {
        setProjects([]);
      }
    } else {
      setProjects([]);
    }
  }, [currentUser]);

  // 3. Salvar Projetos Específicos do Usuário
  useEffect(() => {
    if (currentUser && projects.length >= 0) {
      const storageKey = `projects_${currentUser.email}`;
      localStorage.setItem(storageKey, JSON.stringify(projects));
      
      if (activePlan) {
        const updated = projects.find(p => p.id === activePlan.id);
        if (updated) setActivePlan(updated);
      }
    }
  }, [projects, currentUser]);

  const handleLogout = () => {
    localStorage.removeItem('secandolalei_session');
    setCurrentUser(null);
    setActivePlan(null);
    setProjects([]);
    setAppState(AppState.LANDING);
  };

  const copyContactEmail = () => {
    navigator.clipboard.writeText(contactEmail);
    setCopiedContact(true);
    setTimeout(() => setCopiedContact(false), 2000);
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.LANDING:
        return <Hero onStart={() => setAppState(currentUser ? AppState.DASHBOARD : AppState.LOGIN)} onMethodology={() => setAppState(AppState.METHODOLOGY)} />;
      case AppState.LOGIN:
        return <Login onLogin={(user) => { setCurrentUser(user); localStorage.setItem('secandolalei_session', JSON.stringify(user)); setAppState(AppState.DASHBOARD); }} onBack={() => setAppState(AppState.LANDING)} />;
      case AppState.METHODOLOGY:
        return <Methodology onBack={() => setAppState(AppState.LANDING)} onStart={() => setAppState(currentUser ? AppState.DASHBOARD : AppState.LOGIN)} />;
      case AppState.DASHBOARD:
        return (
          <div className="min-h-screen bg-slate-50 py-12">
            <Dashboard 
              projects={projects} 
              onSelect={(p) => { setActivePlan(p); setAppState(AppState.PLAN_VIEW); }} 
              onDelete={(id) => { if(confirm("Excluir cronograma?")) setProjects(prev => prev.filter(p => p.id !== id)); }}
              onNew={() => setAppState(AppState.CONFIG)}
            />
          </div>
        );
      case AppState.CONFIG:
        return (
          <div className="min-h-screen bg-slate-50 py-12 flex items-center justify-center">
            <LawUpload onProcess={async (s, d, n) => {
              try {
                const plan = await generateStudyPlan(s, d, n);
                setProjects(prev => [plan, ...prev]);
                setActivePlan(plan);
                setAppState(AppState.PLAN_VIEW);
              } catch (e) { alert("Erro ao processar lei."); }
            }} onCancel={() => setAppState(AppState.DASHBOARD)} />
          </div>
        );
      case AppState.PLAN_VIEW:
        return activePlan ? (
          <div className="min-h-screen bg-slate-50 py-12">
            <div className="max-w-6xl mx-auto px-6 mb-8 flex justify-end">
              <button onClick={() => setAppState(AppState.SIMULADO_SETUP)} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl hover:bg-blue-700 transition-all">🚀 Iniciar Simulado</button>
            </div>
            <StudyPlanView plan={activePlan} onSelectBlock={(b) => { setSelectedBlock(b); setAppState(AppState.STUDY_SESSION); }} onBack={() => setAppState(AppState.DASHBOARD)} />
          </div>
        ) : null;
      case AppState.STUDY_SESSION:
        return selectedBlock && activePlan ? (
          <StudySession 
            block={selectedBlock} 
            isCompleted={activePlan.completedDays.includes(selectedBlock.day)}
            onToggleComplete={() => {
              setProjects(prev => prev.map(p => p.id === activePlan.id ? {...p, completedDays: p.completedDays.includes(selectedBlock.day) ? p.completedDays.filter(d => d !== selectedBlock.day) : [...p.completedDays, selectedBlock.day]} : p));
            }}
            onTakeQuiz={() => setAppState(AppState.QUIZ)} 
            onBack={() => setAppState(AppState.PLAN_VIEW)}
          />
        ) : null;
      case AppState.QUIZ:
        return selectedBlock ? <div className="min-h-screen bg-slate-50 py-12"><QuizView block={selectedBlock} onFinish={() => setAppState(AppState.PLAN_VIEW)} /></div> : null;
      case AppState.SIMULADO_SETUP:
        return activePlan ? <div className="min-h-screen bg-slate-50 py-12 px-6 flex items-center justify-center"><SimuladoSetup plan={activePlan} onStart={(b) => { setSimuladoBlocks(b); setAppState(AppState.SIMULADO_RUNNING); }} onCancel={() => setAppState(AppState.PLAN_VIEW)} /></div> : null;
      case AppState.SIMULADO_RUNNING:
        return <SimuladoExam blocks={simuladoBlocks} onFinish={() => setAppState(AppState.PLAN_VIEW)} />;
      default:
        return null;
    }
  };

  const LegalModal = ({ title, show, onClose, children }: { title: string, show: boolean, onClose: () => void, children: React.ReactNode }) => {
    if (!show) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white max-w-2xl w-full max-h-[80vh] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-slate-200 flex flex-col">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 text-white relative flex-shrink-0">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-2xl font-bold font-serif">{title}</h3>
            <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest">Secando a Lei • Documentação Legal</p>
          </div>
          <div className="p-8 overflow-y-auto text-slate-600 prose prose-slate prose-sm max-w-none">
            {children}
          </div>
          <div className="p-6 border-t border-slate-100 flex justify-end flex-shrink-0">
            <button onClick={onClose} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">Entendido</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center cursor-pointer group" onClick={() => setAppState(AppState.LANDING)}>
          <SecandoLogo className="h-10 w-auto group-hover:scale-105 transition-transform" showText={false} />
          <span className="ml-2 font-bold text-slate-800 hidden sm:inline text-lg text-brand-blue">Secando a Lei</span>
        </div>
        {currentUser && (
          <div className="flex items-center gap-4">
             <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Estudante Ativo</span>
                <span className="text-xs font-bold text-slate-500">{currentUser.name || currentUser.email}</span>
             </div>
             <button onClick={handleLogout} className="w-10 h-10 bg-[#000b1a] rounded-xl flex items-center justify-center text-white hover:bg-rose-600 transition-colors shadow-lg">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
             </button>
          </div>
        )}
      </header>

      <main className="flex-1">{renderContent()}</main>

      {(appState === AppState.LANDING || appState === AppState.METHODOLOGY || appState === AppState.DASHBOARD) && (
        <footer className="bg-[#000b1a] py-12 px-6 border-t border-white/5 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <SecandoLogo className="h-12 w-auto opacity-60 hover:opacity-100 transition-all cursor-pointer" variant="light" showText={false} />
              <div className="text-slate-500 text-sm text-center md:text-left">
                &copy; 2024 Secando a Lei - Ecossistema Jurídico Inteligente.<br/>
                Otimizado com Gemini API para máxima retenção de conteúdo.
              </div>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-2">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Apoie este projeto</p>
              <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                <span className="text-blue-400 text-xs font-mono">{contactEmail}</span>
                <button onClick={() => { navigator.clipboard.writeText(contactEmail); alert("Chave PIX copiada!"); }} className="text-[10px] font-black bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-500 transition-colors">COPIAR PIX</button>
              </div>
            </div>

            <div className="flex gap-6 text-slate-500 text-sm font-medium">
              <button onClick={() => setShowPrivacyModal(true)} className="hover:text-white transition-colors">Privacidade</button>
              <button onClick={() => setShowTermsModal(true)} className="hover:text-white transition-colors">Termos</button>
              <button onClick={() => setShowContactModal(true)} className="hover:text-white transition-colors">Contato</button>
            </div>
          </div>
        </footer>
      )}

      {/* Modal de Contato */}
      {showContactModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-slate-200">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white relative">
              <button onClick={() => setShowContactModal(false)} className="absolute top-4 right-4 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl mb-4 backdrop-blur-md border border-white/20">👋</div>
              <h3 className="text-3xl font-bold font-serif">Fale Conosco</h3>
              <p className="text-blue-100 text-sm mt-2 opacity-90">Dúvidas ou sugestões? Nossa equipe jurídica e técnica está pronta para ajudar.</p>
            </div>
            <div className="p-8 space-y-6">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail de Suporte</p>
                <div className="flex items-center justify-between">
                  <span className="text-slate-900 font-bold truncate pr-4">{contactEmail}</span>
                  <button onClick={copyContactEmail} className={`p-2.5 rounded-xl transition-all ${copiedContact ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                    {copiedContact ? '✓' : '❐'}
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-400 text-center italic">Respondemos em até 24 horas úteis.</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Termos */}
      <LegalModal title="Termos de Uso" show={showTermsModal} onClose={() => setShowTermsModal(false)}>
        <h4 className="font-bold text-slate-900 mb-2">1. Aceitação dos Termos</h4>
        <p>Ao utilizar o Secando a Lei, você concorda em cumprir estes termos. O serviço é uma ferramenta de auxílio ao estudo e não garante aprovação em concursos.</p>
        
        <h4 className="font-bold text-slate-900 mt-4 mb-2">2. Uso da Inteligência Artificial</h4>
        <p>Utilizamos a tecnologia Gemini API para processar textos. Embora busquemos precisão, erros podem ocorrer. O usuário deve sempre conferir a "letra da lei" oficial em fontes governamentais.</p>
        
        <h4 className="font-bold text-slate-900 mt-4 mb-2">3. Propriedade Intelectual</h4>
        <p>A estrutura dos cronogramas e as questões geradas são para uso pessoal e intransferível. A reprodução comercial deste conteúdo sem autorização é proibida.</p>
        
        <h4 className="font-bold text-slate-900 mt-4 mb-2">4. Responsabilidade</h4>
        <p>O Secando a Lei não se responsabiliza por prejuízos decorrentes de interpretações equivocadas da lei ou falhas técnicas temporárias na plataforma.</p>
      </LegalModal>

      {/* Modal de Privacidade */}
      <LegalModal title="Política de Privacidade" show={showPrivacyModal} onClose={() => setShowPrivacyModal(false)}>
        <h4 className="font-bold text-slate-900 mb-2">1. Coleta de Dados</h4>
        <p>Coletamos seu e-mail e nome para gerenciar sua conta e salvar seus projetos de estudo localmente em seu navegador e em nossa base segura.</p>
        
        <h4 className="font-bold text-slate-900 mt-4 mb-2">2. Uso de Arquivos</h4>
        <p>Os PDFs e imagens que você anexa são processados pela API do Google Gemini para extração de texto jurídica. Não armazenamos seus arquivos permanentemente após o processamento.</p>
        
        <h4 className="font-bold text-slate-900 mt-4 mb-2">3. Cookies e LocalStorage</h4>
        <p>Utilizamos o armazenamento local do seu navegador (LocalStorage) para garantir que seu progresso de estudo não seja perdido entre as sessões.</p>
        
        <h4 className="font-bold text-slate-900 mt-4 mb-2">4. Segurança</h4>
        <p>Implementamos padrões rigorosos para proteger suas informações. Seus dados nunca serão vendidos a terceiros ou utilizados para outros fins que não o seu estudo.</p>
      </LegalModal>
    </div>
  );
};

export default App;
