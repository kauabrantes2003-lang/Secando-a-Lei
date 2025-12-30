
import React, { useState } from 'react';

interface MethodologyProps {
  onBack: () => void;
  onStart: () => void;
}

const Methodology: React.FC<MethodologyProps> = ({ onBack, onStart }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-[#000b1a] py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(35rem_35rem_at_top_right,rgba(0,102,255,0.1),transparent)]"></div>
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={onBack}
            className="text-blue-400 font-bold flex items-center gap-2 mb-8 hover:text-blue-300 transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Voltar para o início
          </button>
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-white font-serif mb-6 leading-tight">
                Olá, eu sou <span className="text-blue-500">Kauã Abrantes</span>.
              </h1>
              <p className="text-xl text-slate-300 leading-relaxed mb-6">
                Assim como você, sou concurseiro e senti na pele os desafios dessa jornada. Após ser aprovado em alguns concursos, percebi que a maior barreira entre o candidato e a nomeação não é a falta de esforço, mas a forma como se enfrenta a Lei Seca.
              </p>
              <p className="text-lg text-slate-400">
                Muitos alunos se perdem sem saber quando fazer questões: se esperam terminar toda a legislação ou se fazem aos poucos. A minha experiência provou que o segredo está na fragmentação e na aplicação imediata.
              </p>
            </div>
            
            {/* Foto de Kauã Abrantes com Fallback */}
            <div className="relative">
              <div className="absolute -inset-4 bg-blue-500/20 blur-2xl rounded-full"></div>
              <div className="w-56 h-56 md:w-72 md:h-72 rounded-3xl overflow-hidden border-4 border-blue-600/30 shadow-[0_20px_50px_rgba(0,102,255,0.3)] relative group transition-all duration-500 hover:scale-[1.02] hover:border-blue-500 bg-slate-800">
                {!imageError ? (
                  <img 
                    src="https://profissaofuturo.com.br/wp-content/uploads/2025/02/kaua-abrantes-secando-a-lei.png" 
                    alt="Kauã Abrantes" 
                    className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-white">
                    <span className="text-5xl font-bold text-blue-500 mb-2">KA</span>
                    <span className="text-xs uppercase tracking-widest text-slate-500">Kauã Abrantes</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#000b1a]/80 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity"></div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg uppercase tracking-wider animate-bounce">
                Fundador
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why it works section */}
      <div className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-serif mb-4">
            Por que o "Secando a Lei" funciona?
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            Nossa metodologia baseia-se no ciclo de <strong>Estudo Ativo Segmentado</strong>:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-lg shadow-blue-200">
              🧩
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Fragmentação Inteligente</h3>
            <p className="text-slate-600 leading-relaxed">
              Não adianta ler 100 artigos de uma vez e esquecer os 90 primeiros. Nosso sistema divide a lei em blocos lógicos baseados no seu prazo.
            </p>
          </div>

          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-lg shadow-emerald-200">
              📖
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Leitura e Aplicação</h3>
            <p className="text-slate-600 leading-relaxed">
              A melhor forma de fixar a lei seca é através do contato direto. No nosso método, você estuda, por exemplo, do Art. 1º ao 10º e, imediatamente após a leitura, realiza questões focadas especificamente nesse intervalo.
            </p>
          </div>

          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div className="w-14 h-14 bg-amber-600 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-lg shadow-amber-200">
              🏗️
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Reforço Imediato</h3>
            <p className="text-slate-600 leading-relaxed">
              Fazer questões logo após a leitura fecha o ciclo de aprendizagem, transformando a memória de curto prazo em conhecimento consolidado.
            </p>
          </div>
        </div>
      </div>

      {/* What the system does section */}
      <div className="bg-slate-50 py-24 px-6 border-y border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 font-serif mb-8">
            O Que o Nosso Sistema Faz por Você?
          </h2>
          <p className="text-xl text-slate-600 leading-relaxed mb-12">
            O Secando a Lei automatiza esse processo para que você não perca tempo organizando planilhas ou procurando questões perdidas. Você insere a legislação e o prazo; nós entregamos o cronograma, os resumos e as questões por artigo.
          </p>
          <button 
            onClick={onStart}
            className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-bold text-xl shadow-xl shadow-blue-200 hover:bg-blue-700 hover:scale-105 transition-all active:scale-95"
          >
            Começar Agora 🚀
          </button>
        </div>
      </div>
    </div>
  );
};

export default Methodology;
