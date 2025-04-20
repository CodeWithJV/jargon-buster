import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// Removed Supabase client creation, will use the shared one
import { Term, TermContextType } from '../types'; // Assuming types.ts defines these
import { supabase } from '../lib/supabaseClient'; // Import shared client
import { useAuth } from './AuthContext'; // Import useAuth hook

// Removed Supabase client initialization here

const TermContext = createContext<TermContextType | undefined>(undefined);

export function TermProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth(); // Get the authenticated user
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(false); // Add loading state

  // Use useCallback to memoize fetchTerms
  const fetchTerms = useCallback(async () => {
    if (!user) {
      setTerms([]); // Clear terms if no user
      return;
    }
    setLoading(true);
    try {
      // Fetch only terms belonging to the current user
      const { data, error } = await supabase
        .from('terms')
        .select('*')
        .eq('user_id', user.id) // Filter by user_id
        .order('created_at', { ascending: false }); // Order by creation time

      if (error) throw error;
      setTerms(data || []);
    } catch (error) {
      console.error('Error fetching terms:', error);
      setTerms([]);
    } finally {
      setLoading(false);
    }
  }, [user]); // Depend on user object

  // Fetch terms when the component mounts or the user changes
  useEffect(() => {
    fetchTerms();
  }, [fetchTerms]); // Depend on the memoized fetchTerms

  const addTerm = async (term: string, definition: string = '', initialThoughts: string = '') => {
    if (!user) {
      console.error("Cannot add term: No user logged in.");
      return; // Don't add if no user
    }

    // Include user_id in the object to insert
    const termToInsert = {
      term,
      definition,
      initialThoughts,
      understood: false,
      user_id: user.id // Add user_id
    };

    try {
      setLoading(true); // Indicate loading
      const { data, error } = await supabase
        .from('terms')
        .insert([termToInsert])
        .select() // Select the newly inserted row
        .single(); // Expect a single row back

      if (error) throw error;

      if (data) {
        // Prepend the new term to the list for immediate feedback
        setTerms(prev => [data, ...prev]);
      }
    } catch (error) {
      console.error('Error adding term:', error);
    } finally {
      setLoading(false);
    }
  };

  // UpdateTerm, ToggleUnderstood, DeleteTerm rely on RLS policies defined in the migration
  // No user_id check needed here as Supabase handles it via RLS

  const updateTerm = async (id: string, term: string, definition: string, notes?: string, eli5?: string) => {
    // No user check needed here due to RLS
    try {
      setLoading(true);
      const updates = { term, definition, notes, eli5 };
      const { data, error } = await supabase
        .from('terms')
        .update(updates)
        .eq('id', id)
        .select()
        .single(); // Expect single row

      if (error) throw error;

      if (data) {
        setTerms(prev => prev.map(t =>
          t.id === id ? data : t // Replace with the updated term
        ));
      }
    } catch (error) {
      console.error('Error updating term:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUnderstood = async (id: string) => {
    // No user check needed here due to RLS
    const term = terms.find(t => t.id === id);
    if (!term) return;

    const newUnderstood = !term.understood;
    const dateUnderstood = newUnderstood ? new Date().toISOString() : null;

    try {
      setLoading(true);
      const updates = {
        understood: newUnderstood,
        dateUnderstood: dateUnderstood
      };
      const { data, error } = await supabase
        .from('terms')
        .update(updates)
        .eq('id', id)
        .select()
        .single(); // Expect single row

      if (error) throw error;

      if (data) {
         setTerms(prev => prev.map(t =>
          t.id === id ? data : t // Replace with the updated term
        ));
      }
    } catch (error) {
      console.error('Error toggling understood status:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTerm = async (id: string) => {
    // No user check needed here due to RLS
    try {
      setLoading(true);
      const { error } = await supabase
        .from('terms')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTerms(prev => prev.filter(term => term.id !== id));
    } catch (error) {
      console.error('Error deleting term:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Include loading state in the context value
    <TermContext.Provider value={{ terms, loading, addTerm, updateTerm, toggleUnderstood, deleteTerm }}>
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
