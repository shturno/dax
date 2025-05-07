import { render, screen, fireEvent } from '@testing-library/react';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import React from 'react';

describe('Dialog', () => {
  it('opens and closes dialog', () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>Dialog content</DialogContent>
      </Dialog>
    );
    expect(screen.queryByText('Dialog content')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Open'));
    expect(screen.getByText('Dialog content')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    expect(screen.queryByText('Dialog content')).not.toBeInTheDocument();
  });
});
