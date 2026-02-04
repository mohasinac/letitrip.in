import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Divider } from '../index';

describe('Divider', () => {
  it('renders horizontal divider by default', () => {
    render(<Divider />);
    const divider = screen.getByRole('separator');
    expect(divider).toBeInTheDocument();
    expect(divider).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('renders vertical divider', () => {
    render(<Divider orientation="vertical" />);
    const divider = screen.getByRole('separator');
    expect(divider).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('renders divider with label', () => {
    render(<Divider label="OR" />);
    const label = screen.getByText('OR');
    expect(label).toBeInTheDocument();
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Divider className="custom-divider" />);
    const divider = screen.getByRole('separator');
    expect(divider).toHaveClass('custom-divider');
  });

  it('renders with label and has correct structure', () => {
    const { container } = render(<Divider label="Section" />);
    const wrapper = container.querySelector('div[role="separator"]');
    expect(wrapper).toBeInTheDocument();
    expect(screen.getByText('Section')).toBeInTheDocument();
  });
});
