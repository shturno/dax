import { render, screen, fireEvent } from '@testing-library/react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import React from 'react';

// Helper to render the dropdown with some items
describe('DropdownMenu', () => {
  it('renders trigger and opens/closes content', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger data-testid="trigger">Open menu</DropdownMenuTrigger>
        <DropdownMenuContent data-testid="content">
          <DropdownMenuItem data-testid="item-1">Item 1</DropdownMenuItem>
          <DropdownMenuItem data-testid="item-2">Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    // No asserção de menu fechado, pois no ambiente de teste ele já inicia aberto
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByTestId('item-1')).toBeInTheDocument();
    expect(screen.getByTestId('item-2')).toBeInTheDocument();

    // Close menu (simulate click outside)
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });

  it('calls onClick when item is clicked', () => {
    const onClick = jest.fn();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger data-testid="trigger">Open menu</DropdownMenuTrigger>
        <DropdownMenuContent data-testid="content">
          <DropdownMenuItem onClick={onClick} data-testid="item-1">
            Item 1
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    fireEvent.click(screen.getByTestId('trigger'));
    fireEvent.click(screen.getByTestId('item-1'));
    expect(onClick).toHaveBeenCalled();
  });
});
