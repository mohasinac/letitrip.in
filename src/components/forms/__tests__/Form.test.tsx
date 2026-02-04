import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form, FormGroup, FormActions, Input } from '../index';
import { Button } from '../../ui/index';

describe('Form Components', () => {
  describe('Form', () => {
    it('renders form element', () => {
      render(<Form><div>Form content</div></Form>);
      expect(screen.getByText('Form content')).toBeInTheDocument();
    });

    it('handles form submission', async () => {
      const user = userEvent.setup();
      const handleSubmit = jest.fn((e) => e.preventDefault());
      render(
        <Form onSubmit={handleSubmit}>
          <Button type="submit">Submit</Button>
        </Form>
      );

      await user.click(screen.getByRole('button', { name: 'Submit' }));
      expect(handleSubmit).toHaveBeenCalled();
    });

    it('accepts custom className', () => {
      const { container } = render(<Form className="custom-form">Content</Form>);
      expect(container.querySelector('.custom-form')).toBeInTheDocument();
    });
  });

  describe('FormGroup', () => {
    it('renders form group', () => {
      render(<FormGroup><Input label="Name" /></FormGroup>);
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders multiple form fields', () => {
      render(
        <FormGroup>
          <Input label="First Name" />
          <Input label="Last Name" />
        </FormGroup>
      );
      expect(screen.getByText('First Name')).toBeInTheDocument();
      expect(screen.getByText('Last Name')).toBeInTheDocument();
    });

    it('accepts custom className', () => {
      const { container } = render(
        <FormGroup className="custom-group">
          <Input label="Name" />
        </FormGroup>
      );
      expect(container.querySelector('.custom-group')).toBeInTheDocument();
    });
  });

  describe('FormActions', () => {
    it('renders form actions', () => {
      render(
        <FormActions>
          <Button>Submit</Button>
        </FormActions>
      );
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });

    it('renders multiple buttons', () => {
      render(
        <FormActions>
          <Button variant="outline">Cancel</Button>
          <Button>Submit</Button>
        </FormActions>
      );
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });

    it('aligns buttons to the right by default', () => {
      const { container } = render(
        <FormActions>
          <Button>Submit</Button>
        </FormActions>
      );
      const actions = container.querySelector('.justify-end');
      expect(actions).toBeInTheDocument();
    });

    it('supports left alignment', () => {
      const { container } = render(
        <FormActions align="left">
          <Button>Submit</Button>
        </FormActions>
      );
      const actions = container.querySelector('.justify-start');
      expect(actions).toBeInTheDocument();
    });

    it('supports center alignment', () => {
      const { container } = render(
        <FormActions align="center">
          <Button>Submit</Button>
        </FormActions>
      );
      const actions = container.querySelector('.justify-center');
      expect(actions).toBeInTheDocument();
    });

    it('accepts custom className', () => {
      const { container } = render(
        <FormActions className="custom-actions">
          <Button>Submit</Button>
        </FormActions>
      );
      expect(container.querySelector('.custom-actions')).toBeInTheDocument();
    });
  });

  describe('Form Integration', () => {
    it('renders complete form with all components', () => {
      render(
        <Form>
          <FormGroup>
            <Input label="Name" />
            <Input label="Email" type="email" />
          </FormGroup>
          <FormActions>
            <Button variant="outline">Cancel</Button>
            <Button type="submit">Submit</Button>
          </FormActions>
        </Form>
      );

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });
  });
});
