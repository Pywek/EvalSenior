import { Question } from './types';

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
    employeeName: 'Sophie Martin',
    employeeRole: 'Infirmière Coordinatrice',
    date: new Date().toISOString().split('T')[0],
    status: 'Saisi par salarié',
    employeeAnswers: {
      achievements: "Mise en place du nouveau protocole de distribution des médicaments. Bonne intégration des deux nouvelles aides-soignantes.",
      difficulties: "Le logiciel de soin a eu beaucoup de bugs en début d'année, ce qui a ralenti l'administratif. Parfois difficile de gérer les familles anxieuses.",
      skills_soft: "Très bonne relation avec l'équipe. Je pense être à l'écoute.",
      skills_hard: "Maitrise totale des soins techniques. Besoin de rafraichissement sur la gestion des plannings.",
      atmosphere: "Bonne dynamique, mais un peu de fatigue générale en décembre."
    },
    managerAnswers: {},
    finalSynthesis: "",
    objectivesNextYear: "",
    trainingNeeds: ""
  },
  {
    id: '2',
    employeeName: 'Marc Dubois',
    employeeRole: 'Agent de Maintenance',
    date: new Date().toISOString().split('T')[0],
    status: 'Non commencé',
    employeeAnswers: {},
    managerAnswers: {},
    finalSynthesis: "",
    objectivesNextYear: "",
    trainingNeeds: ""
  }
];