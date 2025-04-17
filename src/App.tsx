import { useState, useEffect } from 'react';
import { Brain, Plus, Search } from 'lucide-react';
import { supabase } from './supabaseClient';
import { Auth } from './components/Auth';
import { TermProvider } from './context/TermContext';
import { AddTermForm } from './components/AddTermForm';
import { TermList } from './components/TermList';
import { SearchTerms } from './components/SearchTerms';
import type { User } from '@supabase/supabase-js';

function App() {
  const [activeTab, setActiveTab] = useState<'add' | 'search'>('add');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'understood' | 'notUnderstood'>('notUnderstood');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if a user is already logged in when app loads
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // Listen for login/logout changes and update state
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    // Cleanup the listener when component unmounts
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // If no user is logged in, show the login/signup screen
  if (!user) {
    return <Auth />;
  }

  // If user is logged in, show the main app
  return (
    <TermProvider>
      <div className="min-h-screen bg-gray-100">
        {/* App header with title and log out button */}
        <header className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-blue-600" />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">Jargon Buster</h1>
            </div>
            {user && (
              <div className="text-sm text-gray-500">
                👋 {user.email ?? 'User'}
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="ml-4 text-red-500 underline"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main content: tabs, filters, and term list */}
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

          {/* Filter buttons for understood/not understood */}
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
    </TermProvider>
  );
}

export default App;
