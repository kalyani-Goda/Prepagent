import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Wand2, Loader2, ArrowRight } from 'lucide-react';
import { generateStudyPlan } from '../services/geminiService';
import { KnowledgeSnippet, StudyPlan } from '../types';

interface StudyPlannerProps {
  knowledgeBase: KnowledgeSnippet[];
  currentPlan: StudyPlan | null;
  setCurrentPlan: (plan: StudyPlan) => void;
  onStartInterview: () => void;
}

const StudyPlanner: React.FC<StudyPlannerProps> = ({ 
  knowledgeBase, 
  currentPlan, 
  setCurrentPlan,
  onStartInterview 
}) => {
  const [role, setRole] = useState(currentPlan?.role || '');
  const [jd, setJd] = useState(currentPlan?.jobDescription || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!role || !jd) {
      setError("Please provide both a Target Role and a Job Description.");
      return;
    }
    if (knowledgeBase.length === 0) {
      setError("Please add at least one item to your Knowledge Base first.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const markdown = await generateStudyPlan(role, jd, knowledgeBase);
      setCurrentPlan({
        role,
        jobDescription: jd,
        generatedPlan: markdown
      });
    } catch (err) {
      setError("Failed to generate plan. Please check your API key and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (currentPlan && !loading) {
    return (
      <div className="flex-1 overflow-y-auto bg-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Study Plan: {currentPlan.role}</h2>
              <p className="text-slate-500 text-sm mt-1">Based on your notes and the job description</p>
            </div>
            <div className="flex gap-3">
                <button 
                  onClick={() => setCurrentPlan(null as any)} // Simple reset for demo
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 text-sm font-medium"
                >
                  Edit Inputs
                </button>
                <button
                  onClick={onStartInterview}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-sm"
                >
                  Start Mock Interview <ArrowRight size={16} />
                </button>
            </div>
          </div>
          
          <div className="prose prose-slate prose-blue max-w-none">
            <ReactMarkdown>{currentPlan.generatedPlan}</ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 overflow-y-auto">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
            <Wand2 size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Generate Your Custom Curriculum</h2>
          <p className="text-slate-500 mt-2">
            The AI will analyze your Knowledge Base against the Job Description to create a targeted study plan.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Target Role</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="e.g., Senior Frontend Engineer"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Job Description (JD)</label>
            <textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              className="w-full h-40 px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-sm"
              placeholder="Paste the full job description here..."
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold text-lg transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" /> Analyzing Knowledge Base...
              </>
            ) : (
              <>
                <Wand2 size={20} /> Generate Study Plan
              </>
            )}
          </button>
          
          <div className="text-center text-xs text-slate-400">
            Powered by Gemini 3.0 Pro (Thinking Mode)
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyPlanner;