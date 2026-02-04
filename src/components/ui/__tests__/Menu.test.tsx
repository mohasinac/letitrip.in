import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Menu, { MenuTrigger, MenuContent, MenuItem, MenuSeparator } from '../Menu';

describe('Menu', () => {
  const TestMenu = ({ onItemClick = jest.fn() }) => (
    <Menu>
      <MenuTrigger>
        <span>Open Menu</span>
      </MenuTrigger>
      <MenuContent>
        <MenuItem onClick={onItemClick}>Item 1</MenuItem>
        <MenuItem onClick={onItemClick}>Item 2</MenuItem>
        <MenuSeparator />
        <MenuItem onClick={onItemClick}>Item 3</MenuItem>
      </MenuContent>
    </Menu>
  );

  it('renders trigger button', () => {
    render(<TestMenu />);
    expect(screen.getByText('Open Menu')).toBeInTheDocument();
  });

  it('opens menu when trigger is clicked', async () => {
    const user = userEvent.setup();
    render(<TestMenu />);
    
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    
    await user.click(screen.getByText('Open Menu'));
    
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('closes menu when trigger is clicked again', async () => {
    const user = userEvent.setup();
    render(<TestMenu />);
    
    const trigger = screen.getByText('Open Menu');
    
    await user.click(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    
    await user.click(trigger);
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  it('calls onClick when menu item is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<TestMenu onItemClick={handleClick} />);
    
    await user.click(screen.getByText('Open Menu'));
    await user.click(screen.getByText('Item 1'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('closes menu after item is clicked', async () => {
    const user = userEvent.setup();
    render(<TestMenu />);
    
    await user.click(screen.getByText('Open Menu'));
    await user.click(screen.getByText('Item 1'));
    
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  it('closes menu when clicking outside', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <div>
        <TestMenu />
        <button>Outside</button>
      </div>
    );
    
    await user.click(screen.getByText('Open Menu'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    
    await user.click(screen.getByText('Outside'));
    
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  it('closes menu when pressing Escape', async () => {
    const user = userEvent.setup();
    render(<TestMenu />);
    
    await user.click(screen.getByText('Open Menu'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    
    await user.keyboard('{Escape}');
    
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  it('renders disabled menu item', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(
      <Menu>
        <MenuTrigger>Open</MenuTrigger>
        <MenuContent>
          <MenuItem onClick={handleClick} disabled>Disabled Item</MenuItem>
        </MenuContent>
      </Menu>
    );
    
    await user.click(screen.getByText('Open'));
    const disabledItem = screen.getByText('Disabled Item');
    
    expect(disabledItem).toBeDisabled();
    
    await user.click(disabledItem);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders separator', async () => {
    const user = userEvent.setup();
    render(<TestMenu />);
    
    await user.click(screen.getByText('Open Menu'));
    
    const separator = screen.getByRole('separator');
    expect(separator).toBeInTheDocument();
  });

  it('supports different positions', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Menu>
        <MenuTrigger>Open</MenuTrigger>
        <MenuContent position="bottom-right">
          <MenuItem>Item</MenuItem>
        </MenuContent>
      </Menu>
    );
    
    await user.click(screen.getByText('Open'));
    
    const menu = container.querySelector('[role="menu"]');
    expect(menu).toHaveClass('right-0');
  });

  it('has proper ARIA attributes', async () => {
    const user = userEvent.setup();
    render(<TestMenu />);
    
    const trigger = screen.getByText('Open Menu').closest('button');
    expect(trigger).toHaveAttribute('aria-haspopup', 'true');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    
    await user.click(screen.getByText('Open Menu'));
    
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('supports keyboard navigation on menu items', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<TestMenu onItemClick={handleClick} />);
    
    await user.click(screen.getByText('Open Menu'));
    
    const item = screen.getByText('Item 1');
    item.focus();
    await user.keyboard('{Enter}');
    
    expect(handleClick).toHaveBeenCalled();
  });

  it('handles Space key on menu items', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<TestMenu onItemClick={handleClick} />);
    
    await user.click(screen.getByText('Open Menu'));
    
    const item = screen.getByText('Item 2');
    item.focus();
    await user.keyboard(' ');
    
    expect(handleClick).toHaveBeenCalled();
  });

  it('applies custom className to Menu', () => {
    const { container } = render(
      <Menu className="custom-menu">
        <MenuTrigger>Open</MenuTrigger>
        <MenuContent>
          <MenuItem>Item</MenuItem>
        </MenuContent>
      </Menu>
    );
    
    expect(container.querySelector('.custom-menu')).toBeInTheDocument();
  });

  it('applies custom className to MenuItem', async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger>Open</MenuTrigger>
        <MenuContent>
          <MenuItem className="custom-item">Custom Item</MenuItem>
        </MenuContent>
      </Menu>
    );
    
    await user.click(screen.getByText('Open'));
    expect(screen.getByText('Custom Item')).toHaveClass('custom-item');
  });
});
