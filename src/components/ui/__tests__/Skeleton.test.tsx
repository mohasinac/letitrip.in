import React from 'react';
import { render, screen } from '@testing-library/react';
import Skeleton, { SkeletonText, SkeletonCard, SkeletonAvatar } from '../Skeleton';

describe('Skeleton', () => {
  it('renders with default props', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector('[role="status"]');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute('aria-label', 'Loading');
  });

  it('renders text variant', () => {
    const { container } = render(<Skeleton variant="text" />);
    const skeleton = container.querySelector('[role="status"]');
    expect(skeleton).toHaveClass('rounded');
  });

  it('renders circular variant', () => {
    const { container } = render(<Skeleton variant="circular" />);
    const skeleton = container.querySelector('[role="status"]');
    expect(skeleton).toHaveClass('rounded-full');
  });

  it('renders rectangular variant', () => {
    const { container } = render(<Skeleton variant="rectangular" />);
    const skeleton = container.querySelector('[role="status"]');
    expect(skeleton).toHaveClass('rounded');
  });

  it('applies custom width', () => {
    const { container } = render(<Skeleton width="200px" />);
    const skeleton = container.querySelector('[role="status"]') as HTMLElement;
    expect(skeleton.style.width).toBe('200px');
  });

  it('applies custom height', () => {
    const { container } = render(<Skeleton height="100px" />);
    const skeleton = container.querySelector('[role="status"]') as HTMLElement;
    expect(skeleton.style.height).toBe('100px');
  });

  it('applies custom width and height as numbers', () => {
    const { container } = render(<Skeleton width={200} height={100} />);
    const skeleton = container.querySelector('[role="status"]') as HTMLElement;
    expect(skeleton.style.width).toBe('200px');
    expect(skeleton.style.height).toBe('100px');
  });

  it('renders with pulse animation by default', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector('[role="status"]');
    expect(skeleton).toHaveClass('animate-pulse');
  });

  it('renders with wave animation', () => {
    const { container } = render(<Skeleton animation="wave" />);
    const skeleton = container.querySelector('[role="status"]');
    expect(skeleton).toHaveClass('skeleton-wave');
  });

  it('renders without animation', () => {
    const { container } = render(<Skeleton animation="none" />);
    const skeleton = container.querySelector('[role="status"]');
    expect(skeleton).not.toHaveClass('animate-pulse');
    expect(skeleton).not.toHaveClass('skeleton-wave');
  });

  it('applies custom className', () => {
    const { container } = render(<Skeleton className="custom-skeleton" />);
    const skeleton = container.querySelector('[role="status"]');
    expect(skeleton).toHaveClass('custom-skeleton');
  });

  it('has screen reader text', () => {
    render(<Skeleton />);
    expect(screen.getByText('Loading...')).toHaveClass('sr-only');
  });
});

describe('SkeletonText', () => {
  it('renders default 3 lines', () => {
    const { container } = render(<SkeletonText />);
    const skeletons = container.querySelectorAll('[role="status"]');
    expect(skeletons.length).toBe(3);
  });

  it('renders custom number of lines', () => {
    const { container } = render(<SkeletonText lines={5} />);
    const skeletons = container.querySelectorAll('[role="status"]');
    expect(skeletons.length).toBe(5);
  });

  it('last line is 80% width', () => {
    const { container } = render(<SkeletonText lines={2} />);
    const skeletons = container.querySelectorAll('[role="status"]') as NodeListOf<HTMLElement>;
    const lastSkeleton = skeletons[skeletons.length - 1];
    expect(lastSkeleton.style.width).toBe('80%');
  });

  it('applies custom className', () => {
    const { container } = render(<SkeletonText className="custom-text" />);
    expect(container.querySelector('.custom-text')).toBeInTheDocument();
  });
});

describe('SkeletonCard', () => {
  it('renders card with image and text skeleton', () => {
    const { container } = render(<SkeletonCard />);
    const skeletons = container.querySelectorAll('[role="status"]');
    expect(skeletons.length).toBeGreaterThan(1);
  });

  it('has proper structure', () => {
    const { container } = render(<SkeletonCard />);
    expect(container.querySelector('.border')).toBeInTheDocument();
    expect(container.querySelector('.rounded-lg')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<SkeletonCard className="custom-card" />);
    expect(container.querySelector('.custom-card')).toBeInTheDocument();
  });
});

describe('SkeletonAvatar', () => {
  it('renders circular skeleton', () => {
    const { container } = render(<SkeletonAvatar />);
    const skeleton = container.querySelector('[role="status"]');
    expect(skeleton).toHaveClass('rounded-full');
  });

  it('renders with default size 40', () => {
    const { container } = render(<SkeletonAvatar />);
    const skeleton = container.querySelector('[role="status"]') as HTMLElement;
    expect(skeleton.style.width).toBe('40px');
    expect(skeleton.style.height).toBe('40px');
  });

  it('renders with custom size', () => {
    const { container } = render(<SkeletonAvatar size={60} />);
    const skeleton = container.querySelector('[role="status"]') as HTMLElement;
    expect(skeleton.style.width).toBe('60px');
    expect(skeleton.style.height).toBe('60px');
  });

  it('applies custom className', () => {
    const { container } = render(<SkeletonAvatar className="custom-avatar" />);
    const skeleton = container.querySelector('[role="status"]');
    expect(skeleton).toHaveClass('custom-avatar');
  });
});
