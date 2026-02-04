import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '../index';

describe('Modal Component', () => {
  it('renders modal when isOpen is true', () => {
    render(
      <Modal isOpen onClose={() => {}}>
        <div>Modal content</div>
      </Modal>
    );
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render modal when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}}>
        <div>Modal content</div>
      </Modal>
    );
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  it('renders modal with title', () => {
    render(
      <Modal isOpen title="Test Modal" onClose={() => {}}>
        <div>Content</div>
      </Modal>
    );
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  it('shows close button by default', () => {
    render(
      <Modal isOpen onClose={() => {}}>
        <div>Content</div>
      </Modal>
    );
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const handleClose = jest.fn();
    render(
      <Modal isOpen onClose={handleClose}>
        <div>Content</div>
      </Modal>
    );

    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(handleClose).toHaveBeenCalled();
  });

  it('calls onClose when backdrop is clicked', async () => {
    const user = userEvent.setup();
    const handleClose = jest.fn();
    const { container } = render(
      <Modal isOpen onClose={handleClose}>
        <div>Content</div>
      </Modal>
    );

    const backdrop = container.querySelector('.backdrop, [data-backdrop]');
    if (backdrop) {
      await user.click(backdrop);
      expect(handleClose).toHaveBeenCalled();
    }
  });

  it('does not call onClose when modal content is clicked', async () => {
    const user = userEvent.setup();
    const handleClose = jest.fn();
    render(
      <Modal isOpen onClose={handleClose}>
        <div>Content</div>
      </Modal>
    );

    await user.click(screen.getByText('Content'));
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('calls onClose when Escape key is pressed', async () => {
    const user = userEvent.setup();
    const handleClose = jest.fn();
    render(
      <Modal isOpen onClose={handleClose}>
        <div>Content</div>
      </Modal>
    );

    await user.keyboard('{Escape}');
    expect(handleClose).toHaveBeenCalled();
  });

  it('hides close button when showCloseButton is false', () => {
    render(
      <Modal isOpen showCloseButton={false} onClose={() => {}}>
        <div>Content</div>
      </Modal>
    );
    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
  });

  it('prevents background scroll when modal is open', () => {
    render(
      <Modal isOpen onClose={() => {}}>
        <div>Content</div>
      </Modal>
    );
    // Check if body has overflow-hidden or similar class
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores background scroll when modal is closed', () => {
    const { rerender } = render(
      <Modal isOpen onClose={() => {}}>
        <div>Content</div>
      </Modal>
    );

    rerender(
      <Modal isOpen={false} onClose={() => {}}>
        <div>Content</div>
      </Modal>
    );

    expect(document.body.style.overflow).toBe('');
  });
});
