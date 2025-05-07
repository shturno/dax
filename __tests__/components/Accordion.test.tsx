import { render, screen, fireEvent } from '@testing-library/react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import React from 'react';

describe('Accordion', () => {
  it('renders and toggles items', () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Section 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    // Section 1 content should not be in the DOM initially
    expect(screen.queryByText('Content 1')).toBeNull();
    // Open Section 1
    fireEvent.click(screen.getByText('Section 1'));
    expect(screen.getByText('Content 1')).toBeVisible();
    // Open Section 2
    fireEvent.click(screen.getByText('Section 2'));
    expect(screen.getByText('Content 2')).toBeVisible();
    // Section 1 content deve sumir (accordion single)
    expect(screen.queryByText('Content 1')).toBeNull();
  });
});
