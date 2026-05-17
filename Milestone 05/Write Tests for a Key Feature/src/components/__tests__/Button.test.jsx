import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '../Button';

describe('Button', () => {
  test('Renders the correct label text from the label prop', () => {
    render(<Button label="Click Me" />);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  test('Calls the onClick handler exactly once when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button label="Click Me" onClick={handleClick} />);
    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('The button is disabled and the onClick is NOT called when a disabled={true} prop is passed', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button label="Click Me" onClick={handleClick} disabled={true} />);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
