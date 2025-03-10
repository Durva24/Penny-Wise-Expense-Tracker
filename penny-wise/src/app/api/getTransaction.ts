
  // api.ts
  import axios from 'axios';
  import { Transaction, TransactionCreateInput, TransactionUpdateInput, ApiResponse } from '../types/transaction';
  
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
  
  // Create axios instance with defaults
  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  // Transactions API
  export const TransactionsApi = {
    // Get all transactions
    getAll: async (): Promise<ApiResponse<Transaction[]>> => {
      try {
        const response = await apiClient.get<ApiResponse<Transaction[]>>('/transactions');
        return response.data;
      } catch (error) {
        console.error('Error fetching transactions:', error);
        return { status: 'error', message: 'Failed to fetch transactions' };
      }
    },
  
    // Get transaction by ID
    getById: async (id: number): Promise<ApiResponse<Transaction>> => {
      try {
        const response = await apiClient.get<ApiResponse<Transaction>>(`/transactions/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching transaction ${id}:`, error);
        return { status: 'error', message: 'Failed to fetch transaction' };
      }
    },
  
    // Create new transaction
    create: async (transaction: TransactionCreateInput): Promise<ApiResponse<Transaction>> => {
      try {
        const response = await apiClient.post<ApiResponse<Transaction>>('/transactions', transaction);
        return response.data;
      } catch (error) {
        console.error('Error creating transaction:', error);
        return { status: 'error', message: 'Failed to create transaction' };
      }
    },
  
    // Update transaction
    update: async (id: number, transaction: TransactionUpdateInput): Promise<ApiResponse<Transaction>> => {
      try {
        const response = await apiClient.put<ApiResponse<Transaction>>(`/transactions/${id}`, transaction);
        return response.data;
      } catch (error) {
        console.error(`Error updating transaction ${id}:`, error);
        return { status: 'error', message: 'Failed to update transaction' };
      }
    },
  
    // Delete transaction
    delete: async (id: number): Promise<ApiResponse<void>> => {
      try {
        const response = await apiClient.delete<ApiResponse<void>>(`/transactions/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Error deleting transaction ${id}:`, error);
        return { status: 'error', message: 'Failed to delete transaction' };
      }
    },
  
    // Get transactions by category
    getByCategory: async (category: string): Promise<ApiResponse<Transaction[]>> => {
      try {
        const response = await apiClient.get<ApiResponse<Transaction[]>>(`/transactions/category/${category}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching transactions in category ${category}:`, error);
        return { status: 'error', message: 'Failed to fetch transactions by category' };
      }
    },
  
    // Get transactions by type (Income/Expense)
    getByType: async (type: 'Income' | 'Expense'): Promise<ApiResponse<Transaction[]>> => {
      try {
        const response = await apiClient.get<ApiResponse<Transaction[]>>(`/transactions/type/${type}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching ${type} transactions:`, error);
        return { status: 'error', message: `Failed to fetch ${type} transactions` };
      }
    }
  };