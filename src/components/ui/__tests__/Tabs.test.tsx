import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../index';

describe('Tabs', () => {
  const renderTabs = (props = {}) => {
    return render(
      <Tabs defaultValue="tab1" {...props}>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
        <TabsContent value="tab3">Content 3</TabsContent>
      </Tabs>
    );
  };

  it('renders tabs with default selected tab', () => {
    renderTabs();
    
    expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
  });

  it('switches tabs on click', async () => {
    const user = userEvent.setup();
    renderTabs();
    
    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
    await user.click(tab2);
    
    expect(tab2).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Content 2')).toBeInTheDocument();
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
  });

  it('calls onChange when tab is clicked', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    
    render(
      <Tabs defaultValue="tab1" onChange={handleChange}>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );
    
    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
    await user.click(tab2);
    
    expect(handleChange).toHaveBeenCalledWith('tab2');
  });

  it('supports controlled mode', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    const { rerender } = render(
      <Tabs value="tab1" onChange={handleChange}>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );
    
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    
    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
    await user.click(tab2);
    
    expect(handleChange).toHaveBeenCalledWith('tab2');
    
    // Parent controls the value
    rerender(
      <Tabs value="tab2" onChange={handleChange}>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );
    
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('disables tabs when disabled prop is true', async () => {
    const user = userEvent.setup();
    
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2" disabled>Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );
    
    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
    expect(tab2).toBeDisabled();
    
    await user.click(tab2);
    
    // Content should not change
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
  });

  it('applies custom className to components', () => {
    render(
      <Tabs defaultValue="tab1" className="custom-tabs">
        <TabsList className="custom-list">
          <TabsTrigger value="tab1" className="custom-trigger">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" className="custom-content">Content 1</TabsContent>
      </Tabs>
    );
    
    expect(screen.getByRole('tablist')).toHaveClass('custom-list');
    expect(screen.getByRole('tab')).toHaveClass('custom-trigger');
    expect(screen.getByRole('tabpanel')).toHaveClass('custom-content');
  });
});
