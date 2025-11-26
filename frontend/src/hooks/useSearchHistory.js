import { useState, useEffect } from 'react';

const MAX_HISTORY_ITEMS = 10;
const STORAGE_KEY = 'food_delivery_search_history';

const useSearchHistory = () => {
  const [searchHistory, setSearchHistory] = useState([]);

  // Load search history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSearchHistory(parsed);
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  }, []);

  // Add search query to history
  const addToHistory = (query) => {
    if (!query || query.trim().length === 0) return;

    const trimmedQuery = query.trim();

    // Remove duplicates and add to beginning
    const newHistory = [
      trimmedQuery,
      ...searchHistory.filter(item => item.toLowerCase() !== trimmedQuery.toLowerCase())
    ].slice(0, MAX_HISTORY_ITEMS);

    setSearchHistory(newHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  };

  // Remove specific item from history
  const removeFromHistory = (query) => {
    const newHistory = searchHistory.filter(item => item !== query);
    setSearchHistory(newHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  };

  // Clear all search history
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    searchHistory,
    addToHistory,
    removeFromHistory,
    clearHistory
  };
};

export default useSearchHistory;
