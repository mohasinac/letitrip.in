import { render, screen } from '@testing-library/react';
import { Badge } from '../index';

describe('Badge Component', () => {
  it('renders badge with children', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('applies default variant by default', () => {
    const { container } = render(<Badge>Default</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('bg-gray-200');
  });

  it('applies primary variant', () => {
    const { container } = render(<Badge variant="primary">Primary</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('bg-blue-100');
  });

  it('applies success variant', () => {
    const { container } = render(<Badge variant="success">Success</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('bg-green-100');
  });

  it('applies warning variant', () => {
    const { container } = render(<Badge variant="warning">Warning</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('bg-yellow-100');
  });

  it('applies danger variant', () => {
    const { container } = render(<Badge variant="danger">Danger</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('bg-red-100');
  });

  it('applies small size', () => {
    const { container } = render(<Badge size="sm">Small</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('px-2', 'py-0.5', 'text-xs');
  });

  it('applies medium size by default', () => {
    const { container } = render(<Badge>Medium</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('px-2.5', 'py-1', 'text-sm');
  });

  it('applies large size', () => {
    const { container } = render(<Badge size="lg">Large</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('px-3', 'py-1.5', 'text-base');
  });

  it('can be rounded', () => {
    const { container } = render(<Badge rounded>Rounded</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('rounded-full');
  });

  it('uses rounded-lg by default', () => {
    const { container } = render(<Badge>Default</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('rounded-lg');
  });

  it('accepts custom className', () => {
    const { container } = render(<Badge className="custom-class">Custom</Badge>);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
