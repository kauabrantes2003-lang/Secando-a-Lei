
import React, { useState, useRef } from 'react';
import { LawSource } from '../services/geminiService';

interface LawUploadProps {
  onProcess: (source: LawSource, days: number, projectName: string) => void;
  onCancel: () => void;
}

const LawUpload: React.FC<LawUploadProps> = ({ onProcess, onCancel }) => {
  const [text, setText] = useState('');
  const [days, setDays] = useState(15);
  const [projectName, setProjectName] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!text && files.length === 0) || days < 1 || !projectName) {
      alert("Por favor, preencha o nome do projeto e forneça um texto, PDF ou imagem da lei.");
      return;
    }
    
    setIsLoading(true);
    try {
      const source: LawSource = { text: text || undefined };
      const images: Array<{ data: string; mimeType: string }> = [];
      let pdfBase64: string | undefined = undefined;

      for (const file of files) {
        const base64 = await fileToBase64(file);
        if (file.type === 'application/pdf') {
          pdfBase64 = base64; 
        } else if (file.type.startsWith('image/')) {
          images.push({ data: base64, mimeType: file.type });
        }
      }

      source.pdfBase64 = pdfBase64;
      source.images = images.length > 0 ? images : undefined;

      onProcess(source, days, projectName);
    } catch (err) {
      console.error(err);
      alert("Erro ao processar arquivos. Tente novamente.");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto p-8 bg-white rounded-3xl shadow-xl border border-slate-200 animate-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 font-serif flex items-center gap-3">
          <span className="p-2.5 bg-blue-100 text-blue-600 rounded-2xl">⚡</span>
          Novo Cronograma Inteligente
        </h2>
        <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Nome do Projeto <span className="text-blue-500">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-slate-900 font-bold"
                placeholder="Ex: Concurso PC-SP, OAB 2024, etc."
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Prazo em dias para concluir <span className="text-blue-500">*</span>
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="60"
                  className="flex-1 accent-blue-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  disabled={isLoading}
                />
                <span className="w-16 text-center font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-xl border border-blue-100">
                  {days}d
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Anexar Arquivos (PDF ou Fotos da Lei)
              </label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all border-slate-200 bg-slate-50 hover:border-blue-300`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="application/pdf,image/*" 
                  multiple
                  className="hidden" 
                />
                <span className="text-2xl mb-2">📂</span>
                <span className="text-sm text-slate-500 font-bold">Clique para selecionar arquivos</span>
              </div>

              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="flex items-center gap-2 truncate pr-4">
                        <span className="text-lg">{file.type === 'application/pdf' ? '📄' : '🖼️'}</span>
                        <span className="text-xs font-bold text-blue-700 truncate">{file.name}</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeFile(idx)}
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Texto da Legislação
            </label>
            <textarea
              className="flex-1 min-h-[180px] w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-slate-900 font-medium text-sm resize-none placeholder-slate-400 shadow-inner"
              placeholder="Ou cole aqui os artigos, incisos ou o texto integral da lei..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isLoading}
            ></textarea>
          </div>
        </div>
        
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="text-xs text-slate-400 italic font-medium">
            * O Cérebro IA reconhece texto em imagens (OCR) automaticamente.
          </p>
          <button
            type="submit"
            className={`w-full sm:w-auto px-12 py-4 rounded-2xl bg-blue-600 text-white font-bold transition-all shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 flex items-center justify-center gap-3 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Processando...' : 'Gerar Cronograma IA 🚀'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LawUpload;
