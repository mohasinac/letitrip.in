import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pagination from '../Pagination';

describe('Pagination', () => {
  it('renders page numbers', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={jest.fn()} />);
    
    expect(screen.getByLabelText('Go to page 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to page 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to page 5')).toBeInTheDocument();
  });

  it('highlights current page', () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={jest.fn()} />);
    
    const currentPageButton = screen.getByLabelText('Go to page 3');
    expect(currentPageButton).toHaveAttribute('aria-current', 'page');
    expect(currentPageButton).toHaveClass('bg-blue-600');
  });

  it('calls onPageChange when page is clicked', async () => {
    const user = userEvent.setup();
    const handlePageChange = jest.fn();
    render(<Pagination currentPage={1} totalPages={5} onPageChange={handlePageChange} />);
    
    await user.click(screen.getByLabelText('Go to page 3'));
    expect(handlePageChange).toHaveBeenCalledWith(3);
  });

  it('renders first/last buttons when showFirstLast is true', () => {
    render(<Pagination currentPage={3} totalPages={10} onPageChange={jest.fn()} showFirstLast />);
    
    expect(screen.getByLabelText('Go to first page')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to last page')).toBeInTheDocument();
  });

  it('hides first/last buttons when showFirstLast is false', () => {
    render(<Pagination currentPage={3} totalPages={10} onPageChange={jest.fn()} showFirstLast={false} />);
    
    expect(screen.queryByLabelText('Go to first page')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Go to last page')).not.toBeInTheDocument();
  });

  it('renders prev/next buttons when showPrevNext is true', () => {
    render(<Pagination currentPage={3} totalPages={10} onPageChange={jest.fn()} showPrevNext />);
    
    expect(screen.getByLabelText('Go to previous page')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to next page')).toBeInTheDocument();
  });

  it('hides prev/next buttons when showPrevNext is false', () => {
    render(<Pagination currentPage={3} totalPages={10} onPageChange={jest.fn()} showPrevNext={false} />);
    
    expect(screen.queryByLabelText('Go to previous page')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Go to next page')).not.toBeInTheDocument();
  });

  it('disables previous button on first page', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={jest.fn()} />);
    
    expect(screen.getByLabelText('Go to previous page')).toBeDisabled();
    expect(screen.getByLabelText('Go to first page')).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={jest.fn()} />);
    
    expect(screen.getByLabelText('Go to next page')).toBeDisabled();
    expect(screen.getByLabelText('Go to last page')).toBeDisabled();
  });

  it('navigates to previous page', async () => {
    const user = userEvent.setup();
    const handlePageChange = jest.fn();
    render(<Pagination currentPage={3} totalPages={5} onPageChange={handlePageChange} />);
    
    await user.click(screen.getByLabelText('Go to previous page'));
    expect(handlePageChange).toHaveBeenCalledWith(2);
  });

  it('navigates to next page', async () => {
    const user = userEvent.setup();
    const handlePageChange = jest.fn();
    render(<Pagination currentPage={3} totalPages={5} onPageChange={handlePageChange} />);
    
    await user.click(screen.getByLabelText('Go to next page'));
    expect(handlePageChange).toHaveBeenCalledWith(4);
  });

  it('shows ellipsis for large page counts', () => {
    render(<Pagination currentPage={10} totalPages={50} onPageChange={jest.fn()} maxVisible={7} />);
    
    const ellipses = screen.getAllByText('...');
    expect(ellipses.length).toBeGreaterThan(0);
  });

  it('works in controlled mode', async () => {
    const user = userEvent.setup();
    const ControlledPagination = () => {
      const [page, setPage] = useState(1);
      return (
        <div>
          <Pagination currentPage={page} totalPages={5} onPageChange={setPage} />
          <span data-testid="current-page">{page}</span>
        </div>
      );
    };

    render(<ControlledPagination />);
    expect(screen.getByTestId('current-page')).toHaveTextContent('1');
    
    await user.click(screen.getByLabelText('Go to page 3'));
    expect(screen.getByTestId('current-page')).toHaveTextContent('3');
  });

  it('disables all buttons when disabled prop is true', () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={jest.fn()} disabled />);
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      if (!button.getAttribute('aria-current')) {
        expect(button).toBeDisabled();
      }
    });
  });

  it('renders different sizes', () => {
    const { container: containerSm } = render(
      <Pagination currentPage={1} totalPages={3} onPageChange={jest.fn()} size="sm" />
    );
    const { container: containerMd } = render(
      <Pagination currentPage={1} totalPages={3} onPageChange={jest.fn()} size="md" />
    );
    const { container: containerLg } = render(
      <Pagination currentPage={1} totalPages={3} onPageChange={jest.fn()} size="lg" />
    );

    expect(containerSm.querySelector('.text-sm')).toBeInTheDocument();
    expect(containerMd.querySelector('.text-base')).toBeInTheDocument();
    expect(containerLg.querySelector('.text-lg')).toBeInTheDocument();
  });

  it('does not call onPageChange for current page', async () => {
    const user = userEvent.setup();
    const handlePageChange = jest.fn();
    render(<Pagination currentPage={3} totalPages={5} onPageChange={handlePageChange} />);
    
    await user.click(screen.getByLabelText('Go to page 3'));
    expect(handlePageChange).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={5} onPageChange={jest.fn()} className="custom-class" />
    );
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});
