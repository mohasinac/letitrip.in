import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Spinner } from '../index';

describe('Spinner', () => {
  it('renders with default props', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(<Spinner label="Processing..." />);
    const spinner = screen.getByRole('status', { name: 'Processing...' });
    expect(spinner).toBeInTheDocument();
  });

  it('applies size classes correctly', () => {
    const { rerender } = render(<Spinner size="sm" />);
    let spinnerDiv = screen.getByRole('status').querySelector('div');
    expect(spinnerDiv).toHaveClass('w-4', 'h-4');

    rerender(<Spinner size="lg" />);
    spinnerDiv = screen.getByRole('status').querySelector('div');
    expect(spinnerDiv).toHaveClass('w-12', 'h-12');
  });

  it('applies variant classes correctly', () => {
    const { rerender } = render(<Spinner variant="primary" />);
    let spinnerDiv = screen.getByRole('status').querySelector('div');
    expect(spinnerDiv).toHaveClass('border-blue-600');

    rerender(<Spinner variant="white" />);
    spinnerDiv = screen.getByRole('status').querySelector('div');
    expect(spinnerDiv).toHaveClass('border-white');
  });

  it('applies custom className', () => {
    render(<Spinner className="custom-spinner" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('custom-spinner');
  });

  it('has spinning animation', () => {
    render(<Spinner />);
    const spinnerDiv = screen.getByRole('status').querySelector('div');
    expect(spinnerDiv).toHaveClass('animate-spin');
  });
});
