
export interface User {
  email: string;
  name?: string;
  password?: string;
}

export interface LawBlock {
  day: number;
  title: string;
  articles: string;
  summary?: string;
  group?: string; // Ex: "Parte Geral", "Parte Especial"
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  blockId?: number;
}

export interface StudyPlan {
  id: string;
  name: string; // Nome dado pelo usuário (ex: Concurso PC-SP)
  lawTitle: string; // Título detectado pela IA
  totalDays: number;
  blocks: LawBlock[];
  completedDays: number[]; // Array de números dos dias concluídos
  createdAt: number;
}

export enum AppState {
  LANDING = 'LANDING',
  LOGIN = 'LOGIN',
  METHODOLOGY = 'METHODOLOGY',
  DASHBOARD = 'DASHBOARD',
  CONFIG = 'CONFIG',
  PLAN_VIEW = 'PLAN_VIEW',
  STUDY_SESSION = 'STUDY_SESSION',
  QUIZ = 'QUIZ',
  SIMULADO_SETUP = 'SIMULADO_SETUP',
  SIMULADO_RUNNING = 'SIMULADO_RUNNING'
}
