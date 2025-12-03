import React, { useState } from 'react';
import { ReviewData, ReviewStatus } from '../types';
import { QUESTIONS } from '../constants';
import { generateSynthesis } from '../services/geminiService';
import { Sparkles, Save, ArrowLeft, Printer, CheckCheck } from 'lucide-react';

interface InterviewModeProps {
  review: ReviewData;
  onSave: (updatedReview: ReviewData) => void;
  onBack: () => void;
  onPrint: () => void;
}

const InterviewMode: React.FC<InterviewModeProps> = ({ review, onSave, onBack, onPrint }) => {
  const [synthesis, setSynthesis] = useState(review.finalSynthesis);
  const [objectives, setObjectives] = useState(review.objectivesNextYear);
  const [training, setTraining] = useState(review.trainingNeeds);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    const result = await generateSynthesis(review);
    setSynthesis(result);
    setIsGenerating(false);
  };

  const handleComplete = () => {
    onSave({
      ...review,
      finalSynthesis: synthesis,
      objectivesNextYear: objectives,
      trainingNeeds: training,
      status: ReviewStatus.COMPLETED
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Mode Entretien</h1>
            <p className="text-sm text-gray-500">{review.employeeName} - {review.date}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
             onClick={onPrint}
             className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors"
          >
            <Printer size={18} />
            Imprimer
          </button>
          <button 
             onClick={handleComplete}
             className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            <CheckCheck size={18} />
            Terminer & Signer
          </button>
        </div>
      </header>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Questions Comparison Grid */}
          <div className="space-y-6">
            {QUESTIONS.map((q) => (
              <div key={q.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800">{q.label}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                  {/* Employee Side */}
                  <div className="p-5">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2 block">Salarié</span>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {review.employeeAnswers[q.id] || <span className="text-gray-400 italic">Non renseigné</span>}
                    </p>
                  </div>
                  {/* Manager Side */}
                  <div className="p-5 bg-slate-50/50">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2 block">Directeur</span>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {review.managerAnswers[q.id] || <span className="text-gray-400 italic">Non renseigné</span>}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Synthesis Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
            
            {/* AI Assistant & Final Synthesis */}
            <div className="bg-white rounded-xl shadow-md border border-indigo-100 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center text-white">
                <h3 className="font-bold flex items-center gap-2">
                  <Sparkles size={18} /> Synthèse de l'entretien
                </h3>
                <button
                  onClick={handleGenerateAI}
                  disabled={isGenerating}
                  className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 backdrop-blur-sm"
                >
                  {isGenerating ? 'Génération...' : 'Générer via IA'}
                </button>
              </div>
              <div className="p-6">
                 <p className="text-sm text-gray-500 mb-2">
                   Ce texte apparaîtra sur le compte-rendu final. Utilisez l'IA pour gagner du temps, puis ajustez si nécessaire.
                 </p>
                <textarea
                  value={synthesis}
                  onChange={(e) => setSynthesis(e.target.value)}
                  className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none text-gray-700 leading-relaxed"
                  placeholder="Rédigez ici la synthèse de l'entretien..."
                />
              </div>
            </div>

            {/* Future Goals */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-800 mb-3">Objectifs pour l'année à venir</h3>
                <textarea
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
                  placeholder="Ex: Formation incendie, prise de responsabilité sur..."
                />
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-800 mb-3">Besoins de formation / Souhaits</h3>
                <textarea
                  value={training}
                  onChange={(e) => setTraining(e.target.value)}
                  className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none"
                  placeholder="Ex: Demande de formation management..."
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewMode;