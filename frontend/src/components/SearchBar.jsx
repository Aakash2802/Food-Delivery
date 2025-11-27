import { useState, useRef, useEffect } from 'react';
import { Search, Clock, X, TrendingUp } from 'lucide-react';
import useSearchHistory from '../hooks/useSearchHistory';
import TypingEffect from './TypingEffect';

const SearchBar = ({ onSearch, placeholder = "Search for restaurants, cuisines, or dishes...", autoFocus = false }) => {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef(null);
  const { searchHistory, addToHistory, removeFromHistory, clearHistory } = useSearchHistory();

  // Animated placeholder texts
  const typingTexts = [
    'Search for "Biryani"...',
    'Search for "Pizza"...',
    'Search for "Dosa"...',
    'Search for "Burger"...',
    'Search for "Chinese"...',
  ];

  // Popular/trending searches (can be fetched from backend in future)
  const trendingSearches = [
    'Biryani',
    'Pizza',
    'Burger',
    'Dosa',
    'Chinese',
    'Ice Cream',
    'Parotta',
    'Chicken'
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Show dropdown when typing
    if (value.trim().length > 0) {
      setShowDropdown(true);
      // Filter suggestions based on input
      const filtered = trendingSearches.filter(item =>
        item.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setShowDropdown(true);
      setSuggestions([]);
    }
  };

  const handleSearch = (searchQuery) => {
    const finalQuery = searchQuery || query;
    if (finalQuery.trim()) {
      addToHistory(finalQuery);
      onSearch(finalQuery);
      setShowDropdown(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleClearSearch = () => {
    setQuery('');
    setShowDropdown(false);
  };

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />

          {/* Animated Typing Placeholder */}
          {!query && !isFocused && (
            <div className="absolute left-12 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
              <TypingEffect texts={typingTexts} typingSpeed={80} deletingSpeed={50} pauseDuration={2000} />
            </div>
          )}

          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => {
              setShowDropdown(true);
              setIsFocused(true);
            }}
            onBlur={() => setIsFocused(false)}
            placeholder={isFocused ? placeholder : ''}
            autoFocus={autoFocus}
            className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none text-gray-900 placeholder-gray-400 transition-colors bg-white"
          />
          {query && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown with History and Suggestions */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 max-h-96 overflow-y-auto">
          {/* Recent Searches */}
          {searchHistory.length > 0 && query.trim().length === 0 && (
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  Recent Searches
                </h3>
                <button
                  onClick={clearHistory}
                  className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
                >
                  Clear All
                </button>
              </div>
              <div className="space-y-1">
                {searchHistory.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between group hover:bg-gray-50 rounded-lg px-3 py-2 cursor-pointer transition-colors"
                  >
                    <button
                      onClick={() => handleSuggestionClick(item)}
                      className="flex-1 text-left text-gray-700 text-sm"
                    >
                      {item}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromHistory(item);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filtered Suggestions */}
          {query.trim().length > 0 && suggestions.length > 0 && (
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-500" />
                Suggestions
              </h3>
              <div className="space-y-1">
                {suggestions.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(item)}
                    className="w-full text-left text-gray-700 text-sm hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
                  >
                    <span className="font-medium">{item.slice(0, query.length)}</span>
                    {item.slice(query.length)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trending Searches */}
          {query.trim().length === 0 && (
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-red-500" />
                Trending Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(item)}
                    className="px-4 py-2 bg-gradient-to-r from-red-50 to-orange-50 text-red-700 rounded-full text-sm font-medium hover:from-red-100 hover:to-orange-100 transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {query.trim().length > 0 && suggestions.length === 0 && (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No suggestions found</p>
              <p className="text-gray-400 text-xs mt-1">Try searching for cuisines or dishes</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
