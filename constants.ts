
import { Question } from './types';

export const MANAGER_PASSWORD = 'admin';
export const DEFAULT_DB_URL = 'https://script.google.com/macros/s/AKfycbx30I5HGX7GBrJksrtjrU-s0BBlSupVFF2Bi-b_gLddoogDIufUHFXNE2sEd2OACsjx/exec';
// TODO: Remplacez cette URL par le lien direct de votre image (hébergée en ligne)
export const APP_LOGO = 'https://cdn-icons-png.flaticon.com/512/9474/9474953.png';

export const QUESTIONS: Question[] = [
  {
    id: 'achievements',
    category: 'Bilan de l\'année écoulée',
    label: 'Quelles sont vos principales réussites cette année ?',
    type: 'text',
    description: 'Projets aboutis, tâches bien réalisées, moments forts.'
  },
  {
    id: 'difficulties',
    category: 'Bilan de l\'année écoulée',
    label: 'Quelles difficultés avez-vous rencontrées ?',
    type: 'text',
    description: 'Obstacles techniques, relationnels ou organisationnels.'
  },
  {
    id: 'skills_soft',
    category: 'Compétences & Savoir-être',
    label: 'Comment évaluez-vous votre relationnel (résidents, équipe) ?',
    type: 'text'
  },
  {
    id: 'skills_hard',
    category: 'Compétences & Savoir-être',
    label: 'Avez-vous le sentiment de maîtriser les aspects techniques de votre poste ?',
    type: 'text'
  },
  {
    id: 'atmosphere',
    category: 'Vie au travail',
    label: 'Comment ressentez-vous l\'ambiance générale de la résidence ?',
    type: 'text'
  }
];

export const INITIAL_REVIEWS = [
  {
    id: '1',
    employeeName: 'Exemple Demo',
    employeeRole: 'Infirmier',
    date: new Date().toISOString().split('T')[0],
    status: 'Saisi par salarié',
    employeeAnswers: {
      achievements: "Ceci est une donnée de démonstration locale.",
      difficulties: "Connectez la base de données pour voir les vraies données.",
      skills_soft: "",
      skills_hard: "",
      atmosphere: ""
    },
    managerAnswers: {},
    finalSynthesis: "",
    objectivesNextYear: "",
    trainingNeeds: ""
  }
];