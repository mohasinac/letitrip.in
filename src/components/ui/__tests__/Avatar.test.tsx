import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Avatar, AvatarGroup } from '../index';

describe('Avatar', () => {
  it('renders with image', () => {
    render(<Avatar src="/test.jpg" alt="Test User" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/test.jpg');
    expect(img).toHaveAttribute('alt', 'Test User');
  });

  it('renders with initials when no image', () => {
    render(<Avatar initials="JD" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('falls back to initials on image error', async () => {
    const { rerender } = render(<Avatar src="/invalid.jpg" initials="JD" />);
    
    const img = screen.getByRole('img');
    img.dispatchEvent(new Event('error'));
    
    // Force a rerender to update the component
    rerender(<Avatar src="/invalid.jpg" initials="JD" />);
    
    await screen.findByText('JD');
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders default icon when no image or initials', () => {
    const { container } = render(<Avatar />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('applies size classes correctly', () => {
    const { rerender, container } = render(<Avatar size="sm" />);
    // Select the inner div which has the size classes
    let avatar = container.querySelector('.w-8');
    expect(avatar).toHaveClass('w-8', 'h-8');
    
    rerender(<Avatar size="xl" />);
    avatar = container.querySelector('.w-16');
    expect(avatar).toHaveClass('w-16', 'h-16');
  });

  it('renders with status indicator', () => {
    const { container } = render(<Avatar src="/test.jpg" status="online" />);
    const statusBadge = container.querySelector('[aria-label="Status: online"]');
    expect(statusBadge).toBeInTheDocument();
    expect(statusBadge).toHaveClass('bg-green-500');
  });

  it('renders different status colors', () => {
    const { rerender, container } = render(<Avatar status="online" />);
    let status = container.querySelector('span[aria-label^="Status:"]');
    expect(status).toHaveClass('bg-green-500');
    
    rerender(<Avatar status="busy" />);
    status = container.querySelector('span[aria-label^="Status:"]');
    expect(status).toHaveClass('bg-red-500');
    
    rerender(<Avatar status="away" />);
    status = container.querySelector('span[aria-label^="Status:"]');
    expect(status).toHaveClass('bg-yellow-500');
    
    rerender(<Avatar status="offline" />);
    status = container.querySelector('span[aria-label^="Status:"]');
    expect(status).toHaveClass('bg-gray-100');
  });

  it('applies custom className', () => {
    const { container } = render(<Avatar className="custom-avatar" />);
    expect(container.firstChild).toHaveClass('custom-avatar');
  });
});

describe('AvatarGroup', () => {
  it('renders multiple avatars', () => {
    render(
      <AvatarGroup>
        <Avatar initials="A" />
        <Avatar initials="B" />
        <Avatar initials="C" />
      </AvatarGroup>
    );
    
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  it('limits displayed avatars with max prop', () => {
    render(
      <AvatarGroup max={2}>
        <Avatar initials="A" />
        <Avatar initials="B" />
        <Avatar initials="C" />
        <Avatar initials="D" />
      </AvatarGroup>
    );
    
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.queryByText('C')).not.toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('shows remaining count', () => {
    render(
      <AvatarGroup max={3}>
        <Avatar initials="A" />
        <Avatar initials="B" />
        <Avatar initials="C" />
        <Avatar initials="D" />
        <Avatar initials="E" />
      </AvatarGroup>
    );
    
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <AvatarGroup className="custom-group">
        <Avatar initials="A" />
      </AvatarGroup>
    );
    
    expect(container.firstChild).toHaveClass('custom-group');
  });

  it('applies negative margin for overlap', () => {
    const { container } = render(
      <AvatarGroup>
        <Avatar initials="A" />
        <Avatar initials="B" />
      </AvatarGroup>
    );
    
    expect(container.firstChild).toHaveClass('-space-x-2');
  });
});
