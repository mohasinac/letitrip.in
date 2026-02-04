import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Toggle } from '../index';

describe('Toggle', () => {
  it('renders with default props', () => {
    render(<Toggle />);
    const toggle = screen.getByRole('switch');
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  it('renders with label', () => {
    render(<Toggle label="Enable feature" />);
    expect(screen.getByText('Enable feature')).toBeInTheDocument();
  });

  it('toggles on click', async () => {
    const user = userEvent.setup();
    render(<Toggle />);
    
    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onChange when toggled', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    
    render(<Toggle onChange={handleChange} />);
    
    const toggle = screen.getByRole('switch');
    await user.click(toggle);
    
    expect(handleChange).toHaveBeenCalledWith(true);
    
    await user.click(toggle);
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('supports controlled mode', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    const { rerender } = render(
      <Toggle checked={false} onChange={handleChange} />
    );
    
    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    
    await user.click(toggle);
    expect(handleChange).toHaveBeenCalledWith(true);
    
    rerender(<Toggle checked={true} onChange={handleChange} />);
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('supports defaultChecked', () => {
    render(<Toggle defaultChecked />);
    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('disables toggle when disabled prop is true', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    
    render(<Toggle disabled onChange={handleChange} />);
    
    const toggle = screen.getByRole('switch');
    expect(toggle).toBeDisabled();
    
    await user.click(toggle);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('applies size classes correctly', () => {
    const { rerender } = render(<Toggle size="sm" />);
    let toggle = screen.getByRole('switch');
    expect(toggle).toHaveClass('w-8', 'h-5');
    
    rerender(<Toggle size="lg" />);
    toggle = screen.getByRole('switch');
    expect(toggle).toHaveClass('w-14', 'h-7');
  });

  it('applies custom className', () => {
    const { container } = render(<Toggle className="custom-toggle" />);
    expect(container.firstChild).toHaveClass('custom-toggle');
  });

  it('clicking label toggles the switch', async () => {
    const user = userEvent.setup();
    render(<Toggle label="Toggle me" />);
    
    const toggle = screen.getByRole('switch');
    const label = screen.getByText('Toggle me');
    
    await user.click(label);
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('disabled label does not toggle switch', async () => {
    const user = userEvent.setup();
    render(<Toggle label="Toggle me" disabled />);
    
    const toggle = screen.getByRole('switch');
    const label = screen.getByText('Toggle me');
    
    await user.click(label);
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });
});
