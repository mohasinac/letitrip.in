import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Breadcrumbs, { BreadcrumbItem } from '../Breadcrumbs';

describe('Breadcrumbs', () => {
  it('renders breadcrumb items', () => {
    render(
      <Breadcrumbs>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/products">Products</BreadcrumbItem>
        <BreadcrumbItem current>Detail</BreadcrumbItem>
      </Breadcrumbs>
    );
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Detail')).toBeInTheDocument();
  });

  it('has proper navigation landmark', () => {
    render(
      <Breadcrumbs>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
      </Breadcrumbs>
    );
    
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByLabelText('Breadcrumb')).toBeInTheDocument();
  });

  it('renders default separator between items', () => {
    const { container } = render(
      <Breadcrumbs>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem current>Current</BreadcrumbItem>
      </Breadcrumbs>
    );
    
    expect(container.textContent).toContain('/');
  });

  it('renders custom separator', () => {
    render(
      <Breadcrumbs separator=">">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem current>Current</BreadcrumbItem>
      </Breadcrumbs>
    );
    
    expect(screen.getByText('>')).toBeInTheDocument();
  });

  it('does not render separator after last item', () => {
    const { container } = render(
      <Breadcrumbs>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem current>Current</BreadcrumbItem>
      </Breadcrumbs>
    );
    
    const separators = container.querySelectorAll('[aria-hidden="true"]');
    expect(separators).toHaveLength(1);
  });

  it('marks current item with aria-current', () => {
    render(
      <Breadcrumbs>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem current>Current</BreadcrumbItem>
      </Breadcrumbs>
    );
    
    const currentItem = screen.getByText('Current');
    expect(currentItem).toHaveAttribute('aria-current', 'page');
  });

  it('renders links with href', () => {
    render(
      <Breadcrumbs>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/products">Products</BreadcrumbItem>
      </Breadcrumbs>
    );
    
    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('calls onClick when item is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    
    render(
      <Breadcrumbs>
        <BreadcrumbItem onClick={handleClick}>Clickable</BreadcrumbItem>
      </Breadcrumbs>
    );
    
    const button = screen.getByRole('button', { name: 'Clickable' });
    await user.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    render(
      <Breadcrumbs className="custom-breadcrumbs">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
      </Breadcrumbs>
    );
    
    expect(screen.getByRole('navigation')).toHaveClass('custom-breadcrumbs');
  });

  it('applies custom className to items', () => {
    render(
      <Breadcrumbs>
        <BreadcrumbItem className="custom-item" href="/">Home</BreadcrumbItem>
      </Breadcrumbs>
    );
    
    expect(screen.getByRole('link')).toHaveClass('custom-item');
  });
});
