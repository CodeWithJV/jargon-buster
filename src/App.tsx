import React, { useState } from 'react';
import { Brain, Plus, Search, LogOut } from 'lucide-react'; // Added LogOut
// Removed TermProvider import as it's now in main.tsx
import { AddTermForm } from './components/AddTermForm';
import { TermList } from './components/TermList';
import { SearchTerms } from './components/SearchTerms';
import { useAuth } from './context/AuthContext'; // Added useAuth
import Auth from './components/Auth'; // Added Auth component

function App() {
  const { session, signOut } = useAuth(); // Get session and signOut
  const [activeTab, setActiveTab] = useState<'add' | 'search'>('add');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'understood' | 'notUnderstood'>('notUnderstood');

  // Render Auth component if no session
  if (!session) {
    return <Auth />;
  }

  // Render main app if session exists
  return (
    // Removed TermProvider wrapper
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        {/* Make header flex container and space items */}
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Group logo and title */}
          <div className="flex items-center">
            <Brain className="h-8 w-8 text-blue-600" />
            <h1 className="ml-3 text-2xl font-bold text-gray-900">Jargon Buster</h1>
          </div>
          {/* Logout Button */}
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => {
                  setActiveTab('add');
                  setSearchQuery('');
                }}
                className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                  activeTab === 'add'
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Plus className="h-4 w-4" />
                Add New Term
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                  activeTab === 'search'
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Search className="h-4 w-4" />
                Search Terms
              </button>
            </div>
            <div className="p-6">
              {activeTab === 'add' ? (
                <AddTermForm />
              ) : (
                <SearchTerms searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
              )}
            </div>
          </div>
          <div className="flex justify-center mt-4">
            <button
              className={`px-4 py-2 mx-2 ${filter === 'understood' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
              onClick={() => setFilter('understood')}
            >
              Understood
            </button>
            <button
              className={`px-4 py-2 mx-2 ${filter === 'notUnderstood' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
              onClick={() => setFilter('notUnderstood')}
            >
              Not Understood
            </button>
          </div>
          <TermList filter={filter} searchQuery={searchQuery} />
        </main>
      </div>
    // Removed closing TermProvider tag
  );
}

export default App;
