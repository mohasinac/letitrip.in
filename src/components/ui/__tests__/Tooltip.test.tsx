import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Tooltip } from '../index';

describe('Tooltip', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders children without tooltip initially', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );
    
    expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip on mouse enter after delay', async () => {
    const user = userEvent.setup({ delay: null });
    
    render(
      <Tooltip content="Tooltip text" delay={100}>
        <button>Hover me</button>
      </Tooltip>
    );
    
    const button = screen.getByRole('button');
    await user.hover(button);
    
    jest.advanceTimersByTime(100);
    
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
      expect(screen.getByText('Tooltip text')).toBeInTheDocument();
    });
  });

  it('hides tooltip on mouse leave', async () => {
    const user = userEvent.setup({ delay: null });
    
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );
    
    const button = screen.getByRole('button');
    await user.hover(button);
    
    jest.advanceTimersByTime(0);
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
    
    await user.unhover(button);
    
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  it('applies custom className', async () => {
    const user = userEvent.setup({ delay: null });
    
    render(
      <Tooltip content="Tooltip text" className="custom-tooltip" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );
    
    const button = screen.getByRole('button');
    await user.hover(button);
    
    jest.advanceTimersByTime(0);
    
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('custom-tooltip');
    });
  });

  it('supports different placements', async () => {
    const user = userEvent.setup({ delay: null });
    const { rerender } = render(
      <Tooltip content="Tooltip text" placement="top" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );
    
    const button = screen.getByRole('button');
    await user.hover(button);
    jest.advanceTimersByTime(0);
    
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('bottom-full');
    });
    
    await user.unhover(button);
    
    rerender(
      <Tooltip content="Tooltip text" placement="bottom" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );
    
    await user.hover(button);
    jest.advanceTimersByTime(0);
    
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('top-full');
    });
  });
});
