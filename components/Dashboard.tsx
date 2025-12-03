import React from 'react';
import { ReviewData, ReviewStatus } from '../types';
import { Users, CheckCircle, Clock, Plus, Link as LinkIcon, ExternalLink } from 'lucide-react';

interface DashboardProps {
  reviews: ReviewData[];
  onSelectReview: (review: ReviewData) => void;
  onCreateReview: () => void;
  onCopyLink: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ reviews, onSelectReview, onCreateReview, onCopyLink }) => {
  
  const getStatusColor = (status: ReviewStatus) => {
    switch (status) {
      case ReviewStatus.NOT_STARTED: return 'bg-gray-100 text-gray-600';
      case ReviewStatus.EMPLOYEE_FILLED: return 'bg-blue-100 text-blue-700';
      case ReviewStatus.MANAGER_PREPARED: return 'bg-purple-100 text-purple-700';
      case ReviewStatus.COMPLETED: return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Tableau de Bord</h1>
          <p className="text-slate-500 mt-1">Gestion des entretiens annuels - Résidence Senior</p>
        </div>
        <button 
          onClick={onCreateReview}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <Plus size={20} />
          Nouvel Entretien
        </button>
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

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Liste des entretiens</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-800 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Salarié</th>
                <th className="px-6 py-4">Poste</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-center">Lien Salarié</th>
                <th className="px-6 py-4 text-right">Actions</th>
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
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCopyLink(review.id);
                      }}
                      title="Copier le lien pour le salarié"
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                    >
                      <LinkIcon size={14} />
                      <span className="text-xs font-medium">Copier lien</span>
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onSelectReview(review)}
                      className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-900 font-medium hover:underline"
                    >
                      Ouvrir <ExternalLink size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                 <tr>
                 <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                   Aucun entretien planifié. Cliquez sur "Nouvel Entretien" pour commencer.
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