import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from '../index';

describe('Checkbox Component', () => {
  it('renders checkbox', () => {
    render(<Checkbox label="Accept terms" />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Checkbox label="Accept terms" />);
    expect(screen.getByLabelText('Accept terms')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(<Checkbox label="Accept" error="You must accept terms" />);
    expect(screen.getByText('You must accept terms')).toBeInTheDocument();
  });

  it('applies error styling when error is present', () => {
    render(<Checkbox label="Accept" error="Error" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveClass('border-red-500');
  });

  it('handles check/uncheck', async () => {
    const user = userEvent.setup();
    render(<Checkbox label="Accept terms" />);
    const checkbox = screen.getByRole('checkbox');

    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('can be disabled', () => {
    render(<Checkbox label="Accept terms" disabled />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
  });

  it('can be checked by default', () => {
    render(<Checkbox label="Accept terms" defaultChecked />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('calls onChange when checked', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(<Checkbox label="Accept terms" onChange={handleChange} />);
    const checkbox = screen.getByRole('checkbox');

    await user.click(checkbox);
    expect(handleChange).toHaveBeenCalled();
  });

  it('accepts custom className', () => {
    render(<Checkbox label="Accept" className="custom-class" />);
    expect(screen.getByRole('checkbox')).toHaveClass('custom-class');
  });

  it('supports controlled component pattern', () => {
    const { rerender } = render(<Checkbox label="Accept" checked={false} onChange={() => {}} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    rerender(<Checkbox label="Accept" checked={true} onChange={() => {}} />);
    expect(checkbox).toBeChecked();
  });
});
