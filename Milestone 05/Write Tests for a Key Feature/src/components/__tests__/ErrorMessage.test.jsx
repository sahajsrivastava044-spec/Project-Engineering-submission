import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorMessage from '../ErrorMessage';

describe('ErrorMessage', () => {
  test('Renders the message prop text in the component', () => {
    render(<ErrorMessage message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  test('Renders a "Try again" button when the onRetry prop is provided and calls onRetry when clicked', async () => {
    const user = userEvent.setup();
    const handleRetry = jest.fn();
    render(<ErrorMessage message="Something went wrong" onRetry={handleRetry} />);
    const button = screen.getByRole('button', { name: /try again/i });
    expect(button).toBeInTheDocument();
    await user.click(button);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  test('Does NOT render a retry button when onRetry prop is not provided', () => {
    render(<ErrorMessage message="Something went wrong" />);
    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
  });
});
