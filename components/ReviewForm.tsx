import React, { useState } from 'react';
import { ReviewData, ReviewStatus } from '../types';
import { QUESTIONS } from '../constants';
import { Save, ArrowLeft, CheckCircle } from 'lucide-react';

interface ReviewFormProps {
  review: ReviewData;
  mode: 'employee' | 'manager';
  onSave: (updatedReview: ReviewData) => void;
  onBack: () => void;
  isSharedView?: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ review, mode, onSave, onBack, isSharedView = false }) => {
  const isManager = mode === 'manager';
  // If manager, we initialize with managerAnswers, otherwise employeeAnswers
  const [answers, setAnswers] = useState<Record<string, string>>(
    isManager ? { ...review.managerAnswers } : { ...review.employeeAnswers }
  );
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedReview = { ...review };
    
    if (isManager) {
      updatedReview.managerAnswers = answers;
      // If it was already Employee Filled, now it becomes Manager Prepared
      if (updatedReview.status === ReviewStatus.EMPLOYEE_FILLED || updatedReview.status === ReviewStatus.NOT_STARTED) {
          updatedReview.status = ReviewStatus.MANAGER_PREPARED;
      }
    } else {
      updatedReview.employeeAnswers = answers;
      if (updatedReview.status === ReviewStatus.NOT_STARTED) {
        updatedReview.status = ReviewStatus.EMPLOYEE_FILLED;
      }
    }
    
    onSave(updatedReview);
    setShowSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000);
  };

  if (showSuccess && isSharedView) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md border border-green-100">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Réponses enregistrées !</h2>
          <p className="text-slate-600 mb-6">
            Merci {review.employeeName}. Vos réponses ont bien été transmises au directeur.
            Vous pouvez fermer cette page ou modifier vos réponses ci-dessous.
          </p>
          <button 
            onClick={() => setShowSuccess(false)}
            className="text-indigo-600 font-medium hover:underline"
          >
            Retourner au formulaire
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {!isSharedView && (
        <button onClick={onBack} className="mb-6 flex items-center text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft size={18} className="mr-2" /> Retour au tableau de bord
        </button>
      )}

      {isSharedView && (
        <div className="mb-6 text-center md:text-left">
           <h1 className="text-xl font-bold text-slate-700">Espace Privé Salarié</h1>
           <p className="text-sm text-slate-500">Préparez votre entretien en toute sérénité.</p>
        </div>
      )}

      <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-slate-100">
        <div className={`p-6 ${isManager ? 'bg-indigo-600' : 'bg-blue-600'} text-white`}>
          <h2 className="text-2xl font-bold">
            {isManager ? 'Espace Directeur - Préparation' : 'Espace Salarié - Auto-évaluation'}
          </h2>
          <p className="opacity-90 mt-1">
            {review.employeeName} - {review.employeeRole}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {QUESTIONS.map((q) => (
            <div key={q.id} className="space-y-3">
              <label htmlFor={q.id} className="block text-lg font-medium text-slate-800">
                {q.label}
              </label>
              {q.description && (
                <p className="text-sm text-slate-500">{q.description}</p>
              )}
              
              {isManager && review.employeeAnswers[q.id] && (
                 <div className="bg-blue-50 border-l-4 border-blue-400 p-3 text-sm text-slate-700 mb-2 rounded-r">
                   <span className="font-semibold block text-blue-800 mb-1">Réponse du salarié :</span>
                   {review.employeeAnswers[q.id]}
                 </div>
              )}

              <textarea
                id={q.id}
                required={!isManager} 
                rows={4}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow text-slate-700"
                placeholder={isManager ? "Votre appréciation..." : "Votre réponse..."}
                value={answers[q.id] || ''}
                onChange={(e) => handleChange(q.id, e.target.value)}
              />
            </div>
          ))}

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className={`flex items-center px-6 py-3 rounded-lg text-white font-medium shadow-md transition-transform hover:-translate-y-0.5 ${isManager ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              <Save size={20} className="mr-2" />
              Enregistrer {isManager ? 'la préparation' : 'mes réponses'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;