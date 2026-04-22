import { create } from 'zustand';
import { Portfolio, Order } from '../types';
import { portfolioAPI, ordersAPI } from '../services/api';

interface PortfolioStore {
  portfolio: Portfolio | null;
  orders: Order[];
  isLoading: boolean;
  fetchPortfolio: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  placeOrder: (order: {
    symbol: string;
    type: string;
    orderType: string;
    quantity: number;
    price?: number;
  }) => Promise<void>;
}

export const usePortfolioStore = create<PortfolioStore>((set) => ({
  portfolio: null,
  orders: [],
  isLoading: false,

  fetchPortfolio: async () => {
    set({ isLoading: true });
    const { data } = await portfolioAPI.get();
    set({ portfolio: data, isLoading: false });
  },

  fetchOrders: async () => {
    const { data } = await portfolioAPI.orders();
    set({ orders: data });
  },

  placeOrder: async (order) => {
    await ordersAPI.place(order);
  },
}));
