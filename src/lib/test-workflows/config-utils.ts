/**
 * Workflow Configuration Management
 *
 * Provides utilities for customizing workflow parameters,
 * saving/loading presets, and managing workflow execution settings.
 */

export interface WorkflowConfig {
  id: string;
  name: string;
  workflowType: string;
  parameters: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
  description?: string;
}

export interface WorkflowPreset {
  id: string;
  name: string;
  description: string;
  config: WorkflowConfig;
}

export interface WorkflowExecutionOptions {
  pauseBetweenSteps?: number; // milliseconds
  continueOnError?: boolean;
  verbose?: boolean;
  dryRun?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number; // milliseconds
}

const DEFAULT_EXECUTION_OPTIONS: WorkflowExecutionOptions = {
  pauseBetweenSteps: 500,
  continueOnError: false,
  verbose: false,
  dryRun: false,
  maxRetries: 0,
  retryDelay: 1000,
  timeout: 300000, // 5 minutes
};

/**
 * Get default execution options
 */
export function getDefaultExecutionOptions(): WorkflowExecutionOptions {
  return { ...DEFAULT_EXECUTION_OPTIONS };
}

/**
 * Merge execution options with defaults
 */
export function mergeExecutionOptions(
  options?: Partial<WorkflowExecutionOptions>
): WorkflowExecutionOptions {
  return {
    ...DEFAULT_EXECUTION_OPTIONS,
    ...options,
  };
}

/**
 * Save workflow configuration
 */
export function saveWorkflowConfig(config: WorkflowConfig): void {
  if (typeof window === "undefined") return;

  const key = "workflow_configs";
  const existing = localStorage.getItem(key);
  const configs: WorkflowConfig[] = existing ? JSON.parse(existing) : [];

  // Update or add config
  const index = configs.findIndex((c) => c.id === config.id);
  if (index >= 0) {
    configs[index] = { ...config, updatedAt: new Date().toISOString() };
  } else {
    configs.push(config);
  }

  localStorage.setItem(key, JSON.stringify(configs));
}

/**
 * Load workflow configuration
 */
export function loadWorkflowConfig(id: string): WorkflowConfig | null {
  if (typeof window === "undefined") return null;

  const key = "workflow_configs";
  const existing = localStorage.getItem(key);
  if (!existing) return null;

  const configs: WorkflowConfig[] = JSON.parse(existing);
  return configs.find((c) => c.id === id) || null;
}

/**
 * Load all workflow configurations
 */
export function loadAllWorkflowConfigs(): WorkflowConfig[] {
  if (typeof window === "undefined") return [];

  const key = "workflow_configs";
  const existing = localStorage.getItem(key);
  return existing ? JSON.parse(existing) : [];
}

/**
 * Delete workflow configuration
 */
export function deleteWorkflowConfig(id: string): void {
  if (typeof window === "undefined") return;

  const key = "workflow_configs";
  const existing = localStorage.getItem(key);
  if (!existing) return;

  const configs: WorkflowConfig[] = JSON.parse(existing);
  const filtered = configs.filter((c) => c.id !== id);

  localStorage.setItem(key, JSON.stringify(filtered));
}

/**
 * Toggle favorite status
 */
export function toggleFavorite(id: string): void {
  if (typeof window === "undefined") return;

  const config = loadWorkflowConfig(id);
  if (!config) return;

  config.isFavorite = !config.isFavorite;
  saveWorkflowConfig(config);
}

/**
 * Load favorite configurations
 */
export function loadFavoriteConfigs(): WorkflowConfig[] {
  return loadAllWorkflowConfigs().filter((c) => c.isFavorite);
}

/**
 * Save workflow preset
 */
export function saveWorkflowPreset(preset: WorkflowPreset): void {
  if (typeof window === "undefined") return;

  const key = "workflow_presets";
  const existing = localStorage.getItem(key);
  const presets: WorkflowPreset[] = existing ? JSON.parse(existing) : [];

  // Update or add preset
  const index = presets.findIndex((p) => p.id === preset.id);
  if (index >= 0) {
    presets[index] = preset;
  } else {
    presets.push(preset);
  }

  localStorage.setItem(key, JSON.stringify(presets));
}

/**
 * Load workflow preset
 */
export function loadWorkflowPreset(id: string): WorkflowPreset | null {
  if (typeof window === "undefined") return null;

  const key = "workflow_presets";
  const existing = localStorage.getItem(key);
  if (!existing) return null;

  const presets: WorkflowPreset[] = JSON.parse(existing);
  return presets.find((p) => p.id === id) || null;
}

/**
 * Load all workflow presets
 */
export function loadAllWorkflowPresets(): WorkflowPreset[] {
  if (typeof window === "undefined") return [];

  const key = "workflow_presets";
  const existing = localStorage.getItem(key);
  return existing ? JSON.parse(existing) : [];
}

/**
 * Delete workflow preset
 */
