import { create } from 'zustand';
import { Watchlist } from '../types';
import { watchlistAPI } from '../services/api';

interface WatchlistStore {
  watchlists: Watchlist[];
  isLoading: boolean;
  fetchWatchlists: () => Promise<void>;
  createWatchlist: (name: string) => Promise<void>;
  deleteWatchlist: (id: string) => Promise<void>;
  addStock: (id: string, symbol: string) => Promise<void>;
  removeStock: (id: string, symbol: string) => Promise<void>;
}

export const useWatchlistStore = create<WatchlistStore>((set, get) => ({
  watchlists: [],
  isLoading: false,

  fetchWatchlists: async () => {
    set({ isLoading: true });
    const { data } = await watchlistAPI.getAll();
    set({ watchlists: data, isLoading: false });
  },

  createWatchlist: async (name) => {
    const { data } = await watchlistAPI.create(name);
    set({ watchlists: [...get().watchlists, data] });
  },

  deleteWatchlist: async (id) => {
    await watchlistAPI.delete(id);
    set({ watchlists: get().watchlists.filter((w) => w.id !== id) });
  },

  addStock: async (id, symbol) => {
    await watchlistAPI.addStock(id, symbol);
    set({
      watchlists: get().watchlists.map((w) =>
        w.id === id ? { ...w, symbols: [...w.symbols, symbol] } : w
      ),
    });
  },

  removeStock: async (id, symbol) => {
    await watchlistAPI.removeStock(id, symbol);
    set({
      watchlists: get().watchlists.map((w) =>
        w.id === id ? { ...w, symbols: w.symbols.filter((s) => s !== symbol) } : w
      ),
    });
  },
}));
