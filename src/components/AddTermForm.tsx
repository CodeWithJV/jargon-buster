import React, { useState, useRef } from 'react';
import { PlusCircle } from 'lucide-react';
import { useTerms } from '../context/TermContext';

export function AddTermForm() {
  const [term, setTerm] = useState('');
  const [initialThoughts, setInitialThoughts] = useState('');
  const { addTerm } = useTerms();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (term.trim()) {
      addTerm(term.trim(), '', initialThoughts.trim());
      setTerm('');
      setInitialThoughts('');
      inputRef.current?.focus();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="term" className="block text-sm font-medium text-gray-700 mb-1">
          Term
        </label>
        <input
          id="term"
          ref={inputRef}
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter a new term"
        />
      </div>
      <div>
        <label htmlFor="initialThoughts" className="block text-sm font-medium text-gray-700 mb-1">
          Initial Thoughts (optional)
        </label>
        <textarea
          id="initialThoughts"
          value={initialThoughts}
          onChange={(e) => setInitialThoughts(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="What are your initial thoughts about this term?"
          rows={3}
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
      >
        <PlusCircle className="h-5 w-5" />
        Add Term
      </button>
    </form>
  );
}
