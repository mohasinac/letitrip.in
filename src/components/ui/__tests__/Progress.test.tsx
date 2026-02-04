import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Progress, IndeterminateProgress } from '../index';

describe('Progress', () => {
  it('renders with default props', () => {
    render(<Progress value={50} />);
    const progress = screen.getByRole('progressbar');
    expect(progress).toBeInTheDocument();
    expect(progress).toHaveAttribute('aria-valuenow', '50');
  });

  it('displays correct percentage width', () => {
    const { container } = render(<Progress value={75} />);
    const progressBar = container.querySelector('[role="progressbar"] > div');
    expect(progressBar).toHaveStyle({ width: '75%' });
  });

  it('renders with label', () => {
    render(<Progress value={60} label="Upload progress" />);
    expect(screen.getByText('Upload progress')).toBeInTheDocument();
  });

  it('shows value when showValue is true', () => {
    render(<Progress value={45} showValue />);
    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  it('shows both label and value', () => {
    render(<Progress value={80} label="Loading" showValue />);
    expect(screen.getByText('Loading')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
  });

  it('clamps value between 0 and 100', () => {
    const { container, rerender } = render(<Progress value={-10} />);
    let progressBar = container.querySelector('[role="progressbar"] > div');
    expect(progressBar).toHaveStyle({ width: '0%' });
    
    rerender(<Progress value={150} />);
    progressBar = container.querySelector('[role="progressbar"] > div');
    expect(progressBar).toHaveStyle({ width: '100%' });
  });

  it('supports custom max value', () => {
    render(<Progress value={25} max={50} showValue />);
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '50');
  });

  it('applies size classes correctly', () => {
    const { container, rerender } = render(<Progress value={50} size="sm" />);
    let progressContainer = container.querySelector('[role="progressbar"]');
    expect(progressContainer).toHaveClass('h-1');
    
    rerender(<Progress value={50} size="lg" />);
    progressContainer = container.querySelector('[role="progressbar"]');
    expect(progressContainer).toHaveClass('h-3');
  });

  it('applies variant colors correctly', () => {
    const { container, rerender } = render(<Progress value={50} variant="success" />);
    let progressBar = container.querySelector('[role="progressbar"] > div');
    expect(progressBar).toHaveClass('bg-green-600');
    
    rerender(<Progress value={50} variant="error" />);
    progressBar = container.querySelector('[role="progressbar"] > div');
    expect(progressBar).toHaveClass('bg-red-600');
    
    rerender(<Progress value={50} variant="warning" />);
    progressBar = container.querySelector('[role="progressbar"] > div');
    expect(progressBar).toHaveClass('bg-yellow-600');
  });

  it('has proper ARIA attributes', () => {
    render(<Progress value={60} max={100} />);
    const progress = screen.getByRole('progressbar');
    
    expect(progress).toHaveAttribute('aria-valuenow', '60');
    expect(progress).toHaveAttribute('aria-valuemin', '0');
    expect(progress).toHaveAttribute('aria-valuemax', '100');
  });

  it('applies custom className', () => {
    const { container } = render(<Progress value={50} className="custom-progress" />);
    expect(container.firstChild).toHaveClass('custom-progress');
  });
});

describe('IndeterminateProgress', () => {
  it('renders indeterminate progress', () => {
    render(<IndeterminateProgress />);
    const progress = screen.getByRole('progressbar');
    expect(progress).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<IndeterminateProgress label="Loading..." />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('applies size classes correctly', () => {
    const { container, rerender } = render(<IndeterminateProgress size="sm" />);
    let progressContainer = container.querySelector('[role="progressbar"]');
    expect(progressContainer).toHaveClass('h-1');
    
    rerender(<IndeterminateProgress size="lg" />);
    progressContainer = container.querySelector('[role="progressbar"]');
    expect(progressContainer).toHaveClass('h-3');
  });

  it('applies variant colors correctly', () => {
    const { container, rerender } = render(<IndeterminateProgress variant="success" />);
    let progressBar = container.querySelector('[role="progressbar"] > div');
    expect(progressBar).toHaveClass('bg-green-600');
    
    rerender(<IndeterminateProgress variant="error" />);
    progressBar = container.querySelector('[role="progressbar"] > div');
    expect(progressBar).toHaveClass('bg-red-600');
  });

  it('applies custom className', () => {
    const { container } = render(<IndeterminateProgress className="custom-progress" />);
    expect(container.firstChild).toHaveClass('custom-progress');
  });

  it('has proper ARIA label', () => {
    render(<IndeterminateProgress label="Processing" />);
    expect(screen.getByLabelText('Processing')).toBeInTheDocument();
  });
});
