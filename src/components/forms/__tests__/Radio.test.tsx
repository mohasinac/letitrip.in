import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RadioGroup } from '../index';

describe('Radio Component', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  describe('RadioGroup', () => {
    it('renders radio group with label', () => {
      render(<RadioGroup label="Choose option" name="test" options={options} />);
      expect(screen.getByText('Choose option')).toBeInTheDocument();
    });

    it('renders all radio options', () => {
      render(<RadioGroup name="test" options={options} />);
      expect(screen.getAllByRole('radio')).toHaveLength(3);
    });

    it('renders radio labels', () => {
      render(<RadioGroup name="test" options={options} />);
      expect(screen.getByLabelText('Option 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Option 2')).toBeInTheDocument();
      expect(screen.getByLabelText('Option 3')).toBeInTheDocument();
    });

    it('handles radio selection', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<RadioGroup name="test" options={options} onChange={handleChange} />);
      
      await user.click(screen.getByLabelText('Option 2'));
      expect(handleChange).toHaveBeenCalled();
    });

    it('displays error message', () => {
      render(<RadioGroup name="test" options={options} error="Selection required" />);
      expect(screen.getByText('Selection required')).toBeInTheDocument();
    });

    it('supports horizontal orientation', () => {
      const { container } = render(
        <RadioGroup name="test" options={options} orientation="horizontal" />
      );
      const radioGroup = container.querySelector('.flex-row, .space-x-4');
      expect(radioGroup).toBeInTheDocument();
    });

    it('supports vertical orientation', () => {
      const { container } = render(
        <RadioGroup name="test" options={options} orientation="vertical" />
      );
      const radioGroup = container.querySelector('.flex-col, .space-y-2');
      expect(radioGroup).toBeInTheDocument();
    });
  });
});
