import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Slider from '../Slider';

describe('Slider', () => {
  it('renders with default value', () => {
    render(<Slider defaultValue={50} />);
    const slider = screen.getByRole('slider');
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveValue('50');
  });

  it('renders with label', () => {
    render(<Slider label="Volume" defaultValue={50} />);
    expect(screen.getByLabelText('Volume')).toBeInTheDocument();
    expect(screen.getByText('Volume')).toBeInTheDocument();
  });

  it('shows value when showValue is true', () => {
    render(<Slider defaultValue={75} showValue />);
    expect(screen.getByText('75')).toBeInTheDocument();
  });

  it('handles controlled value', () => {
    const ControlledSlider = () => {
      const [value, setValue] = useState(30);
      return (
        <div>
          <Slider value={value} onChange={setValue} />
          <span data-testid="value">{value}</span>
        </div>
      );
    };

    render(<ControlledSlider />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveValue('30');
  });

  it('calls onChange when value changes', async () => {
    const handleChange = jest.fn();
    render(<Slider defaultValue={50} onChange={handleChange} />);
    
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '75' } });
    
    expect(handleChange).toHaveBeenCalledWith(75);
  });

  it('calls onChangeEnd on mouse up', () => {
    const handleChangeEnd = jest.fn();
    const { container } = render(<Slider defaultValue={50} onChangeEnd={handleChangeEnd} />);
    
    const slider = container.querySelector('input[type="range"]') as HTMLInputElement;
    slider.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    
    expect(handleChangeEnd).toHaveBeenCalledWith(50);
  });

  it('respects min and max values', () => {
    render(<Slider min={10} max={90} defaultValue={50} />);
    const slider = screen.getByRole('slider');
    
    expect(slider).toHaveAttribute('min', '10');
    expect(slider).toHaveAttribute('max', '90');
  });

  it('respects step value', () => {
    render(<Slider step={5} defaultValue={50} />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('step', '5');
  });

  it('renders disabled state', () => {
    render(<Slider disabled defaultValue={50} />);
    const slider = screen.getByRole('slider');
    expect(slider).toBeDisabled();
  });

  it('renders different sizes', () => {
    const { container: containerSm } = render(<Slider size="sm" defaultValue={50} />);
    const { container: containerMd } = render(<Slider size="md" defaultValue={50} />);
    const { container: containerLg } = render(<Slider size="lg" defaultValue={50} />);

    expect(containerSm.querySelector('.h-1')).toBeInTheDocument();
    expect(containerMd.querySelector('.h-2')).toBeInTheDocument();
    expect(containerLg.querySelector('.h-3')).toBeInTheDocument();
  });

  it('has proper ARIA attributes', () => {
    render(<Slider min={0} max={100} defaultValue={50} label="Volume Control" />);
    const slider = screen.getByRole('slider');
    
    expect(slider).toHaveAttribute('aria-valuemin', '0');
    expect(slider).toHaveAttribute('aria-valuemax', '100');
    expect(slider).toHaveAttribute('aria-valuenow', '50');
    expect(slider).toHaveAttribute('aria-label', 'Volume Control');
  });

  it('updates uncontrolled value on change', () => {
    render(<Slider defaultValue={50} showValue />);
    
    const slider = screen.getByRole('slider') as HTMLInputElement;
    
    // Simulate changing the value
    fireEvent.change(slider, { target: { value: '80' } });
    
    expect(slider.value).toBe('80');
  });

  it('shows fill percentage based on value', () => {
    const { container } = render(<Slider min={0} max={100} defaultValue={60} />);
    const fill = container.querySelector('.slider-fill') as HTMLElement;
    
    expect(fill).toBeInTheDocument();
    expect(fill.style.width).toBe('60%');
  });

  it('applies custom className', () => {
    const { container } = render(<Slider className="custom-class" defaultValue={50} />);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});
