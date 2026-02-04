'use client';

import React, { useCallback, useRef, useState } from 'react';
import { THEME_CONSTANTS } from '@/constants/theme';

export interface SliderProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  onChangeEnd?: (value: number) => void;
  disabled?: boolean;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  id?: string;
}

export default function Slider({
  value: controlledValue,
  defaultValue = 50,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  onChangeEnd,
  disabled = false,
  label,
  showValue = false,
  size = 'md',
  className = '',
  id,
}: SliderProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;
  
  const sliderRef = useRef<HTMLInputElement>(null);
  const sliderId = id || React.useId();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    
    if (!isControlled) {
      setUncontrolledValue(newValue);
    }
    
    onChange?.(newValue);
  }, [isControlled, onChange]);

  const handleMouseUp = useCallback(() => {
    if (onChangeEnd) {
      onChangeEnd(value);
    }
  }, [onChangeEnd, value]);

  const percentage = ((value - min) / (max - min)) * 100;

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const thumbSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const { themed } = THEME_CONSTANTS;

  return (
    <div className={`slider-container ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <label htmlFor={sliderId} className={`text-sm font-medium ${themed.textPrimary}`}>
              {label}
            </label>
          )}
          {showValue && (
            <span className={`text-sm font-medium ${themed.textSecondary}`}>
              {value}
            </span>
          )}
        </div>
      )}
      
      <div className="relative">
        <input
          ref={sliderRef}
          type="range"
          id={sliderId}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleMouseUp}
          disabled={disabled}
          className="slider-input"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-label={label || 'Slider'}
        />
        
        <div className="slider-track-container pointer-events-none absolute top-1/2 -translate-y-1/2 left-0 right-0">
          <div className={`slider-track ${themed.bgTertiary} rounded-full ${sizeClasses[size]}`}>
            <div 
              className={`slider-fill bg-blue-600 dark:bg-blue-500 rounded-full ${sizeClasses[size]}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider-input {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: ${size === 'sm' ? '0.25rem' : size === 'md' ? '0.5rem' : '0.75rem'};
          background: transparent;
          outline: none;
          position: relative;
          z-index: 1;
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
        }

        .slider-input:disabled {
          opacity: 0.5;
        }

        /* Chrome, Safari, Opera */
        .slider-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          ${size === 'sm' ? 'width: 0.75rem; height: 0.75rem;' : ''}
          ${size === 'md' ? 'width: 1rem; height: 1rem;' : ''}
          ${size === 'lg' ? 'width: 1.25rem; height: 1.25rem;' : ''}
          background: ${disabled ? '#9ca3af' : '#2563eb'};
          border: 2px solid white;
          border-radius: 50%;
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
          transition: background 0.2s, transform 0.2s;
        }

        .slider-input:not(:disabled)::-webkit-slider-thumb:hover {
          background: #1d4ed8;
          transform: scale(1.1);
        }

        .slider-input:not(:disabled)::-webkit-slider-thumb:active {
          transform: scale(0.95);
        }

        /* Firefox */
        .slider-input::-moz-range-thumb {
          ${size === 'sm' ? 'width: 0.75rem; height: 0.75rem;' : ''}
          ${size === 'md' ? 'width: 1rem; height: 1rem;' : ''}
          ${size === 'lg' ? 'width: 1.25rem; height: 1.25rem;' : ''}
          background: ${disabled ? '#9ca3af' : '#2563eb'};
          border: 2px solid white;
          border-radius: 50%;
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
          transition: background 0.2s, transform 0.2s;
        }

        .slider-input:not(:disabled)::-moz-range-thumb:hover {
          background: #1d4ed8;
          transform: scale(1.1);
        }

        .slider-input:not(:disabled)::-moz-range-thumb:active {
          transform: scale(0.95);
        }

        .slider-input::-moz-range-track {
          background: transparent;
          border: none;
        }

        .slider-track-container {
          left: 0;
          right: 0;
        }
      `}</style>
    </div>
  );
}
