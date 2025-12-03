import React from 'react';
import { ReviewData } from '../types';
import { QUESTIONS } from '../constants';
import { ArrowLeft } from 'lucide-react';

interface PrintViewProps {
  review: ReviewData;
  onBack: () => void;
}

const PrintView: React.FC<PrintViewProps> = ({ review, onBack }) => {
  React.useEffect(() => {
    setTimeout(() => {
      window.print();
    }, 500);
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <div className="no-print p-4 bg-gray-800 text-white flex justify-between items-center sticky top-0 z-50">
        <button onClick={onBack} className="flex items-center gap-2 hover:underline">
          <ArrowLeft size={18} /> Retour
        </button>
        <p>Impression en cours...</p>
      </div>

      <div className="max-w-[210mm] mx-auto p-12 print:p-0 print:w-full">
        {/* Header */}
        <div className="border-b-2 border-gray-800 pb-6 mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-tight">Compte Rendu</h1>
            <h2 className="text-xl text-gray-600 mt-1">Entretien Annuel d'Évaluation</h2>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">{review.employeeName}</p>
            <p className="text-gray-600">{review.employeeRole}</p>
            <p className="text-sm text-gray-500 mt-2">Date: {review.date}</p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {QUESTIONS.map((q) => (
            <div key={q.id} className="break-inside-avoid">
              <h3 className="font-bold text-gray-800 border-l-4 border-gray-300 pl-3 mb-3 text-lg">
                {q.label}
              </h3>
              <div className="grid grid-cols-2 gap-6 mb-4">
                <div className="bg-gray-50 p-4 rounded text-sm">
                   <p className="font-semibold text-gray-500 text-xs uppercase mb-1">Salarié</p>
                   <p className="whitespace-pre-wrap">{review.employeeAnswers[q.id] || '-'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded text-sm">
                   <p className="font-semibold text-gray-500 text-xs uppercase mb-1">Directeur</p>
                   <p className="whitespace-pre-wrap">{review.managerAnswers[q.id] || '-'}</p>
                </div>
              </div>
            </div>
          ))}

          <div className="break-inside-avoid mt-8 border-t border-gray-200 pt-8">
            <h3 className="text-xl font-bold text-indigo-900 mb-4">Synthèse de l'entretien</h3>
            <div className="bg-indigo-50/50 p-6 rounded-lg border border-indigo-100 text-gray-800 leading-relaxed whitespace-pre-wrap">
              {review.finalSynthesis || "Aucune synthèse enregistrée."}
            </div>
          </div>

          <div className="break-inside-avoid grid grid-cols-2 gap-8 mt-6">
            <div className="border border-gray-200 rounded p-4">
              <h4 className="font-bold text-gray-700 mb-2">Objectifs N+1</h4>
              <p className="whitespace-pre-wrap text-sm">{review.objectivesNextYear || '-'}</p>
            </div>
            <div className="border border-gray-200 rounded p-4">
              <h4 className="font-bold text-gray-700 mb-2">Formation / Souhaits</h4>
              <p className="whitespace-pre-wrap text-sm">{review.trainingNeeds || '-'}</p>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-20 mt-16 break-inside-avoid">
          <div className="border-t border-gray-400 pt-4">
            <p className="font-bold mb-8">Signature du Salarié</p>
            <p className="text-xs text-gray-500">Précédé de la mention "Lu et approuvé"</p>
          </div>
          <div className="border-t border-gray-400 pt-4">
            <p className="font-bold mb-8">Signature du Directeur</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintView;