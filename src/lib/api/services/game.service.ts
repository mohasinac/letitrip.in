/**
 * Game Service
 * Handles all game-related API operations (Beyblades & Arenas)
 */

import { apiClient } from "../client";
import type { BeybladeStats } from "@/types/beybladeStats";
import type { ArenaConfig } from "@/types/arenaConfig";

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
  static async getBeyblades(): Promise<BeybladeStats[]> {
    try {
      const response = await apiClient.get<BeybladeStats[]>('/api/beyblades');
      return response;
    } catch (error) {
      console.error("GameService.getBeyblades error:", error);
      throw error;
    }
  }

  /**
   * Get beyblade by ID
   */
  static async getBeyblade(beybladeId: string): Promise<BeybladeStats> {
    try {
      const response = await apiClient.get<BeybladeStats>(`/api/beyblades/${beybladeId}`);
      return response;
    } catch (error) {
      console.error("GameService.getBeyblade error:", error);
      throw error;
    }
  }

  /**
   * Create new beyblade
   */
  static async createBeyblade(data: Partial<BeybladeStats>): Promise<BeybladeStats> {
    try {
      const response = await apiClient.post<BeybladeStats>('/api/beyblades', data);
      return response;
    } catch (error) {
      console.error("GameService.createBeyblade error:", error);
      throw error;
    }
  }

  /**
   * Update beyblade
   */
  static async updateBeyblade(beybladeId: string, data: Partial<BeybladeStats>): Promise<BeybladeStats> {
    try {
      const response = await apiClient.put<BeybladeStats>(
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
  static async getArenas(): Promise<ArenaConfig[]> {
    try {
      const response = await apiClient.get<ArenaConfig[]>('/api/arenas');
      return response;
    } catch (error) {
      console.error("GameService.getArenas error:", error);
      throw error;
    }
  }

  /**
   * Get arena by ID
   */
  static async getArena(arenaId: string): Promise<ArenaConfig> {
    try {
      const response = await apiClient.get<ArenaConfig>(`/api/arenas/${arenaId}`);
      return response;
    } catch (error) {
      console.error("GameService.getArena error:", error);
      throw error;
    }
  }

  /**
   * Create new arena
   */
  static async createArena(data: Partial<ArenaConfig>): Promise<ArenaConfig> {
    try {
      const response = await apiClient.post<ArenaConfig>('/api/arenas', data);
      return response;
    } catch (error) {
      console.error("GameService.createArena error:", error);
      throw error;
    }
  }

  /**
   * Update arena
   */
  static async updateArena(arenaId: string, data: Partial<ArenaConfig>): Promise<ArenaConfig> {
    try {
      const response = await apiClient.put<ArenaConfig>(
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
}

export default GameService;
