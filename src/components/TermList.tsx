import React, { useState } from 'react';
import { Check, Trash2, X, Search, BookOpen, Pencil } from 'lucide-react';
import { useTerms } from '../context/TermContext';
import { Term } from '../types';

interface TermListProps {
  searchQuery: string;
  filter: 'understood' | 'notUnderstood';
}

export function TermList({ searchQuery, filter }: TermListProps) {
  const { terms, toggleUnderstood, deleteTerm, updateTerm } = useTerms();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTerm, setEditTerm] = useState('');
  const [editDefinition, setEditDefinition] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editEli5, setEditEli5] = useState('');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSearchLinks = (term: string) => {
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(term)}`;
    const wikipediaUrl = `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(term)}`;
    return { googleUrl, wikipediaUrl };
  };

  const startEditing = (term: Term) => {
    setEditingId(term.id);
    setEditTerm(term.term);
    setEditDefinition(term.definition);
    setEditNotes(term.notes || '');
    setEditEli5(term.eli5 || '');
  };

  const saveEdit = () => {
    if (editingId && editTerm.trim()) {
      updateTerm(editingId, editTerm.trim(), editDefinition.trim(), editNotes.trim(), editEli5.trim());
      setEditingId(null);
    }
  };

  // Filter terms based on both status filter and search query
  const filteredTerms = terms.filter(term => {
    const matchesFilter = filter === 'understood' ? term.understood : !term.understood;
    const lowerQuery = searchQuery.trim().toLowerCase();
    const matchesSearch = lowerQuery === '' || term.term.toLowerCase().includes(lowerQuery);
    return matchesFilter && matchesSearch;
  });


  return (
    <div className="space-y-4">
      {filteredTerms.map((term) => {
        const { googleUrl, wikipediaUrl } = getSearchLinks(term.term);
        const isEditing = editingId === term.id;

        return (
          <div
            key={term.id}
            className={`bg-white rounded-lg shadow-md p-6 transition-all ${
              term.understood ? 'border-l-4 border-green-500' : 'border-l-4 border-yellow-500'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editTerm}
                      onChange={(e) => setEditTerm(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Term"
                    />
                    <textarea
                      value={editDefinition}
                      onChange={(e) => setEditDefinition(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                      rows={2}
                      placeholder="Definition (optional)"
                    />
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                      rows={2}
                      placeholder="Additional notes"
                    />
                    <textarea
                      value={editEli5}
                      onChange={(e) => setEditEli5(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                      rows={2}
                      placeholder="Explain it like I'm five"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">{term.term}</h3>
                      <div className="flex gap-2">
                        <a
                          href={googleUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
                          title="Search on Google"
                        >
                          <Search className="h-4 w-4" />
                        </a>
                        <a
                          href={wikipediaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
                          title="Search on Wikipedia"
                        >
                          <BookOpen className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                    {term.definition && (
                      <p className="mt-1 text-sm text-gray-600">{term.definition}</p>
                    )}
                    {term.initialThoughts && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-500">Initial Thoughts:</p>
                        <p className="text-sm text-gray-600">{term.initialThoughts}</p>
                      </div>
                    )}
                    {term.notes && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-500">Notes:</p>
                        <p className="text-sm text-gray-600">{term.notes}</p>
                      </div>
                    )}
                    {term.eli5 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-500">Explain Like I'm Five:</p>
                        <p className="text-sm text-gray-600">{term.eli5}</p>
                      </div>
                    )}
                    <div className="mt-2 text-xs text-gray-500">
                      Added: {formatDate(term.dateAdded)}
                      {term.dateUnderstood && (
                        <span className="ml-4">Understood: {formatDate(term.dateUnderstood)}</span>
                      )}
                    </div>
                  </>
                )}
              </div>
              {!isEditing && (
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => startEditing(term)}
                    className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                    title="Edit term"
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  {!term.understood && (
                    <button
                      onClick={() => toggleUnderstood(term.id)}
                      className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200"
                      title="Mark as understood"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                  )}
                  {term.understood && (
                    <button
                      onClick={() => toggleUnderstood(term.id)}
                      className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                      title="Mark as not understood"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteTerm(term.id)}
                    className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                    title="Delete term"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
      {filteredTerms.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchQuery
            ? `No terms found matching "${searchQuery}"`
            : 'No terms added yet. Start by adding some terms you want to learn!'}
        </div>
      )}
    </div>
  );
}
