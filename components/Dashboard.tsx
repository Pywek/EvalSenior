import React from 'react';
import { ReviewData, ReviewStatus } from '../types';
import { Users, CheckCircle, Clock, Plus, Link as LinkIcon, Trash2, Calendar, Pencil, MessageSquare, Printer, Mail, Settings, RefreshCw } from 'lucide-react';
import AppLogo from './AppLogo';

interface DashboardProps {
  reviews: ReviewData[];
  sheetUrl?: string;
  onOpenManager: (review: ReviewData) => void;
  onOpenEmployee: (review: ReviewData) => void;
  onOpenInterview: (review: ReviewData) => void;
  onPrint: (review: ReviewData) => void;
  onCreateReview: () => void;
  onCopyLink: (review: ReviewData) => void;
  onEmailLink: (review: ReviewData) => void;
  onDeleteReview: (id: string) => void;
  onOpenSettings: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  reviews, 
  sheetUrl,
  onOpenManager, 
  onOpenEmployee,
  onOpenInterview, 
  onPrint,
  onCreateReview, 
  onCopyLink, 
  onEmailLink,
  onDeleteReview,
  onOpenSettings,
  onRefresh,
  isLoading
}) => {
  
  const getStatusColor = (status: ReviewStatus) => {
    switch (status) {
      case ReviewStatus.NOT_STARTED: return 'bg-gray-100 text-gray-600';
      case ReviewStatus.EMPLOYEE_FILLED: return 'bg-blue-100 text-blue-700';
      case ReviewStatus.MANAGER_PREPARED: return 'bg-purple-100 text-purple-700';
      case ReviewStatus.BOTH_PREPARED: return 'bg-teal-100 text-teal-800 border border-teal-200';
      case ReviewStatus.COMPLETED: return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <AppLogo className="w-12 h-12" />
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Tableau de Bord</h1>
            <p className="text-slate-500 mt-1">Gestion des entretiens annuels</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 items-center ml-auto">
          <button 
            onClick={onRefresh}
            className={`flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg transition-colors shadow-sm ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Actualiser les données"
            disabled={isLoading}
          >
            <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
            <span className="hidden md:inline">Actualiser</span>
          </button>

          <button 
            onClick={onOpenSettings}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg transition-colors shadow-sm"
            title="Configuration"
          >
            <Settings size={20} />
            <span className="hidden md:inline">Configuration</span>
          </button>
          <button 
            onClick={onCreateReview}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Plus size={20} />
            <span className="hidden md:inline">Nouvel Entretien</span>
            <span className="md:hidden">Nouveau</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Salariés</p>
            <p className="text-2xl font-bold text-slate-800">{reviews.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-full">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">En attente</p>
            <p className="text-2xl font-bold text-slate-800">
              {reviews.filter(r => r.status !== ReviewStatus.COMPLETED).length}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-full">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Terminés</p>
            <p className="text-2xl font-bold text-slate-800">
              {reviews.filter(r => r.status === ReviewStatus.COMPLETED).length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[300px]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800">Liste des entretiens</h2>
          {isLoading && <span className="text-xs text-indigo-600 font-medium animate-pulse">Synchronisation...</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-800 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Salarié</th>
                <th className="px-6 py-4">Poste</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Date Validation</th>
                <th className="px-6 py-4 text-center">Lien Salarié</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reviews.map((review) => (
                <tr key={review.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{review.employeeName}</td>
                  <td className="px-6 py-4">{review.employeeRole}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(review.status as ReviewStatus)}`}>
                      {review.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {review.validatedAt ? (
                      <span className="flex items-center text-green-600 gap-1">
                        <Calendar size={14} />
                        {review.validatedAt.split('-').reverse().join('/')}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                       <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenEmployee(review);
                        }}
                        title="Ouvrir/Modifier la saisie salarié"
                        className="p-2 bg-stone-100 text-green-900 hover:bg-stone-200 hover:text-green-950 rounded-full transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCopyLink(review);
                        }}
                        title="Copier le lien dans le presse-papier"
                        className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 rounded-full transition-colors"
                      >
                        <LinkIcon size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEmailLink(review);
                        }}
                        title="Envoyer le lien par email"
                        className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 rounded-full transition-colors"
                      >
                        <Mail size={16} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-center gap-2">
                      
                      {review.validatedAt && (
                         <button 
                            onClick={() => onPrint(review)}
                            className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium p-1.5 hover:bg-slate-100 rounded"
                            title="Imprimer"
                          >
                            <Printer size={16} />
                          </button>
                      )}

                      <button 
                        onClick={() => onOpenManager(review)}
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-900 font-medium p-1.5 hover:bg-indigo-50 rounded"
                        title="Espace Manager"
                      >
                        <Pencil size={16} />
                        <span className="hidden xl:inline text-xs">Manager</span>
                      </button>

                      <button 
                        onClick={() => onOpenInterview(review)}
                        className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-900 font-medium p-1.5 hover:bg-purple-50 rounded"
                        title="Passer en mode entretien"
                      >
                        <MessageSquare size={16} />
                        <span className="hidden xl:inline text-xs">Entretien</span>
                      </button>

                      <div className="w-px h-4 bg-slate-200 mx-1"></div>

                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteReview(review.id);
                        }}
                        className="text-red-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded"
                        title="Supprimer l'entretien"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && !isLoading && (
                 <tr>
                 <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                   Aucun entretien planifié. Cliquez sur "Nouvel Entretien" pour commencer.
                 </td>
               </tr>
              )}
               {reviews.length === 0 && isLoading && (
                 <tr>
                 <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                   Chargement des données depuis Google Sheets...
                 </td>
               </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;