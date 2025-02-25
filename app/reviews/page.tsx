'use client';

import { useState, useEffect, useRef } from "react";
import { MovieCard, Movie } from "@/app/components/MovieCard";
import { ChevronDown } from 'lucide-react';
import useSWR from 'swr';

type SortOption = 'added' | 'title' | 'year' | 'length' | 'rating';

const sortOptions = [
  { label: 'Recently Added', value: 'added' },
  { label: 'Title (A-Z)', value: 'title' },
  { label: 'Year (New to Old)', value: 'year' },
  { label: 'Length (Short to Long)', value: 'length' },
  { label: 'Rating (High to Low)', value: 'rating' }
];

// Fetch movies with SWR
const fetcher = (url: string) => 
  fetch(url, {
    // Add cache control headers for the browser
    cache: 'no-store',
    headers: {
      'pragma': 'no-cache',
      'cache-control': 'no-cache',
    }
  }).then(res => {
    if (!res.ok) throw new Error('Failed to fetch movies');
    return res.json();
  });

function MovieGrid({ movies, sortBy }: { movies: Movie[], sortBy: SortOption }) {
  const sortedMovies = [...movies].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'year':
        return parseInt(b.year) - parseInt(a.year);
      case 'length':
        const getDuration = (movie: Movie) => {
          if (!movie.duration) return 0;
          const match = movie.duration.match(/^(\d+)m$/);
          return match ? parseInt(match[1]) : 0;
        };
        return getDuration(a) - getDuration(b);
      case 'rating':
        return b.rating - a.rating;
      case 'added':
      default:
        // Assume updatedAd is a date string
        return new Date(b.updatedAd || 0).getTime() - new Date(a.updatedAd || 0).getTime();
    }
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {sortedMovies.map((movie, index) => (
        <MovieCard key={movie._id} movie={movie} index={index} />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [sortBy, setSortBy] = useState<SortOption>('added');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Use SWR for data fetching with revalidation
  const { data: movies, error, isLoading } = useSWR<Movie[]>(
    '/api/movies', 
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 30000, // Refresh every 30 seconds
      dedupingInterval: 5000 // Only dedupe requests within 5 seconds
    }
  );

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
          <p>{error.message || 'Failed to load movies. Please try again later.'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-md text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : movies ? (
        <MovieGrid movies={movies} sortBy={sortBy} />
      ) : null}
    </div>
  );
}