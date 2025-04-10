import React from 'react';
import { Search } from 'lucide-react';

interface SearchTermsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function SearchTerms({ searchQuery, setSearchQuery }: SearchTermsProps) {
  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10"
          placeholder="Search your terms..."
        />
        <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
      </div>
    </div>
  );
}
