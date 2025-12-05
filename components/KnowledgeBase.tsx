import React, { useState } from 'react';
import { Plus, Trash2, FileText, Upload } from 'lucide-react';
import { KnowledgeSnippet } from '../types';

interface KnowledgeBaseProps {
  snippets: KnowledgeSnippet[];
  addSnippet: (snippet: KnowledgeSnippet) => void;
  removeSnippet: (id: string) => void;
}

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ snippets, addSnippet, removeSnippet }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    addSnippet({
      id: crypto.randomUUID(),
      title,
      content,
      dateAdded: Date.now(),
    });

    setTitle('');
    setContent('');
    setIsAdding(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Knowledge Base</h2>
            <p className="text-slate-500 mt-2">
              Upload your raw notes, articles, and study materials here. The agent uses this to personalize your prep.
            </p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            {isAdding ? 'Cancel' : (
              <>
                <Plus size={18} /> Add Material
              </>
            )}
          </button>
        </div>

        {/* Add Form */}
        {isAdding && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 animate-in fade-in slide-in-from-top-4 duration-200">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Topic / Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="e.g., React Hooks Notes, System Design Chapter 1"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-48 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm"
                  placeholder="Paste your notes, article text, or summary here..."
                />
              </div>
              <div className="flex justify-end gap-3">
                 <button
                  type="button" // Only for visual demonstration of file upload logic concept
                  className="mr-auto text-slate-400 text-sm flex items-center gap-1 hover:text-slate-600"
                  onClick={() => alert("For this demo, please copy-paste text from your files.")}
                >
                  <Upload size={14} /> Upload File (Coming Soon)
                </button>
                <button
                  type="submit"
                  disabled={!title || !content}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Save to Knowledge Base
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List of Snippets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {snippets.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
              <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="text-slate-400" size={32} />
              </div>
              <h3 className="text-lg font-medium text-slate-900">No materials yet</h3>
              <p className="text-slate-500 max-w-sm mx-auto mt-1">
                Start by adding notes to help the AI understand what you're studying.
              </p>
            </div>
          ) : (
            snippets.map((snippet) => (
              <div key={snippet.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <FileText size={16} />
                    </div>
                    <h3 className="font-semibold text-slate-800 truncate max-w-[200px]">{snippet.title}</h3>
                  </div>
                  <button
                    onClick={() => removeSnippet(snippet.id)}
                    className="text-slate-300 hover:text-red-500 p-1 rounded-md transition-colors"
                    title="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="text-slate-600 text-sm line-clamp-4 h-20">
                  {snippet.content}
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400">
                  Added {new Date(snippet.dateAdded).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;