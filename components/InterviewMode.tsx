
import React, { useState } from 'react';
import { ReviewData, ReviewStatus } from '../types';
import { QUESTIONS } from '../constants';
import { generateSynthesis } from '../services/geminiService';
import { Sparkles, ArrowLeft, Printer, CheckCheck, Loader2 } from 'lucide-react';

interface InterviewModeProps {
  review: ReviewData;
  onSave: (updatedReview: ReviewData) => Promise<void>;
  onBack: () => void;
  onPrint: () => void;
}

const InterviewMode: React.FC<InterviewModeProps> = ({ review, onSave, onBack, onPrint }) => {
  const [synthesis, setSynthesis] = useState(review.finalSynthesis);
  const [objectives, setObjectives] = useState(review.objectivesNextYear);
  const [training, setTraining] = useState(review.trainingNeeds);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const result = await generateSynthesis(review);
      // We append or replace based on whether it's empty to allow user edits to persist if they want, 
      // but here we simply assume if they click the button they want the AI draft.
      setSynthesis(result.synthesis);
      if (result.objectives) setObjectives(result.objectives);
      if (result.training) setTraining(result.training);
    } catch (e) {
      console.error(e);
      setSynthesis("Erreur lors de la génération.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      await onSave({
        ...review,
        finalSynthesis: synthesis,
        objectivesNextYear: objectives,
        trainingNeeds: training,
        status: ReviewStatus.COMPLETED,
        validatedAt: new Date().toISOString().split('T')[0] // Save today's date as validation date
      });
    } catch (e) {
      console.error(e);
      alert("Erreur lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
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
            <p className="text-sm text-gray-500">{review.employeeName} - {review.date.split('-').reverse().join('/')}</p>
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
             disabled={isSaving}
             className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-sm disabled:bg-green-400 disabled:cursor-wait"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <CheckCheck size={18} />}
            {isSaving ? "Enregistrement..." : "Terminer & Signer"}
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
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2 block">Manager</span>
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
            <div className="bg-white rounded-xl shadow-md border border-indigo-100 overflow-hidden lg:col-span-2">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center text-white">
                <div>
                    <h3 className="font-bold flex items-center gap-2 text-lg">
                    <Sparkles size={20} /> Assistant Intelligent
                    </h3>
                    <p className="text-indigo-100 text-sm mt-1">Analyse les réponses et propose un brouillon complet (Synthèse, Objectifs, Formation)</p>
                </div>
                <button
                  onClick={handleGenerateAI}
                  disabled={isGenerating}
                  className="bg-white text-indigo-600 hover:bg-indigo-50 px-5 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isGenerating ? <Sparkles size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  {isGenerating ? 'Analyse en cours...' : 'Générer la synthèse complète'}
                </button>
              </div>
            </div>

            {/* Synthesis Text */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center justify-between">
                    Synthèse de l'entretien
                    <span className="text-xs text-gray-400 font-normal">Sera sur le PDF final</span>
                </h3>
                <textarea
                  value={synthesis}
                  onChange={(e) => setSynthesis(e.target.value)}
                  className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none text-gray-700 leading-relaxed"
                  placeholder="Cliquez sur 'Générer la synthèse complète' pour que l'IA rédige ce résumé..."
                />
            </div>

            {/* Future Goals & Training */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-[160px] flex flex-col">
                <h3 className="font-semibold text-gray-800 mb-2">Objectifs pour l'année à venir</h3>
                <textarea
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  className="w-full flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
                  placeholder="L'IA peut vous suggérer des objectifs..."
                />
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-[160px] flex flex-col">
                <h3 className="font-semibold text-gray-800 mb-2">Besoins de formation / Souhaits</h3>
                <textarea
                  value={training}
                  onChange={(e) => setTraining(e.target.value)}
                  className="w-full flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none"
                  placeholder="L'IA peut suggérer des formations..."
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
