import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Accordion, AccordionItem } from '../index';

describe('Accordion', () => {
  const renderAccordion = () => {
    return render(
      <Accordion>
        <AccordionItem value="1" title="Section 1">
          Content for section 1
        </AccordionItem>
        <AccordionItem value="2" title="Section 2">
          Content for section 2
        </AccordionItem>
        <AccordionItem value="3" title="Section 3">
          Content for section 3
        </AccordionItem>
      </Accordion>
    );
  };

  it('renders accordion items', () => {
    renderAccordion();
    
    expect(screen.getByText('Section 1')).toBeInTheDocument();
    expect(screen.getByText('Section 2')).toBeInTheDocument();
    expect(screen.getByText('Section 3')).toBeInTheDocument();
  });

  it('content is hidden by default', () => {
    renderAccordion();
    
    expect(screen.queryByText('Content for section 1')).not.toBeInTheDocument();
  });

  it('opens item when clicked', async () => {
    const user = userEvent.setup();
    renderAccordion();
    
    const trigger = screen.getByText('Section 1');
    await user.click(trigger);
    
    expect(screen.getByText('Content for section 1')).toBeVisible();
  });

  it('closes item when clicked again', async () => {
    const user = userEvent.setup();
    renderAccordion();
    
    const trigger = screen.getByText('Section 1');
    await user.click(trigger);
    expect(screen.getByText('Content for section 1')).toBeVisible();
    
    await user.click(trigger);
    expect(screen.queryByText('Content for section 1')).not.toBeInTheDocument();
  });

  it('single mode: closes other items when opening new one', async () => {
    const user = userEvent.setup();
    render(
      <Accordion type="single">
        <AccordionItem value="1" title="Section 1">
          Content 1
        </AccordionItem>
        <AccordionItem value="2" title="Section 2">
          Content 2
        </AccordionItem>
      </Accordion>
    );
    
    await user.click(screen.getByText('Section 1'));
    expect(screen.getByText('Content 1')).toBeVisible();
    
    await user.click(screen.getByText('Section 2'));
    expect(screen.getByText('Content 2')).toBeInTheDocument();
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
  });

  it('multiple mode: allows multiple items open', async () => {
    const user = userEvent.setup();
    render(
      <Accordion type="multiple">
        <AccordionItem value="1" title="Section 1">
          Content 1
        </AccordionItem>
        <AccordionItem value="2" title="Section 2">
          Content 2
        </AccordionItem>
      </Accordion>
    );
    
    await user.click(screen.getByText('Section 1'));
    await user.click(screen.getByText('Section 2'));
    
    expect(screen.getByText('Content 1')).toBeVisible();
    expect(screen.getByText('Content 2')).toBeVisible();
  });

  it('supports defaultValue for single type', () => {
    render(
      <Accordion type="single" defaultValue="2">
        <AccordionItem value="1" title="Section 1">
          Content 1
        </AccordionItem>
        <AccordionItem value="2" title="Section 2">
          Content 2
        </AccordionItem>
      </Accordion>
    );
    
    expect(screen.getByText('Content 2')).toBeInTheDocument();
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
  });

  it('supports defaultValue array for multiple type', () => {
    render(
      <Accordion type="multiple" defaultValue={['1', '3']}>
        <AccordionItem value="1" title="Section 1">
          Content 1
        </AccordionItem>
        <AccordionItem value="2" title="Section 2">
          Content 2
        </AccordionItem>
        <AccordionItem value="3" title="Section 3">
          Content 3
        </AccordionItem>
      </Accordion>
    );
    
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
    expect(screen.getByText('Content 3')).toBeInTheDocument();
  });

  it('disables accordion item when disabled prop is true', async () => {
    const user = userEvent.setup();
    render(
      <Accordion>
        <AccordionItem value="1" title="Disabled Section" disabled>
          Content
        </AccordionItem>
      </Accordion>
    );
    
    const trigger = screen.getByRole('button', { name: /Disabled Section/i });
    expect(trigger).toBeDisabled();
    
    await user.click(trigger);
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('updates aria-expanded attribute', async () => {
    const user = userEvent.setup();
    renderAccordion();
    
    const trigger = screen.getByRole('button', { name: /Section 1/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('applies custom className', () => {
    const { container } = render(
      <Accordion className="custom-accordion">
        <AccordionItem value="1" title="Section 1">
          Content
        </AccordionItem>
      </Accordion>
    );
    
    expect(container.firstChild).toHaveClass('custom-accordion');
  });
});
