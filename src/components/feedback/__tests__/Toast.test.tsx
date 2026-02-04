import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ToastProvider, useToast } from '../index';

// Test component that uses the toast hook
function TestComponent() {
  const { showToast } = useToast();
  
  return (
    <div>
      <button onClick={() => showToast('Success message', 'success')}>
        Show Success
      </button>
      <button onClick={() => showToast('Error message', 'error')}>
        Show Error
      </button>
      <button onClick={() => showToast('Warning message', 'warning')}>
        Show Warning
      </button>
      <button onClick={() => showToast('Info message', 'info')}>
        Show Info
      </button>
    </div>
  );
}

describe('Toast', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders toast provider without errors', () => {
    render(
      <ToastProvider>
        <div>Content</div>
      </ToastProvider>
    );
    
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('shows toast when showToast is called', async () => {
    const user = userEvent.setup({ delay: null });
    
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    const button = screen.getByRole('button', { name: 'Show Success' });
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Success message')).toBeInTheDocument();
    });
  });

  it('shows different toast variants', async () => {
    const user = userEvent.setup({ delay: null });
    
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    await user.click(screen.getByRole('button', { name: 'Show Error' }));
    
    await waitFor(() => {
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  it('closes toast when close button is clicked', async () => {
    const user = userEvent.setup({ delay: null });
    
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    await user.click(screen.getByRole('button', { name: 'Show Success' }));
    
    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument();
    });
    
    const closeButton = screen.getByRole('button', { name: 'Close notification' });
    await user.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Success message')).not.toBeInTheDocument();
    });
  });

  it('auto-dismisses toast after duration', async () => {
    const user = userEvent.setup({ delay: null });
    
    render(
      <ToastProvider>
        <button onClick={() => {
          const { showToast } = { showToast: (msg: string) => {} };
        }}>
          Test
        </button>
        <TestComponent />
      </ToastProvider>
    );
    
    await user.click(screen.getByRole('button', { name: 'Show Info' }));
    
    await waitFor(() => {
      expect(screen.getByText('Info message')).toBeInTheDocument();
    });
    
    // Fast-forward time by 5000ms (default duration)
    jest.advanceTimersByTime(5000);
    
    await waitFor(() => {
      expect(screen.queryByText('Info message')).not.toBeInTheDocument();
    });
  });

  it('supports multiple toasts simultaneously', async () => {
    const user = userEvent.setup({ delay: null });
    
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    await user.click(screen.getByRole('button', { name: 'Show Success' }));
    await user.click(screen.getByRole('button', { name: 'Show Error' }));
    
    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  it('supports different toast positions', () => {
    const { container } = render(
      <ToastProvider position="bottom-right">
        <div>Content</div>
      </ToastProvider>
    );
    
    const toastContainer = container.querySelector('[aria-live="polite"]');
    expect(toastContainer).toHaveClass('bottom-4', 'right-4');
  });

  it('throws error when useToast is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useToast must be used within ToastProvider');
    
    consoleSpy.mockRestore();
  });
});
