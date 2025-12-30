
import React from 'react';
import SecandoLogo from './SecandoLogo';

interface HeroProps {
  onStart: () => void;
  onMethodology: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStart, onMethodology }) => {
  return (
    <div className="relative overflow-hidden bg-[#000b1a] py-24 sm:py-32">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,rgba(0,102,255,0.15),rgba(0,11,26,1))]"></div>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
        <div className="mx-auto max-w-3xl flex flex-col items-center">
          {/* Nova Logo Oficial Reconstruída */}
          <div className="mb-10 relative">
            <div className="absolute -inset-10 bg-blue-500/10 blur-3xl rounded-full"></div>
            <SecandoLogo className="h-64 md:h-80 w-auto relative z-10" variant="light" showText={true} />
          </div>
          
          <h1 className="sr-only">Secando a Lei</h1>
          <p className="mt-2 text-xl md:text-2xl leading-relaxed text-slate-200 font-medium max-w-2xl">
            O seu Personal Trainer de Lei Seca: cronogramas inteligentes e questões inéditas em um só lugar.
          </p>
          <p className="mt-4 text-lg text-slate-400 max-w-xl">
            Transformamos textos jurídicos densos em planos de ação práticos com o poder da Inteligência Artificial.
          </p>
          
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
            <button
              onClick={onStart}
              className="w-full sm:w-auto rounded-xl bg-blue-600 px-10 py-4 text-lg font-bold text-white shadow-lg shadow-blue-900/20 hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all active:scale-95"
            >
              Começar Agora
            </button>
            <button 
              onClick={onMethodology}
              className="text-sm font-semibold leading-6 text-slate-400 hover:text-white transition-colors flex items-center gap-1"
            >
              Conheça a Metodologia <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
