import React, { useState } from 'react';
import Layout from './components/Layout';
import KnowledgeBase from './components/KnowledgeBase';
import StudyPlanner from './components/StudyPlanner';
import ChatInterface from './components/ChatInterface';
import { AgentMode, KnowledgeSnippet, StudyPlan } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<AgentMode>(AgentMode.MANAGE_KB);
  
  // Local state for demo purposes. 
  // In a real app, you might use Context API or a dedicated state manager.
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeSnippet[]>([]);
  const [currentPlan, setCurrentPlan] = useState<StudyPlan | null>(null);

  const addSnippet = (snippet: KnowledgeSnippet) => {
    setKnowledgeBase(prev => [snippet, ...prev]);
  };

  const removeSnippet = (id: string) => {
    setKnowledgeBase(prev => prev.filter(s => s.id !== id));
  };

  const handleStartInterview = () => {
    setMode(AgentMode.MOCK_INTERVIEW);
  };

  const renderContent = () => {
    switch (mode) {
      case AgentMode.MANAGE_KB:
        return (
          <KnowledgeBase 
            snippets={knowledgeBase} 
            addSnippet={addSnippet}
            removeSnippet={removeSnippet}
          />
        );
      case AgentMode.STUDY_PLANNER:
        return (
          <StudyPlanner 
            knowledgeBase={knowledgeBase}
            currentPlan={currentPlan}
            setCurrentPlan={setCurrentPlan}
            onStartInterview={handleStartInterview}
          />
        );
      case AgentMode.MOCK_INTERVIEW:
        return (
          <ChatInterface 
            knowledgeBase={knowledgeBase}
            currentPlan={currentPlan}
          />
        );
      default:
        return <div>Select a mode</div>;
    }
  };

  return (
    <Layout currentMode={mode} setMode={setMode}>
      {renderContent()}
    </Layout>
  );
};

export default App;