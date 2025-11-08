import { Address } from '@/types';

const API_BASE = '/api/addresses';

export const addressService = {
  async getAll(): Promise<Address[]> {
    const response = await fetch(API_BASE);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch addresses');
    }
    return response.json();
  },

  async getById(id: string): Promise<Address> {
    const response = await fetch(`${API_BASE}/${id}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch address');
    }
    return response.json();
  },

  async create(data: Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Address> {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create address');
    }
    return response.json();
  },

  async update(
    id: string,
    data: Partial<Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<Address> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update address');
    }
    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete address');
    }
  },

  async setDefault(id: string): Promise<Address> {
    const response = await fetch(`${API_BASE}/${id}/default`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to set default address');
    }
    return response.json();
  },
};
