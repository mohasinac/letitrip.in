/**
 * Game Service
 * Handles all game-related API operations (Beyblades & Arenas)
 */

import { apiClient } from "../client";

// ============================================
// Beyblade Types
// ============================================

export interface Beyblade {
  id: string;
  name: string;
  type: 'attack' | 'defense' | 'stamina' | 'balance';
  series: string;
  attack: number;
  defense: number;
  stamina: number;
  weight: number;
  image?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBeybladeData {
  name: string;
  type: 'attack' | 'defense' | 'stamina' | 'balance';
  series: string;
  attack: number;
  defense: number;
  stamina: number;
  weight: number;
  image?: string;
  description?: string;
}

export interface UpdateBeybladeData extends Partial<CreateBeybladeData> {}

// ============================================
// Arena Types
// ============================================

export interface Arena {
  id: string;
  name: string;
  type: 'standard' | 'stadium' | 'tornado' | 'beystadium';
  diameter: number;
  depth: number;
  surface: string;
  description?: string;
  image?: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateArenaData {
  name: string;
  type: 'standard' | 'stadium' | 'tornado' | 'beystadium';
  diameter: number;
  depth: number;
  surface: string;
  description?: string;
  image?: string;
  isDefault?: boolean;
}

export interface UpdateArenaData extends Partial<CreateArenaData> {}

// ============================================
// Game Service Class
// ============================================

export class GameService {
  // ============================================
  // Beyblade Methods
  // ============================================

  /**
   * Get all beyblades
   */
  static async getBeyblades(): Promise<Beyblade[]> {
    try {
      const response = await apiClient.get<Beyblade[]>('/api/beyblades');
      return response;
    } catch (error) {
      console.error("GameService.getBeyblades error:", error);
      throw error;
    }
  }

  /**
   * Get beyblade by ID
   */
  static async getBeyblade(beybladeId: string): Promise<Beyblade> {
    try {
      const response = await apiClient.get<Beyblade>(`/api/beyblades/${beybladeId}`);
      return response;
    } catch (error) {
      console.error("GameService.getBeyblade error:", error);
      throw error;
    }
  }

  /**
   * Create new beyblade
   */
  static async createBeyblade(data: CreateBeybladeData): Promise<Beyblade> {
    try {
      const response = await apiClient.post<Beyblade>('/api/beyblades', data);
      return response;
    } catch (error) {
      console.error("GameService.createBeyblade error:", error);
      throw error;
    }
  }

  /**
   * Update beyblade
   */
  static async updateBeyblade(beybladeId: string, data: UpdateBeybladeData): Promise<Beyblade> {
    try {
      const response = await apiClient.put<Beyblade>(
        `/api/beyblades/${beybladeId}`,
        data
      );
      return response;
    } catch (error) {
      console.error("GameService.updateBeyblade error:", error);
      throw error;
    }
  }

  /**
   * Delete beyblade
   */
  static async deleteBeyblade(beybladeId: string): Promise<void> {
    try {
      await apiClient.delete<void>(`/api/beyblades/${beybladeId}`);
    } catch (error) {
      console.error("GameService.deleteBeyblade error:", error);
      throw error;
    }
  }

  /**
   * Initialize default beyblades
   */
  static async initializeBeyblades(): Promise<void> {
    try {
      await apiClient.post<void>('/api/beyblades/init', {});
    } catch (error) {
      console.error("GameService.initializeBeyblades error:", error);
      throw error;
    }
  }

  /**
   * Upload beyblade image
   */
  static async uploadBeybladeImage(file: File): Promise<{ url: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.upload<{ url: string }>(
        '/api/beyblades/upload-image',
        formData
      );

      return response;
    } catch (error) {
      console.error("GameService.uploadBeybladeImage error:", error);
      throw error;
    }
  }

  // ============================================
  // Arena Methods
  // ============================================

  /**
   * Get all arenas
   */
  static async getArenas(): Promise<Arena[]> {
    try {
      const response = await apiClient.get<Arena[]>('/api/arenas');
      return response;
    } catch (error) {
      console.error("GameService.getArenas error:", error);
      throw error;
    }
  }

  /**
   * Get arena by ID
   */
  static async getArena(arenaId: string): Promise<Arena> {
    try {
      const response = await apiClient.get<Arena>(`/api/arenas/${arenaId}`);
      return response;
    } catch (error) {
      console.error("GameService.getArena error:", error);
      throw error;
    }
  }

  /**
   * Create new arena
   */
  static async createArena(data: CreateArenaData): Promise<Arena> {
    try {
      const response = await apiClient.post<Arena>('/api/arenas', data);
      return response;
    } catch (error) {
      console.error("GameService.createArena error:", error);
      throw error;
    }
  }

  /**
   * Update arena
   */
  static async updateArena(arenaId: string, data: UpdateArenaData): Promise<Arena> {
    try {
      const response = await apiClient.put<Arena>(
        `/api/arenas/${arenaId}`,
        data
      );
      return response;
    } catch (error) {
      console.error("GameService.updateArena error:", error);
      throw error;
    }
  }

  /**
   * Delete arena
   */
  static async deleteArena(arenaId: string): Promise<void> {
    try {
      await apiClient.delete<void>(`/api/arenas/${arenaId}`);
    } catch (error) {
      console.error("GameService.deleteArena error:", error);
      throw error;
    }
  }

  /**
   * Set default arena
   */
  static async setDefaultArena(arenaId: string): Promise<void> {
    try {
      await apiClient.post<void>(`/api/arenas/${arenaId}/set-default`, {});
    } catch (error) {
      console.error("GameService.setDefaultArena error:", error);
      throw error;
    }
  }

  /**
   * Initialize default arenas
   */
  static async initializeArenas(): Promise<void> {
    try {
      await apiClient.post<void>('/api/arenas/init', {});
    } catch (error) {
      console.error("GameService.initializeArenas error:", error);
      throw error;
    }
  }
}

export default GameService;
