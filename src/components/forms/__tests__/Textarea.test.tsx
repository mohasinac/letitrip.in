import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from '../index';

describe('Textarea Component', () => {
  it('renders textarea field', () => {
    render(<Textarea />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Textarea label="Description" />);
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('shows required indicator when required', () => {
    render(<Textarea label="Description" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(<Textarea error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('displays helper text', () => {
    render(<Textarea helperText="Enter a detailed description" />);
    expect(screen.getByText('Enter a detailed description')).toBeInTheDocument();
  });

  it('applies error styling when error is present', () => {
    render(<Textarea error="Error" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('border-red-500');
  });

  it('handles user input', async () => {
    const user = userEvent.setup();
    render(<Textarea />);
    const textarea = screen.getByRole('textbox');

    await user.type(textarea, 'This is a long description');
    expect(textarea).toHaveValue('This is a long description');
  });

  it('can be disabled', () => {
    render(<Textarea disabled />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeDisabled();
  });

  it('accepts custom className', () => {
    render(<Textarea className="custom-class" />);
    expect(screen.getByRole('textbox')).toHaveClass('custom-class');
  });

  it('supports placeholder', () => {
    render(<Textarea placeholder="Enter description" />);
    expect(screen.getByPlaceholderText('Enter description')).toBeInTheDocument();
  });

  it('supports custom rows', () => {
    render(<Textarea rows={10} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('rows', '10');
  });
});