export function deleteWorkflowPreset(id: string): void {
  if (typeof window === "undefined") return;

  const key = "workflow_presets";
  const existing = localStorage.getItem(key);
  if (!existing) return;

  const presets: WorkflowPreset[] = JSON.parse(existing);
  const filtered = presets.filter((p) => p.id !== id);

  localStorage.setItem(key, JSON.stringify(filtered));
}

/**
 * Create default presets
 */
export function createDefaultPresets(): void {
  const defaultPresets: WorkflowPreset[] = [
    {
      id: "quick-test",
      name: "Quick Test",
      description: "Fast execution with minimal delays",
      config: {
        id: "quick-test-config",
        name: "Quick Test Config",
        workflowType: "general",
        parameters: {
          pauseBetweenSteps: 100,
          continueOnError: true,
          verbose: false,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
    {
      id: "thorough-test",
      name: "Thorough Test",
      description: "Comprehensive testing with retries",
      config: {
        id: "thorough-test-config",
        name: "Thorough Test Config",
        workflowType: "general",
        parameters: {
          pauseBetweenSteps: 1000,
          continueOnError: false,
          verbose: true,
          maxRetries: 3,
          retryDelay: 2000,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
    {
      id: "dry-run",
      name: "Dry Run",
      description: "Test workflow without making changes",
      config: {
        id: "dry-run-config",
        name: "Dry Run Config",
        workflowType: "general",
        parameters: {
          dryRun: true,
          verbose: true,
          pauseBetweenSteps: 500,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
    {
      id: "production",
      name: "Production",
      description: "Production-ready settings with error handling",
      config: {
        id: "production-config",
        name: "Production Config",
        workflowType: "general",
        parameters: {
          pauseBetweenSteps: 500,
          continueOnError: false,
          verbose: false,
          maxRetries: 2,
          retryDelay: 1500,
          timeout: 600000, // 10 minutes
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
  ];

  defaultPresets.forEach((preset) => saveWorkflowPreset(preset));
}

/**
 * Validate workflow configuration
 */
export function validateWorkflowConfig(config: WorkflowConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.id || config.id.trim() === "") {
    errors.push("Configuration ID is required");
  }

  if (!config.name || config.name.trim() === "") {
    errors.push("Configuration name is required");
  }

  if (!config.workflowType || config.workflowType.trim() === "") {
    errors.push("Workflow type is required");
  }

  if (!config.parameters || typeof config.parameters !== "object") {
    errors.push("Parameters must be a valid object");
  }

  // Validate execution options if present
  if (config.parameters) {
    const { pauseBetweenSteps, maxRetries, retryDelay, timeout } =
      config.parameters;

    if (pauseBetweenSteps !== undefined && pauseBetweenSteps < 0) {
      errors.push("pauseBetweenSteps must be non-negative");
    }

    if (maxRetries !== undefined && (maxRetries < 0 || maxRetries > 10)) {
      errors.push("maxRetries must be between 0 and 10");
    }

    if (retryDelay !== undefined && retryDelay < 0) {
      errors.push("retryDelay must be non-negative");
    }

    if (timeout !== undefined && (timeout < 1000 || timeout > 3600000)) {
      errors.push("timeout must be between 1 second and 1 hour");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Export configurations
 */
export function exportConfigurations(): string {
  const configs = loadAllWorkflowConfigs();
  const presets = loadAllWorkflowPresets();

  return JSON.stringify(
    {
      configs,
      presets,
      exportedAt: new Date().toISOString(),
    },
    null,
    2
  );
}

/**
 * Import configurations
 */
export function importConfigurations(jsonString: string): {
  success: boolean;
  imported: { configs: number; presets: number };
  errors: string[];
} {
  try {
    const data = JSON.parse(jsonString);
    const errors: string[] = [];

    let configsImported = 0;
    let presetsImported = 0;

    // Import configs
    if (Array.isArray(data.configs)) {
      data.configs.forEach((config: WorkflowConfig) => {
        const validation = validateWorkflowConfig(config);
        if (validation.valid) {
          saveWorkflowConfig(config);
          configsImported++;
        } else {
          errors.push(
            `Invalid config "${config.name}": ${validation.errors.join(", ")}`
          );
        }
      });
    }

    // Import presets
    if (Array.isArray(data.presets)) {
      data.presets.forEach((preset: WorkflowPreset) => {
        saveWorkflowPreset(preset);
        presetsImported++;
      });
    }

    return {
      success: true,
      imported: { configs: configsImported, presets: presetsImported },
      errors,
    };
  } catch (error) {
    return {
      success: false,
      imported: { configs: 0, presets: 0 },
      errors: [error instanceof Error ? error.message : "Invalid JSON format"],
    };
  }
}

/**
 * Clear all configurations and presets
 */
export function clearAllConfigurations(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem("workflow_configs");
  localStorage.removeItem("workflow_presets");
}
