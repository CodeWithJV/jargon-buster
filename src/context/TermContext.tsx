import React, { createContext, useContext, useState, useEffect } from 'react';
import { Term, TermContextType } from '../types';

const API_URL = '/api';

const TermContext = createContext<TermContextType | undefined>(undefined);

export function TermProvider({ children }: { children: React.ReactNode }) {
  const [terms, setTerms] = useState<Term[]>([]);

  const fetchTerms = async () => {
    try {
      const response = await fetch(`${API_URL}/terms`);
      const data = await response.json() as Term[];
     // 🔁 Force a *new* array with new references for React to detect changes
       setTerms(data.map(term => ({ ...term })));
    } catch (error) {
      console.error('Error fetching terms:', error);
    }
  };

  useEffect(() => {
    fetchTerms();
  }, []);

  const addTerm = async (term: string, definition: string = '', initialThoughts: string = '') => {
    const newTerm = {
      id: crypto.randomUUID(),
      term,
      definition,
      initialThoughts,
      understood: false,
      dateAdded: new Date().toISOString()
    };

    try {
      const response = await fetch(`${API_URL}/terms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTerm)
      });

      if (response.ok) {
        setTerms(prev => [...prev, newTerm]);
      }
    } catch (error) {
      console.error('Error adding term:', error);
    }
  };

  const updateTerm = async (id: string, term: string, definition: string, notes?: string, eli5?: string) => {
    try {
      const response = await fetch(`${API_URL}/terms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term, definition, notes, eli5 })
      });

      if (response.ok) {
        setTerms(prev => prev.map(t => 
          t.id === id ? { ...t, term, definition, notes, eli5 } : t
        ));
      }
    } catch (error) {
      console.error('Error updating term:', error);
    }
  };

  const toggleUnderstood = async (id: string) => {
    const term = terms.find(t => t.id === id);
    if (!term) return;

    const newUnderstood = !term.understood;
    const dateUnderstood = newUnderstood ? new Date().toISOString() : null;

    try {
      const response = await fetch(`${API_URL}/terms/${id}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          understood: newUnderstood,
          dateUnderstood
        })
      });

      if (response.ok) {
        setTerms(prev => prev.map(term => {
          if (term.id === id) {
            return {
              ...term,
              understood: newUnderstood,
              dateUnderstood: dateUnderstood || undefined
            };
          }
          return term;
        }));
      }
    } catch (error) {
      console.error('Error toggling understood status:', error);
    }
  };

  const deleteTerm = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/terms/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setTerms(prev => prev.filter(term => term.id !== id));
      }
    } catch (error) {
      console.error('Error deleting term:', error);
    }
  };

  return (
    <TermContext.Provider value={{ terms, addTerm, updateTerm, toggleUnderstood, deleteTerm, fetchTerms }}>
      {children}
    </TermContext.Provider>
  );
}

export function useTerms() {
  const context = useContext(TermContext);
  if (context === undefined) {
    throw new Error('useTerms must be used within a TermProvider');
  }
  return context;
}