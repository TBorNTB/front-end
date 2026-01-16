'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Grid, List, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export interface ContentFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit?: () => void;
  isSearching?: boolean;
  suggestions?: string[];
  showSuggestions?: boolean;
  onSuggestionSelect?: (suggestion: string) => void;
  onSuggestionsShow?: (show: boolean) => void;
  isLoadingSuggestions?: boolean;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  sortBy?: string;
  sortOptions?: string[];
  onSortChange?: (sort: string) => void;
  showViewMode?: boolean;
  showSort?: boolean;
  showCreateButton?: boolean;
  createButtonText?: string;
  createButtonHref?: string;
  additionalFilters?: React.ReactNode;
  placeholderText?: string;
}

export default function ContentFilterBar({
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  isSearching = false,
  suggestions = [],
  showSuggestions = false,
  onSuggestionSelect,
  onSuggestionsShow,
  isLoadingSuggestions = false,
  viewMode = 'grid',
  onViewModeChange,
  sortBy = '최신순',
  sortOptions = ['최신순', '인기순', '조회순'],
  onSortChange,
  showViewMode = true,
  showSort = true,
  showCreateButton = true,
  createButtonText = '새 글 쓰기',
  createButtonHref = '/articles/create',
  additionalFilters,
  placeholderText = '찾고자 하는 콘텐츠를 작성해주세요',
}: ContentFilterBarProps) {
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current &&
        suggestionsRef.current &&
        !searchInputRef.current.contains(event.target as Node) &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        onSuggestionsShow?.(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onSuggestionsShow]);

  // Close sort dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSuggestionClick = (suggestion: string) => {
    onSearchChange(suggestion);
    onSuggestionSelect?.(suggestion);
    onSuggestionsShow?.(false);
    searchInputRef.current?.blur();
  };

  return (
    <section className="flex flex-col md:flex-row gap-4 mb-8 bg-gradient-to-r from-primary-600 to-secondary-500 rounded-xl p-6 shadow-md">
      <div className="flex flex-col md:flex-row gap-4 w-full items-center">
        {/* Search Input */}
        <div className="flex-1 relative w-full">
          <div className="relative flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={placeholderText}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onSearchSubmit?.();
                  }
                }}
                onFocus={() => {
                  if (suggestions.length > 0) {
                    onSuggestionsShow?.(true);
                  }
                }}
                className="w-full h-11 pl-10 pr-10 rounded-xl border border-gray-200 bg-gray-50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-colors"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
                </div>
              )}
            </div>
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto"
            >
              {isLoadingSuggestions ? (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  검색 중...
                </div>
              ) : suggestions.length > 0 ? (
                <div className="py-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                    >
                      <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-gray-400" />
                        <span>{suggestion}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  검색 결과가 없습니다
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Controls: Additional Filters + View Mode + Sort + Create Button */}
        <div className="flex items-center justify-end gap-3 w-full md:w-auto flex-wrap md:flex-nowrap">
          {/* Additional Filters (e.g., categories, status filters) */}
          {additionalFilters}

          {/* View Mode Toggle */}
          {showViewMode && onViewModeChange && (
            <div className="flex items-center gap-1 bg-white/20 rounded-lg p-1">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-primary-600'
                    : 'text-white hover:bg-white/10'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-primary-600'
                    : 'text-white hover:bg-white/10'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Sort Dropdown */}
          {showSort && onSortChange && (
            <div className="relative" ref={sortDropdownRef}>
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-primary-600 text-sm font-semibold hover:shadow-md transition-shadow whitespace-nowrap"
              >
                <span>{sortBy}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showSortDropdown && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 min-w-[140px]">
                  {sortOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        onSortChange(option);
                        setShowSortDropdown(false);
                      }}
                      className={`block w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                        sortBy === option
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Create Button */}
          {showCreateButton && (
            <Link
              href={createButtonHref}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              {createButtonText}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
