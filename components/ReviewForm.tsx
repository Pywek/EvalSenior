
import React, { useState, useEffect } from 'react';
import { ReviewData, ReviewStatus } from '../types';
import { QUESTIONS } from '../constants';
import { ArrowLeft, CheckCircle, Loader2, Send } from 'lucide-react';

interface ReviewFormProps {
  review: ReviewData;
  mode: 'employee' | 'manager';
  onSave: (updatedReview: ReviewData) => Promise<void>;
  onBack: () => void;
  isSharedView?: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ review, mode, onSave, onBack, isSharedView = false }) => {
  const isManager = mode === 'manager';
  
  // Initialize state
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state with props when review data changes (fixes persistence issue)
  useEffect(() => {
    const initialAnswers = isManager ? { ...review.managerAnswers } : { ...review.employeeAnswers };
    setAnswers(initialAnswers);
  }, [review, isManager]);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const handleChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Clone review to avoid direct mutation
    const updatedReview = { ...review };
    
    // 1. Update Answers
    if (isManager) {
      updatedReview.managerAnswers = answers;
    } else {
      updatedReview.employeeAnswers = answers;
    }

    // 2. Smart Status Calculation
    // We check if there is ACTUAL data in the answers to determine status
    const hasEmployeeData = Object.values(updatedReview.employeeAnswers || {}).some(val => val && val.trim().length > 0);
    const hasManagerData = Object.values(updatedReview.managerAnswers || {}).some(val => val && val.trim().length > 0);

    // Only update status if not already completed/signed
    if (updatedReview.status !== ReviewStatus.COMPLETED) {
      if (hasEmployeeData && hasManagerData) {
        updatedReview.status = ReviewStatus.BOTH_PREPARED;
      } else if (hasEmployeeData) {
        updatedReview.status = ReviewStatus.EMPLOYEE_FILLED;
      } else if (hasManagerData) {
        updatedReview.status = ReviewStatus.MANAGER_PREPARED;
      } else {
        updatedReview.status = ReviewStatus.NOT_STARTED;
      }
    }
    
    try {
      // Execute save immediately without artificial delays
      await onSave(updatedReview);
      setShowSuccess(true);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'enregistrement. Vérifiez votre connexion.");
    } finally {
      setIsSubmitting(false);
    }
  };

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

      {/* Floating Success Notification (Toast) - Works for everyone now */}
      {showSuccess && (
        <div className="fixed top-6 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-bounce z-50">
          <CheckCircle size={20} />
          <span>Sauvegarde effectuée !</span>
        </div>
      )}

      <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-slate-100 relative">
        {/* Header */}
        <div className={`p-6 ${isManager ? 'bg-indigo-600' : 'bg-blue-600'} text-white`}>
          <h2 className="text-2xl font-bold">
            {isManager ? 'Espace Manager - Préparation' : 'Espace Salarié - Préparation'}
          </h2>
          <p className="opacity-90 mt-1 font-medium">
            Salarié concerné : {review.employeeName}
          </p>
          <div className="mt-2 text-xs bg-white/20 inline-block px-2 py-1 rounded">
            {review.employeeRole}
          </div>
        </div>

        {/* Loading Overlay during submit */}
        {isSubmitting && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-40 flex flex-col items-center justify-center">
            <Loader2 size={48} className="text-blue-600 animate-spin mb-4" />
            <p className="text-lg font-bold text-slate-700">Enregistrement en cours...</p>
            <p className="text-sm text-slate-500">Transmission sécurisée des données</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="text-sm text-slate-500 border-b border-slate-100 pb-4">
            <p className="flex items-center gap-2">
              <span className="text-red-500">*</span> Champs obligatoires
            </p>
          </div>

          {QUESTIONS.map((q) => (
             <div key={q.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Question Header */}
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                 <div>
                    <label htmlFor={q.id} className="font-semibold text-slate-800 text-base block">
                      {q.label} {!isManager && <span className="text-red-500">*</span>}
                    </label>
                    {q.description && (
                      <p className="text-xs text-slate-500 mt-0.5">{q.description}</p>
                    )}
                 </div>
              </div>

              <div className="p-5 space-y-4">
                 {/* Display Employee Answer for Manager */}
                 {isManager && review.employeeAnswers && review.employeeAnswers[q.id] && (
                   <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 text-sm text-slate-700">
                     <span className="font-bold text-blue-800 text-xs uppercase tracking-wider block mb-1">Réponse Salarié</span>
                     {review.employeeAnswers[q.id]}
                   </div>
                 )}
                
                {/* Input Area */}
                <textarea
                  id={q.id}
                  required={!isManager} 
                  rows={4}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-700 text-sm leading-relaxed placeholder:text-slate-400"
                  placeholder={isManager ? "Votre appréciation..." : "Votre réponse..."}
                  value={answers[q.id] || ''}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          ))}

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                flex items-center px-8 py-3 rounded-xl text-white font-bold shadow-md transition-all
                ${isSubmitting 
                  ? 'bg-slate-400 cursor-wait' 
                  : (isManager ? 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5' : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5')
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="mr-2 animate-spin" />
                  Transmission...
                </>
              ) : (
                <>
                  <Send size={20} className="mr-2" />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;
