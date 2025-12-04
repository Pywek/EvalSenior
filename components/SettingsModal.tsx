
import React, { useState } from 'react';
import { X, Database, Save, CheckCircle, AlertCircle, PlayCircle, Loader2 } from 'lucide-react';
import { DEFAULT_DB_URL } from '../constants';
import { api } from '../services/api';

interface SettingsModalProps {
  currentDbUrl: string;
  currentSheetUrl: string;
  onSave: (dbUrl: string, sheetUrl: string) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ currentDbUrl, currentSheetUrl, onSave, onClose }) => {
  const [dbUrl, setDbUrl] = useState(currentDbUrl || DEFAULT_DB_URL);
  // We keep the state but remove the input, effectively preserving existing value if any, or defaulting to empty
  const [sheetUrl] = useState(currentSheetUrl || '');
  const [isSaved, setIsSaved] = useState(false);
  
  // Test Connection State
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(dbUrl, sheetUrl);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  const handleTestConnection = async () => {
    if (!dbUrl) return;
    setTestStatus('loading');
    setTestMessage('');
    try {
      const data = await api.fetchReviews(dbUrl);
      if (Array.isArray(data)) {
        setTestStatus('success');
        setTestMessage(`Connexion réussie ! ${data.length} entretien(s) trouvés.`);
      } else {
        throw new Error("Données invalides reçues.");
      }
    } catch (e: any) {
      console.error(e);
      setTestStatus('error');
      setTestMessage(e.message || "Erreur inconnue");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-slate-800 p-4 flex justify-between items-center text-white shrink-0">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Database size={20} /> Configuration Données
          </h3>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          
          {/* Section API Script */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              URL du Script Google (API)
            </label>
            <p className="text-xs text-slate-500 mb-2">
              C'est le lien se terminant par <code>/exec</code> qui permet à l'app de communiquer avec Google.
            </p>
            <input 
              type="url" 
              required
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm font-mono text-slate-600"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={dbUrl}
              onChange={e => setDbUrl(e.target.value)}
            />
            
            {/* Zone de Test */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600">Statut de la connexion :</span>
                <button 
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testStatus === 'loading'}
                  className="text-xs flex items-center gap-1 bg-white border border-slate-300 px-2 py-1 rounded hover:bg-slate-100 text-slate-700"
                >
                  {testStatus === 'loading' ? <Loader2 size={12} className="animate-spin"/> : <PlayCircle size={12} />}
                  Tester
                </button>
              </div>
              
              {testStatus === 'success' && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle size={16} />
                  <span>{testMessage}</span>
                </div>
              )}
              
              {testStatus === 'error' && (
                <div className="space-y-1">
                   <div className="flex items-start gap-2 text-red-600 text-sm font-medium">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>Échec : {testMessage}</span>
                  </div>
                  <p className="text-xs text-slate-500 ml-6">
                    <strong>Solution probable :</strong> Vérifiez votre déploiement Google Script. 
                    L'accès doit être réglé sur <u>"Tout le monde" (Anyone)</u>, et non "Moi uniquement".
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
             <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Fermer
            </button>
            <button 
              type="submit"
              className={`px-6 py-2 rounded-lg text-white font-medium flex items-center gap-2 transition-all ${isSaved ? 'bg-green-600' : 'bg-slate-800 hover:bg-slate-900'}`}
            >
              {isSaved ? <CheckCircle size={18} /> : <Save size={18} />}
              {isSaved ? 'Enregistré' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;
