import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSeparator } from '../index';

describe('Dropdown', () => {
  const renderDropdown = () => {
    return render(
      <Dropdown>
        <DropdownTrigger>
          <button>Menu</button>
        </DropdownTrigger>
        <DropdownMenu>
          <DropdownItem onClick={() => {}}>Edit</DropdownItem>
          <DropdownItem onClick={() => {}}>Duplicate</DropdownItem>
          <DropdownSeparator />
          <DropdownItem onClick={() => {}} destructive>Delete</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    );
  };

  it('renders trigger button', () => {
    renderDropdown();
    expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument();
  });

  it('does not show menu initially', () => {
    renderDropdown();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('shows menu when trigger is clicked', async () => {
    const user = userEvent.setup();
    renderDropdown();
    
    const trigger = screen.getByRole('button', { name: 'Menu' });
    await user.click(trigger);
    
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument();
  });

  it('hides menu when trigger is clicked again', async () => {
    const user = userEvent.setup();
    renderDropdown();
    
    const trigger = screen.getByRole('button', { name: 'Menu' });
    await user.click(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    
    await user.click(trigger);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('calls onClick handler when menu item is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    
    render(
      <Dropdown>
        <DropdownTrigger>
          <button>Menu</button>
        </DropdownTrigger>
        <DropdownMenu>
          <DropdownItem onClick={handleClick}>Edit</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    );
    
    const trigger = screen.getByRole('button', { name: 'Menu' });
    await user.click(trigger);
    
    const menuItem = screen.getByRole('menuitem', { name: 'Edit' });
    await user.click(menuItem);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('closes menu after clicking a menu item', async () => {
    const user = userEvent.setup();
    renderDropdown();
    
    const trigger = screen.getByRole('button', { name: 'Menu' });
    await user.click(trigger);
    
    const menuItem = screen.getByRole('menuitem', { name: 'Edit' });
    await user.click(menuItem);
    
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('disables menu items when disabled prop is true', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    
    render(
      <Dropdown>
        <DropdownTrigger>
          <button>Menu</button>
        </DropdownTrigger>
        <DropdownMenu>
          <DropdownItem onClick={handleClick} disabled>Edit</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    );
    
    const trigger = screen.getByRole('button', { name: 'Menu' });
    await user.click(trigger);
    
    const menuItem = screen.getByRole('menuitem', { name: 'Edit' });
    expect(menuItem).toBeDisabled();
    
    await user.click(menuItem);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders destructive menu items', async () => {
    const user = userEvent.setup();
    renderDropdown();
    
    const trigger = screen.getByRole('button', { name: 'Menu' });
    await user.click(trigger);
    
    const deleteItem = screen.getByRole('menuitem', { name: 'Delete' });
    expect(deleteItem).toBeInTheDocument();
  });

  it('renders separator', async () => {
    const user = userEvent.setup();
    renderDropdown();
    
    const trigger = screen.getByRole('button', { name: 'Menu' });
    await user.click(trigger);
    
    const separators = screen.getAllByRole('separator');
    expect(separators.length).toBeGreaterThan(0);
  });

  it('supports menu alignment', async () => {
    const user = userEvent.setup();
    
    render(
      <Dropdown>
        <DropdownTrigger>
          <button>Menu</button>
        </DropdownTrigger>
        <DropdownMenu align="right">
          <DropdownItem onClick={() => {}}>Edit</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    );
    
    const trigger = screen.getByRole('button', { name: 'Menu' });
    await user.click(trigger);
    
    const menu = screen.getByRole('menu');
    expect(menu).toHaveClass('right-0');
  });

  it('renders menu items with icons', async () => {
    const user = userEvent.setup();
    const icon = <span data-testid="icon">📝</span>;
    
    render(
      <Dropdown>
        <DropdownTrigger>
          <button>Menu</button>
        </DropdownTrigger>
        <DropdownMenu>
          <DropdownItem onClick={() => {}} icon={icon}>Edit</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    );
    
    const trigger = screen.getByRole('button', { name: 'Menu' });
    await user.click(trigger);
    
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});
