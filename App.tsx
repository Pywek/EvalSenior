import React, { useState, useEffect } from 'react';
import { ReviewData, ViewMode, ReviewStatus } from './types';
import { INITIAL_REVIEWS } from './constants';
import Dashboard from './components/Dashboard';
import ReviewForm from './components/ReviewForm';
import InterviewMode from './components/InterviewMode';
import PrintView from './components/PrintView';
import { UserCircle, X } from 'lucide-react';

const App: React.FC = () => {
  // State for data persistence
  const [reviews, setReviews] = useState<ReviewData[]>(() => {
    const saved = localStorage.getItem('evalsenior_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  // Navigation State
  const [view, setView] = useState<ViewMode>('dashboard');
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  
  // New state to determine if the user accessed via a shared link (locks navigation)
  const [isSharedView, setIsSharedView] = useState(false);

  // Modal State for creation
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeeRole, setNewEmployeeRole] = useState('');

  // Persistence effect
  useEffect(() => {
    localStorage.setItem('evalsenior_reviews', JSON.stringify(reviews));
  }, [reviews]);

  // URL Parameter Handling for Shared Links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedReviewId = params.get('reviewId');
    const sharedMode = params.get('mode');

    if (sharedReviewId && sharedMode === 'employee') {
      const reviewExists = reviews.find(r => r.id === sharedReviewId);
      if (reviewExists) {
        setSelectedReviewId(sharedReviewId);
        setView('employee-form');
        setIsSharedView(true);
      }
    }
  }, [reviews]); // Dependency on reviews ensures we check after data load

  // Helper to update a specific review
  const handleUpdateReview = (updatedReview: ReviewData) => {
    setReviews(prev => prev.map(r => r.id === updatedReview.id ? updatedReview : r));
    // If completed and NOT in shared view, go back to dashboard
    if (updatedReview.status === ReviewStatus.COMPLETED && !isSharedView) {
      setView('dashboard');
    }
  };

  const submitCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployeeName || !newEmployeeRole) return;

    const newReview: ReviewData = {
      id: Date.now().toString(),
      employeeName: newEmployeeName,
      employeeRole: newEmployeeRole,
      date: new Date().toISOString().split('T')[0],
      status: ReviewStatus.NOT_STARTED,
      employeeAnswers: {},
      managerAnswers: {},
      finalSynthesis: '',
      objectivesNextYear: '',
      trainingNeeds: ''
    };
    
    setReviews([...reviews, newReview]);
    setNewEmployeeName('');
    setNewEmployeeRole('');
    setShowCreateModal(false);
  };

  const handleCopyLink = (reviewId: string) => {
    const baseUrl = window.location.origin + window.location.pathname;
    const link = `${baseUrl}?reviewId=${reviewId}&mode=employee`;
    navigator.clipboard.writeText(link).then(() => {
      // Could add a toast notification here
      alert("Lien copié dans le presse-papier ! Vous pouvez l'envoyer au salarié.");
    });
  };

  const currentReview = reviews.find(r => r.id === selectedReviewId);

  const renderContent = () => {
    if (view === 'dashboard' && !isSharedView) {
      return (
        <Dashboard 
          reviews={reviews} 
          onSelectReview={(r) => setSelectedReviewId(r.id)}
          onCreateReview={() => setShowCreateModal(true)}
          onCopyLink={handleCopyLink}
        />
      );
    }

    if (!currentReview) return <div className="p-10 text-center text-red-500">Erreur : Entretien introuvable ou lien expiré.</div>;

    if (view === 'employee-form') {
      return (
        <ReviewForm 
          review={currentReview} 
          mode="employee"
          onSave={(r) => handleUpdateReview(r)} // Stay on form or show success msg inside component
          onBack={() => setView('dashboard')}
          isSharedView={isSharedView}
        />
      );
    }

    if (view === 'manager-form') {
      return (
        <ReviewForm 
          review={currentReview} 
          mode="manager"
          onSave={(r) => { handleUpdateReview(r); setView('dashboard'); }}
          onBack={() => setView('dashboard')}
          isSharedView={false}
        />
      );
    }

    if (view === 'interview') {
      return (
        <InterviewMode 
          review={currentReview}
          onSave={handleUpdateReview}
          onBack={() => setView('dashboard')}
          onPrint={() => setView('print')}
        />
      );
    }

    if (view === 'print') {
      return (
        <PrintView 
          review={currentReview}
          onBack={() => setView('interview')}
        />
      );
    }
  };

  // Selection Modal (Only if not shared view)
  if (selectedReviewId && view === 'dashboard' && !isSharedView) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl relative">
          <button 
            onClick={() => setSelectedReviewId(null)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
          
          <h2 className="text-2xl font-bold mb-2 text-slate-800">Accéder à l'entretien</h2>
          <p className="text-slate-500 mb-6">{currentReview?.employeeName} - {currentReview?.employeeRole}</p>
          
          <div className="space-y-3">
            <button 
              onClick={() => setView('employee-form')}
              className="w-full p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all flex items-center group"
            >
              <div className="bg-blue-100 p-2 rounded-full mr-4 text-blue-600 group-hover:bg-blue-200">
                <UserCircle size={24} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-800">Je suis le Salarié</p>
                <p className="text-xs text-slate-500">Remplir mon auto-évaluation</p>
              </div>
            </button>

            <button 
              onClick={() => setView('manager-form')}
              className="w-full p-4 border rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all flex items-center group"
            >
              <div className="bg-indigo-100 p-2 rounded-full mr-4 text-indigo-600 group-hover:bg-indigo-200">
                <UserCircle size={24} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-800">Je suis le Directeur</p>
                <p className="text-xs text-slate-500">Préparer l'évaluation</p>
              </div>
            </button>

            <div className="border-t border-slate-100 my-4 pt-4">
               <button 
                onClick={() => setView('interview')}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
              >
                Lancer l'Entretien (Face à Face)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans relative">
      {renderContent()}

      {/* CREATE REVIEW MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-slate-800">Nouvel Entretien</h2>
            <form onSubmit={submitCreateReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom du salarié</label>
                <input 
                  type="text" 
                  required
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newEmployeeName}
                  onChange={e => setNewEmployeeName(e.target.value)}
                  placeholder="Ex: Jean Dupont"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Intitulé du poste</label>
                <input 
                  type="text" 
                  required
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newEmployeeRole}
                  onChange={e => setNewEmployeeRole(e.target.value)}
                  placeholder="Ex: Cuisinier"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 text-slate-600 hover:bg-slate-100 rounded"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;