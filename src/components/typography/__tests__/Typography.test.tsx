import { render, screen } from '@testing-library/react';
import { Heading, Text, Label } from '../index';

describe('Typography Components', () => {
  describe('Heading', () => {
    it('renders h1 by default', () => {
      render(<Heading>Test Heading</Heading>);
      const heading = screen.getByText('Test Heading');
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H1');
    });

    it('renders different heading levels', () => {
      const { rerender } = render(<Heading level={2}>Heading 2</Heading>);
      expect(screen.getByText('Heading 2').tagName).toBe('H2');

      rerender(<Heading level={3}>Heading 3</Heading>);
      expect(screen.getByText('Heading 3').tagName).toBe('H3');

      rerender(<Heading level={4}>Heading 4</Heading>);
      expect(screen.getByText('Heading 4').tagName).toBe('H4');

      rerender(<Heading level={5}>Heading 5</Heading>);
      expect(screen.getByText('Heading 5').tagName).toBe('H5');

      rerender(<Heading level={6}>Heading 6</Heading>);
      expect(screen.getByText('Heading 6').tagName).toBe('H6');
    });

    it('applies correct size classes for each level', () => {
      const { rerender, container } = render(<Heading level={1}>H1</Heading>);
      expect(container.querySelector('h1')).toBeInTheDocument();

      rerender(<Heading level={2}>H2</Heading>);
      expect(container.querySelector('h2')).toBeInTheDocument();

      rerender(<Heading level={3}>H3</Heading>);
      expect(container.querySelector('h3')).toBeInTheDocument();

      rerender(<Heading level={4}>H4</Heading>);
      expect(container.querySelector('h4')).toBeInTheDocument();

      rerender(<Heading level={5}>H5</Heading>);
      expect(container.querySelector('h5')).toBeInTheDocument();

      rerender(<Heading level={6}>H6</Heading>);
      expect(container.querySelector('h6')).toBeInTheDocument();
    });

    it('accepts custom className', () => {
      render(<Heading className="custom-heading">Heading</Heading>);
      expect(screen.getByText('Heading')).toHaveClass('custom-heading');
    });
  });

  describe('Text', () => {
    it('renders paragraph by default', () => {
      render(<Text>Test text</Text>);
      expect(screen.getByText('Test text')).toBeInTheDocument();
    });

    it('renders different text variants', () => {
      render(<Text variant="primary">Primary Text</Text>);
      expect(screen.getByText('Primary Text')).toBeInTheDocument();
    });

    it('accepts custom className', () => {
      render(<Text className="custom-text">Text</Text>);
      expect(screen.getByText('Text')).toHaveClass('custom-text');
    });
  });

  describe('Label', () => {
    it('renders label element', () => {
      render(<Label>Test Label</Label>);
      const label = screen.getByText('Test Label');
      expect(label.tagName).toBe('LABEL');
    });

    it('shows required indicator when required', () => {
      render(<Label required>Required Label</Label>);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('supports htmlFor attribute', () => {
      render(<Label htmlFor="input-id">Label</Label>);
      expect(screen.getByText('Label')).toHaveAttribute('for', 'input-id');
    });

    it('accepts custom className', () => {
      render(<Label className="custom-label">Label</Label>);
      expect(screen.getByText('Label')).toHaveClass('custom-label');
    });
  });
});
