import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from '../index';

describe('Select Component', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  it('renders select field', () => {
    render(<Select options={options} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Select label="Choose option" options={options} />);
    expect(screen.getByText('Choose option')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('shows required indicator when required', () => {
    render(<Select label="Choose option" options={options} required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(<Select options={options} error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('applies error styling when error is present', () => {
    render(<Select options={options} error="Error" />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('border-red-500');
  });

  it('renders all options', () => {
    render(<Select options={options} />);
    const select = screen.getByRole('combobox');
    expect(select.querySelectorAll('option')).toHaveLength(3);
  });

  it('handles user selection', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(<Select options={options} onChange={handleChange} />);
    const select = screen.getByRole('combobox');

    await user.selectOptions(select, 'option2');
    expect(handleChange).toHaveBeenCalled();
    expect(select).toHaveValue('option2');
  });

  it('can be disabled', () => {
    render(<Select options={options} disabled />);
    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('accepts custom className', () => {
    render(<Select options={options} className="custom-class" />);
    expect(screen.getByRole('combobox')).toHaveClass('custom-class');
  });

  it('displays helper text', () => {
    render(<Select options={options} helperText="Select your preferred option" />);
    expect(screen.getByText('Select your preferred option')).toBeInTheDocument();
  });
});
