import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Alert } from '../index';

describe('Alert Component', () => {
  it('renders alert with message', () => {
    render(<Alert>Test alert message</Alert>);
    expect(screen.getByText('Test alert message')).toBeInTheDocument();
  });

  it('renders default variant (info)', () => {
    const { container } = render(<Alert>Info message</Alert>);
    const alert = container.querySelector('.bg-blue-50, .bg-blue-100');
    expect(alert).toBeInTheDocument();
  });

  it('renders success variant', () => {
    const { container } = render(<Alert variant="success">Success message</Alert>);
    const alert = container.querySelector('.bg-green-50, .bg-green-100');
    expect(alert).toBeInTheDocument();
  });

  it('renders warning variant', () => {
    const { container } = render(<Alert variant="warning">Warning message</Alert>);
    const alert = container.querySelector('.bg-yellow-50, .bg-yellow-100');
    expect(alert).toBeInTheDocument();
  });

  it('renders error variant', () => {
    const { container } = render(<Alert variant="error">Error message</Alert>);
    const alert = container.querySelector('.bg-red-50, .bg-red-100');
    expect(alert).toBeInTheDocument();
  });

  it('renders with title', () => {
    render(<Alert title="Alert Title">Message content</Alert>);
    expect(screen.getByText('Alert Title')).toBeInTheDocument();
    expect(screen.getByText('Message content')).toBeInTheDocument();
  });

  it('does not show close button by default', () => {
    render(<Alert>Non-dismissible alert</Alert>);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('accepts custom className', () => {
    const { container } = render(<Alert className="custom-alert">Message</Alert>);
    expect(container.querySelector('.custom-alert')).toBeInTheDocument();
  });
});
