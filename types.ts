
export enum ReviewStatus {
  NOT_STARTED = 'Non commencé',
  EMPLOYEE_FILLED = 'Saisi par salarié',
  MANAGER_PREPARED = 'Préparé par manager',
  BOTH_PREPARED = 'Préparé par tout le monde',
  COMPLETED = 'Terminé & Signé'
}

export interface Question {
  id: string;
  category: string;
  label: string;
  type: 'text' | 'rating' | 'list';
  description?: string;
}

export interface ReviewData {
  id: string;
  employeeName: string;
  employeeRole: string;
  date: string;
  validatedAt?: string; // Date de validation de l'entretien
  status: ReviewStatus;
  employeeAnswers: Record<string, string>;
  managerAnswers: Record<string, string>;
  finalSynthesis: string;
  objectivesNextYear: string;
  trainingNeeds: string;
}

export type ViewMode = 'dashboard' | 'employee-form' | 'manager-form' | 'interview' | 'print';