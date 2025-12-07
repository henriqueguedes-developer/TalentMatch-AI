
import React, { useState } from 'react';
import { UserRole } from './types';
import RecruiterDashboard from './views/RecruiterDashboard';
import CandidatePortal from './views/CandidatePortal';
import ChatBot from './components/ChatBot';
import { Briefcase, UserCircle } from 'lucide-react';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.RECRUITER);

  return (
    <div className="min-h-screen flex flex-col bg-geek-gray font-sans text-geek-dark">
      {/* Header / Nav - GeekHunter Style: Clean white, shadow */}
      <header className="bg-white shadow-soft sticky top-0 z-40 h-[72px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-geek-dark p-2 rounded-lg text-white">
               <Briefcase className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-geek-dark">
              TalentMatch <span className="text-geek-blue">AI</span>
            </h1>
          </div>

          <div className="flex items-center bg-geek-gray p-1.5 rounded-xl gap-1">
            <button
              onClick={() => setRole(UserRole.RECRUITER)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                role === UserRole.RECRUITER 
                ? 'bg-white text-geek-blue shadow-sm' 
                : 'text-geek-text hover:text-geek-dark hover:bg-gray-200/50'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              For Recruiters
            </button>
            <button
              onClick={() => setRole(UserRole.CANDIDATE)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                role === UserRole.CANDIDATE 
                ? 'bg-white text-geek-blue shadow-sm' 
                : 'text-geek-text hover:text-geek-dark hover:bg-gray-200/50'
              }`}
            >
              <UserCircle className="w-4 h-4" />
              For Talents
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {role === UserRole.RECRUITER ? (
          <RecruiterDashboard />
        ) : (
          <CandidatePortal />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-geek-border py-8 mt-auto">
         <div className="max-w-7xl mx-auto px-4 text-center text-sm text-geek-text">
           <p>© 2024 TalentMatch AI.</p>
         </div>
      </footer>

      <ChatBot />
    </div>
  );
};

export default App;