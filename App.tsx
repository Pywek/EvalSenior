
import React, { useState, useEffect } from 'react';
import { ReviewData, ViewMode, ReviewStatus } from './types';
import { INITIAL_REVIEWS, MANAGER_PASSWORD, DEFAULT_DB_URL } from './constants';
import Dashboard from './components/Dashboard';
import ReviewForm from './components/ReviewForm';
import InterviewMode from './components/InterviewMode';
import PrintView from './components/PrintView';
import SettingsModal from './components/SettingsModal';
import AppLogo from './components/AppLogo';
import { api } from './services/api';
import { UserCircle, X, AlertTriangle, LogIn, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  // Config State
  const [dbUrl, setDbUrl] = useState<string>('');
  const [sheetUrl, setSheetUrl] = useState<string>('');

  // State for data persistence
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);

  // Navigation State
  const [view, setView] = useState<ViewMode>('dashboard');
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  
  // New state to determine if the user accessed via a shared link (locks navigation)
  const [isSharedView, setIsSharedView] = useState(false);
  const [isCheckingUrl, setIsCheckingUrl] = useState(true);

  // Modal State for creation
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEmployeeFirstName, setNewEmployeeFirstName] = useState('');
  const [newEmployeeLastName, setNewEmployeeLastName] = useState('');
  const [newEmployeeRole, setNewEmployeeRole] = useState('');

  // Modal State for deletion
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  // Modal State for Settings
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Initialization Effect
  useEffect(() => {
    const initApp = async () => {
      // 1. ANALYSE IMMÉDIATE DE L'URL
      const params = new URLSearchParams(window.location.search);
      const sharedReviewId = params.get('reviewId');
      const sharedMode = params.get('mode');
      const sharedName = params.get('name');
      const sharedRole = params.get('role');
      const sharedDbUrl = params.get('dbUrl');
      
      const isSharedLink = !!(sharedReviewId && sharedMode === 'employee');

      // 2. Configuration DB & Sheet
      let activeDbUrl = sharedDbUrl;
      let activeSheetUrl = '';

      if (!activeDbUrl) {
        activeDbUrl = localStorage.getItem('evalsenior_db_url');
        activeSheetUrl = localStorage.getItem('evalsenior_sheet_url') || '';
      }

      // REPARATION AUTO : Si l'URL arrive cassée
      if (activeDbUrl && !activeDbUrl.startsWith('http://') && !activeDbUrl.startsWith('https://')) {
        try {
          activeDbUrl = decodeURIComponent(activeDbUrl);
        } catch (e) {}
      }
      
      if (!activeDbUrl || activeDbUrl.trim() === '') {
        activeDbUrl = DEFAULT_DB_URL;
      }
      setDbUrl(activeDbUrl);
      setSheetUrl(activeSheetUrl);

      // 3. LOGIQUE D'AFFICHAGE OPTIMISÉE
      if (isSharedLink && sharedReviewId && sharedName && sharedRole) {
        // ACCÈS RAPIDE SALARIÉ : On affiche tout de suite sans attendre le réseau
        console.log("Mode Salarié : Affichage immédiat");
        setIsSharedView(true);
        setView('employee-form');
        
        // On crée un objet temporaire pour que l'interface s'affiche
        const initialReview: ReviewData = {
          id: sharedReviewId,
          employeeName: sharedName,
          employeeRole: sharedRole,
          date: new Date().toISOString().split('T')[0],
          status: ReviewStatus.NOT_STARTED,
          employeeAnswers: {},
          managerAnswers: {},
          finalSynthesis: '',
          objectivesNextYear: '',
          trainingNeeds: ''
        };
        
        setReviews([initialReview]);
        setSelectedReviewId(sharedReviewId);
        setIsCheckingUrl(false); // On débloque l'interface immédiatement

        // CHARGEMENT EN ARRIÈRE-PLAN (Hydratation)
        // On lance la requête pour récupérer les réponses existantes s'il y en a
        api.fetchReviews(activeDbUrl).then(fetchedReviews => {
          const found = fetchedReviews.find(r => r.id === sharedReviewId);
          if (found) {
            // On met à jour silencieusement pour afficher les textes déjà saisis
            setReviews([found]);
          }
        }).catch(err => console.warn("Background fetch failed", err));

      } else {
        // ACCÈS MANAGER : On charge tout normalement
        setIsLoading(true);
        try {
          const fetchedReviews = await api.fetchReviews(activeDbUrl);
          setReviews(fetchedReviews);
        } catch (e) {
          console.error("Erreur chargement données", e);
        } finally {
          setIsLoading(false);
          setIsCheckingUrl(false);
        }
      }
    };

    initApp();
  }, []);

  const handleRefresh = async () => {
    if (!dbUrl) return;
    setIsLoading(true);
    try {
      const data = await api.fetchReviews(dbUrl);
      setReviews(data);
    } catch (e) {
      console.error("Erreur lors du rafraichissement", e);
      alert("Erreur de connexion : " + e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = (newDbUrl: string, newSheetUrl: string) => {
    setDbUrl(newDbUrl);
    setSheetUrl(newSheetUrl);
    localStorage.setItem('evalsenior_db_url', newDbUrl);
    localStorage.setItem('evalsenior_sheet_url', newSheetUrl);
    
    // Refresh data
    setIsLoading(true);
    api.fetchReviews(newDbUrl).then(data => {
      setReviews(data);
      setIsLoading(false);
    }).catch(e => {
      setIsLoading(false);
      alert("Paramètres enregistrés, mais impossible de charger les données : " + e.message);
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === MANAGER_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  // Helper to update a specific review
  const handleUpdateReview = async (updatedReview: ReviewData) => {
    // Optimistic Update
    setReviews(prev => prev.map(r => r.id === updatedReview.id ? updatedReview : r));
    
    // API Save
    try {
       const success = await api.saveReview(dbUrl, updatedReview);
       if (!success) {
         console.warn("API returned false success status");
       }
    } catch (e) {
      console.error("Save failed in background", e);
      throw e; // Re-throw to let the UI know it failed
    }

    // Navigation logic
    if (updatedReview.status === ReviewStatus.COMPLETED && !isSharedView) {
      setView('dashboard');
    }
  };

  const confirmDeleteReview = (id: string) => {
    setReviewToDelete(id);
  };

  const executeDeleteReview = async () => {
    if (reviewToDelete) {
      setIsLoading(true); // Start visual loading
      try {
        // API delete
        await api.deleteReview(dbUrl, reviewToDelete);

        // Optimistic delete from UI
        setReviews(prev => prev.filter(r => r.id !== reviewToDelete));
        
        if (selectedReviewId === reviewToDelete) {
          setSelectedReviewId(null);
          setView('dashboard');
        }
      } catch (error) {
        console.error("Error deleting", error);
        alert("Erreur lors de la suppression.");
      } finally {
        setIsLoading(false); // Stop visual loading
        setReviewToDelete(null); // Close modal
      }
    }
  };

  const submitCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployeeFirstName || !newEmployeeLastName || !newEmployeeRole) return;

    const newReview: ReviewData = {
      id: Date.now().toString(),
      employeeName: `${newEmployeeFirstName} ${newEmployeeLastName}`,
      employeeRole: newEmployeeRole,
      date: new Date().toISOString().split('T')[0],
      status: ReviewStatus.NOT_STARTED,
      employeeAnswers: {},
      managerAnswers: {},
      finalSynthesis: '',
      objectivesNextYear: '',
      trainingNeeds: ''
    };
    
    // Optimistic add
    setReviews(prev => [...prev, newReview]);
    
    // API Save
    setIsLoading(true);
    await api.saveReview(dbUrl, newReview);
    setIsLoading(false);

    setNewEmployeeFirstName('');
    setNewEmployeeLastName('');
    setNewEmployeeRole('');
    setShowCreateModal(false);
  };

  // Shared Helper for link generation
  const getEmployeeLink = (review: ReviewData) => {
    const params = new URLSearchParams();
    params.append('reviewId', review.id);
    params.append('mode', 'employee');
    params.append('name', review.employeeName);
    params.append('role', review.employeeRole);
    // Important: Include DB URL so employee phone knows where to push data
    if (dbUrl) {
      params.append('dbUrl', dbUrl); 
    }

    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?${params.toString()}`;
  };

  const handleCopyLink = (review: ReviewData) => {
    const link = getEmployeeLink(review);
    navigator.clipboard.writeText(link).then(() => {
      alert("Lien sécurisé copié !");
    });
  };

  const handleEmailLink = (review: ReviewData) => {
    const link = getEmployeeLink(review);
    const subject = encodeURIComponent("Préparation de votre entretien annuel");
    const body = encodeURIComponent(
      `Bonjour ${review.employeeName},\n\n` +
      `Dans le cadre de notre campagne d'entretiens annuels, je vous invite à préparer notre échange en répondant au questionnaire via ce lien sécurisé :\n\n` +
      `${link}\n\n` +
      `Merci de le compléter avant notre réunion.\n\n` +
      `Cordialement,\n` +
      `Le Manager`
    );
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const currentReview = reviews.find(r => r.id === selectedReviewId);

  // Loading state while checking URL
  if (isCheckingUrl) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">Chargement...</div>;
  }

  // LOGIN SCREEN: Shown if not in a shared view (employee link) AND not authenticated
  if (!isSharedView && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
               <AppLogo className="w-24 h-24" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Accès Manager</h1>
            <p className="text-slate-500 mt-2">Veuillez vous identifier pour accéder au tableau de bord.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
              <input 
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 outline-none transition-all ${authError ? 'border-red-300 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-200'}`}
                placeholder="Entrez votre mot de passe"
                autoFocus
              />
              {authError && <p className="text-red-500 text-sm mt-2">Mot de passe incorrect.</p>}
            </div>
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-200"
            >
              <LogIn size={20} />
              Se connecter
            </button>
          </form>
          <div className="mt-6 text-center text-xs text-slate-400">
            EvalSenior v1.0 • Accès sécurisé
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    // If not shared view, we are in manager dashboard context
    if (view === 'dashboard' && !isSharedView) {
      return (
        <Dashboard 
          reviews={reviews} 
          sheetUrl={sheetUrl}
          isLoading={isLoading}
          onOpenManager={(r) => {
             setSelectedReviewId(r.id);
             setView('manager-form');
          }}
          onOpenEmployee={(r) => {
             setSelectedReviewId(r.id);
             setView('employee-form');
          }}
          onOpenInterview={(r) => {
             setSelectedReviewId(r.id);
             setView('interview');
          }}
          onPrint={(r) => {
             setSelectedReviewId(r.id);
             setView('print');
          }}
          onCreateReview={() => setShowCreateModal(true)}
          onCopyLink={handleCopyLink}
          onEmailLink={handleEmailLink}
          onDeleteReview={confirmDeleteReview}
          onOpenSettings={() => setShowSettingsModal(true)}
          onRefresh={handleRefresh}
        />
      );
    }

    if (!currentReview) return <div>Erreur : Entretien introuvable ou lien expiré.</div>;

    if (view === 'employee-form') {
      return (
        <ReviewForm 
          review={currentReview} 
          mode="employee" 
          onSave={handleUpdateReview}
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
          onSave={handleUpdateReview}
          onBack={() => setView('dashboard')}
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      {renderContent()}

      {/* Create Review Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
            <div className="bg-indigo-600 p-4 flex justify-between items-center">
              <h3 className="text-white font-bold text-lg">Nouvel Entretien</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-white/80 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={submitCreateReview} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                  <input 
                    type="text" 
                    required
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="ex: Dupont"
                    value={newEmployeeLastName}
                    onChange={e => setNewEmployeeLastName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
                  <input 
                    type="text" 
                    required
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="ex: Jean"
                    value={newEmployeeFirstName}
                    onChange={e => setNewEmployeeFirstName(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Poste / Fonction</label>
                <input 
                  type="text" 
                  required
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="ex: Aide-Soignant"
                  value={newEmployeeRole}
                  onChange={e => setNewEmployeeRole(e.target.value)}
                />
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium disabled:opacity-50"
                >
                  {isLoading ? 'Création...' : "Créer l'entretien"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {reviewToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Confirmer la suppression</h3>
                <p className="text-slate-600 mb-6">
                  Êtes-vous sûr de vouloir supprimer cet entretien ? Cette action est irréversible.
                </p>
                <div className="flex gap-3 w-full">
                  <button 
                    onClick={() => setReviewToDelete(null)}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={executeDeleteReview}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Suppression en cours...</span>
                      </>
                    ) : 'Supprimer'}
                  </button>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal 
          currentDbUrl={dbUrl}
          currentSheetUrl={sheetUrl}
          onSave={handleSaveSettings}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  );
};

export default App;
