export interface Term {
  id: string;
  term: string;
  definition: string;
  understood: boolean;
  dateAdded: string;
  dateUnderstood?: string;
  initialThoughts?: string;
  notes?: string;
  eli5?: string;
}

export type TermContextType = {
  terms: Term[];
  loading: boolean; // Added loading state
  addTerm: (term: string, definition?: string, initialThoughts?: string) => void;
  updateTerm: (id: string, term: string, definition: string, notes?: string, eli5?: string) => void;
  toggleUnderstood: (id: string) => void;
  deleteTerm: (id: string) => void;
};
