'use client';

import { useState, useEffect, useRef } from "react";
import { MovieCard, Movie } from "@/app/components/MovieCard";
import { ChevronDown } from 'lucide-react';

type SortOption = 'added' | 'title' | 'year' | 'length' | 'rating';

const sortOptions = [
  { value: 'added', label: 'Added (newest first)' },
  { value: 'title', label: 'Title (alphabetical)' },
  { value: 'year', label: 'Year (newest first)' },
  { value: 'length', label: 'Length (longest first)' },
  { value: 'rating', label: 'Rating (highest first)' }
];

function MovieGrid({ movies, sortBy }: { movies: Movie[], sortBy: SortOption }) {
  // Sort movies based on the selected option
  const sortedMovies = [...movies].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'year':
        return parseInt(b.year) - parseInt(a.year);
      case 'length':
        return parseInt(b.duration) - parseInt(a.duration);
      case 'rating':
        return b.rating - a.rating;
      case 'added':
      default:
        return new Date(b.updatedAd).getTime() - new Date(a.updatedAd).getTime();
    }
  });

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {sortedMovies.map((movie, index) => (
        <MovieCard key={movie._id} movie={movie} index={index} />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('added');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch('/api/movies');
        
        if (!response.ok) {
          throw new Error(`Error fetching movies: ${response.status}`);
        }
        
        const data = await response.json();
        setMovies(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch movies:', err);
        setError('Failed to load movies. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSortChange = (option: SortOption) => {
    setSortBy(option);
    setIsDropdownOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-serif">Film Reviews</h1>
        
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-expanded={isDropdownOpen}
            aria-haspopup="listbox"
            aria-controls="sort-options"
          >
            <span>Sort: {sortOptions.find(option => option.value === sortBy)?.label}</span>
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isDropdownOpen && (
            <div 
              id="sort-options"
              role="listbox"
              className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-10 overflow-hidden transform origin-top-right transition-all animate-in fade-in-50 zoom-in-95 duration-100"
            >
              <div className="py-1">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${sortBy === option.value ? 'bg-slate-100 dark:bg-slate-800 font-medium text-primary' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    onClick={() => handleSortChange(option.value as SortOption)}
                    role="option"
                    aria-selected={sortBy === option.value}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-pulse">Loading reviews...</div>
        </div>
      ) : error ? (
        <div className="text-center p-8 text-red-500">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-md text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : (
        <MovieGrid movies={movies} sortBy={sortBy} />
      )}
    </div>
  );
}