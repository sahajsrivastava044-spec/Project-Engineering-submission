import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginForm from '../LoginForm';
import { loginUser } from '../../api/auth';

jest.mock('../../api/auth');

const renderWithRouter = (ui) => {
  return render(ui, { wrapper: BrowserRouter });
};

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Renders the email input, password input, and submit button', () => {
    renderWithRouter(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('When valid credentials are typed and submit is clicked, the API function is called with the correct email and password values', async () => {
    const user = userEvent.setup();
    loginUser.mockResolvedValueOnce({ user: { id: 1, name: 'John' } });
    renderWithRouter(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' });
    });
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign in/i })).toBeEnabled();
    });
  });

  test('When the API rejects with an error, the error message text appears in the UI', async () => {
    const user = userEvent.setup();
    loginUser.mockRejectedValueOnce(new Error('Invalid credentials'));
    renderWithRouter(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  test('The submit button shows a loading state while the API call is in progress', async () => {
    const user = userEvent.setup();
    let resolveApi;
    const promise = new Promise(resolve => {
      resolveApi = resolve;
    });
    loginUser.mockReturnValueOnce(promise);
    
    renderWithRouter(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    
    const button = screen.getByRole('button', { name: /sign in/i });
    await user.click(button);

    expect(button).toBeDisabled();
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    resolveApi({ user: { id: 1 } });
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign in/i })).toBeEnabled();
    });
  });

  test('Clicking submit with empty fields does NOT call the API function', async () => {
    const user = userEvent.setup();
    renderWithRouter(<LoginForm />);

    const button = screen.getByRole('button', { name: /sign in/i });
    await user.click(button);

    expect(loginUser).not.toHaveBeenCalled();
  });
});
