
import React, { useState, useRef, useEffect } from 'react';
import SecandoLogo from './SecandoLogo';
import { User } from '../types';
import emailjs from '@emailjs/browser';

/**
 * CONFIGURAÇÃO DO EMAILJS:
 * 1. Crie conta em https://www.emailjs.com/
 * 2. Adicione um "Email Service" e um "Email Template".
 * 3. No Template, use as variáveis: {{to_name}}, {{to_email}} e {{recovery_code}}.
 */
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_secando', 
  TEMPLATE_ID: 'template_recovery',
  PUBLIC_KEY: 'YOUR_PUBLIC_KEY' 
};

interface LoginProps {
  onLogin: (user: User) => void;
  onBack: () => void;
}

type AuthMode = 'login' | 'signup' | 'forgot';
type ForgotStep = 'email' | 'code' | 'reset';

const Login: React.FC<LoginProps> = ({ onLogin, onBack }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [forgotStep, setForgotStep] = useState<ForgotStep>('email');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);
  const [generatedCode, setGeneratedCode] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const getUsersFromDB = (): User[] => {
    const data = localStorage.getItem('secandolalei_users');
    return data ? JSON.parse(data) : [];
  };

  const saveUserToDB = (user: User) => {
    const users = getUsersFromDB();
    users.push(user);
    localStorage.setItem('secandolalei_users', JSON.stringify(users));
  };

  const updateUserPasswordInDB = (email: string, newPass: string) => {
    const users = getUsersFromDB();
    const index = users.findIndex(u => u.email === email);
    if (index !== -1) {
      users[index].password = newPass;
      localStorage.setItem('secandolalei_users', JSON.stringify(users));
      return true;
    }
    return false;
  };

  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const sendRealEmail = async (targetEmail: string, userName: string, code: string) => {
    try {
      if (EMAILJS_CONFIG.PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
        console.warn('EmailJS não configurado. Código para teste:', code);
        return true; // Simula sucesso para desenvolvimento
      }

      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        {
          to_name: userName,
          to_email: targetEmail,
          recovery_code: code
        },
        EMAILJS_CONFIG.PUBLIC_KEY
      );
      return true;
    } catch (err) {
      console.error('Erro EmailJS:', err);
      return false;
    }
  };

  const handleForgotFlow = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const users = getUsersFromDB();
    const user = users.find(u => u.email === email);

    if (forgotStep === 'email') {
      if (!user) {
        setError("E-mail não encontrado na base de dados.");
        setIsLoading(false);
        return;
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      
      const sent = await sendRealEmail(email, user.name || 'Estudante', code);
      
      if (sent) {
        setSuccess(`Código enviado para ${email}. Verifique seu e-mail.`);
        setForgotStep('code');
      } else {
        setError("Erro ao enviar e-mail. Tente novamente.");
      }
    } 
    else if (forgotStep === 'code') {
      if (otp.join('') === generatedCode) {
        setForgotStep('reset');
        setSuccess(null);
      } else {
        setError("Código incorreto.");
      }
    } 
    else if (forgotStep === 'reset') {
      if (updateUserPasswordInDB(email, newPassword)) {
        setSuccess("Senha atualizada na base de dados!");
        setMode('login');
        setForgotStep('email');
      }
    }
    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      const users = getUsersFromDB();
      
      if (mode === 'signup') {
        if (users.find(u => u.email === email)) {
          setError("E-mail já cadastrado.");
          setIsLoading(false);
          return;
        }
        saveUserToDB({ email, password, name });
        onLogin({ email, name });
      } else {
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
          onLogin({ email: user.email, name: user.name });
        } else {
          setError("E-mail ou senha incorretos.");
          setIsLoading(false);
        }
      }
    }, 800);
  };

  const renderForgotMode = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-3xl mb-4 border border-blue-100">
          {forgotStep === 'email' ? '📧' : forgotStep === 'code' ? '🔢' : '🔓'}
        </div>
        <h2 className="text-3xl font-bold text-slate-900 font-serif text-center">
          {forgotStep === 'email' ? 'Recuperar Acesso' : forgotStep === 'code' ? 'Código Enviado' : 'Nova Senha'}
        </h2>
      </div>

      <form onSubmit={handleForgotFlow} className="space-y-6">
        {forgotStep === 'email' && (
          <input
            type="email"
            required
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-slate-900 font-medium placeholder-slate-400"
            placeholder="Seu e-mail cadastrado"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        )}

        {forgotStep === 'code' && (
          <div className="flex justify-between gap-2">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={el => { otpInputs.current[idx] = el; }}
                type="text"
                maxLength={1}
                className="w-12 h-14 text-center text-2xl font-bold bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-600 outline-none text-slate-900"
                value={digit}
                onChange={(e) => handleOtpChange(e.target.value, idx)}
                onKeyDown={(e) => handleOtpKeyDown(e, idx)}
              />
            ))}
          </div>
        )}

        {forgotStep === 'reset' && (
          <input
            type="password"
            required
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 font-medium placeholder-slate-400"
            placeholder="Nova senha segura"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Confirmar'}
        </button>
      </form>
      <button onClick={() => setMode('login')} className="w-full mt-6 text-slate-500 text-sm font-bold hover:text-blue-600">← Voltar ao login</button>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 px-6 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200 p-10">
        {error && <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-sm font-medium">{error}</div>}
        {success && <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 text-sm font-medium">{success}</div>}

        {mode === 'forgot' ? renderForgotMode() : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col items-center mb-8">
              <SecandoLogo className="h-20 w-auto mb-4" showText={false} variant="dark" />
              <h2 className="text-3xl font-bold text-slate-900 font-serif">{mode === 'signup' ? 'Cadastro' : 'Login'}</h2>
            </div>

            {mode === 'signup' && (
              <input
                type="text"
                required
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 font-medium placeholder-slate-400"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}

            <input
              type="email"
              required
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 font-medium placeholder-slate-400"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="relative">
              <input
                type="password"
                required
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 font-medium placeholder-slate-400"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {mode === 'login' && (
                <button type="button" onClick={() => setMode('forgot')} className="absolute right-4 top-4 text-xs font-bold text-blue-600 hover:underline">Esqueceu?</button>
              )}
            </div>

            <button type="submit" disabled={isLoading} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all">
              {isLoading ? 'Processando...' : mode === 'signup' ? 'Criar Conta na Base' : 'Entrar'}
            </button>

            <p className="text-center text-slate-500 text-sm mt-6">
              {mode === 'signup' ? 'Já tem conta?' : 'Novo aqui?'}
              <button type="button" onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')} className="ml-2 text-blue-600 font-bold hover:underline">
                {mode === 'signup' ? 'Faça Login' : 'Cadastre-se'}
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
