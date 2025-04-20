import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Term, TermContextType } from '../types';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be provided in .env file");
}

// Initialize Supabase client
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

const TermContext = createContext<TermContextType | undefined>(undefined);

export function TermProvider({ children }: { children: React.ReactNode }) {
  const [terms, setTerms] = useState<Term[]>([]);

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      const { data, error } = await supabase
        .from('terms')
        .select('*')
        .order('dateAdded', { ascending: false }); // Order by dateAdded descending

      if (error) throw error;
      // Map Supabase data to frontend Term type if necessary (dates might need parsing)
      setTerms(data || []); 
    } catch (error) {
      console.error('Error fetching terms:', error);
      setTerms([]); // Set to empty array on error
    }
  };

  const addTerm = async (term: string, definition: string = '', initialThoughts: string = '') => {
    // Prepare the object for insertion, omitting fields handled by Supabase (id, dateAdded, created_at)
    const termToInsert = { 
      term, 
      definition, 
      initialThoughts, 
      understood: false 
    };

    try {
      // Omit id and dateAdded as they are handled by Supabase
      const termToInsert = { term, definition, initialThoughts, understood: false };
      const { data, error } = await supabase
        .from('terms')
        .insert([termToInsert])
        .select(); // Select the newly inserted row

      if (error) throw error;

      if (data) {
        // Add the full term returned by Supabase (including id, dateAdded, created_at)
        setTerms(prev => [...prev, data[0]]); 
      }
    } catch (error) {
      console.error('Error adding term:', error);
    }
  };

  const updateTerm = async (id: string, term: string, definition: string, notes?: string, eli5?: string) => {
    try {
      const updates = { term, definition, notes, eli5 };
      const { data, error } = await supabase
        .from('terms')
        .update(updates)
        .eq('id', id)
        .select(); // Select the updated row

      if (error) throw error;

      if (data) {
        setTerms(prev => prev.map(t => 
          t.id === id ? data[0] : t // Replace with the updated term from Supabase
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
      const updates = { 
        understood: newUnderstood,
        dateUnderstood: dateUnderstood 
      };
      const { data, error } = await supabase
        .from('terms')
        .update(updates)
        .eq('id', id)
        .select(); // Select the updated row

      if (error) throw error;

      if (data) {
         setTerms(prev => prev.map(t => 
          t.id === id ? data[0] : t // Replace with the updated term from Supabase
        ));
      }
    } catch (error) {
      console.error('Error toggling understood status:', error);
    }
  };

  const deleteTerm = async (id: string) => {
    try {
      const { error } = await supabase
        .from('terms')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTerms(prev => prev.filter(term => term.id !== id));
    } catch (error) {
      console.error('Error deleting term:', error);
    }
  };

  return (
    <TermContext.Provider value={{ terms, addTerm, updateTerm, toggleUnderstood, deleteTerm }}>
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
