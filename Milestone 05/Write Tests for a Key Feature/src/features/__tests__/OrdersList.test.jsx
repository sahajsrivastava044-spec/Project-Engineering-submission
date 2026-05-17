import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import OrdersList from '../OrdersList';
import { fetchOrders } from '../../api/orders';

jest.mock('../../api/orders');

describe('OrdersList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('When the API returns an array of orders, each order\'s name is visible in the rendered list', async () => {
    fetchOrders.mockResolvedValueOnce([
      { id: 1, name: 'Laptop Pro', date: '2023-01-01', status: 'Delivered' },
      { id: 2, name: 'Wireless Mouse', date: '2023-01-02', status: 'Processing' }
    ]);
    render(<OrdersList />);
    
    await waitFor(() => {
      expect(screen.getByText('Laptop Pro')).toBeInTheDocument();
      expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    });
  });

  test('When the API returns an empty array [], the empty state message is visible and no order items are rendered', async () => {
    fetchOrders.mockResolvedValueOnce([]);
    render(<OrdersList />);

    await waitFor(() => {
      expect(screen.getByText(/no orders yet/i)).toBeInTheDocument();
    });
    
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  test('When the API rejects, the error message component text is visible in the rendered output', async () => {
    fetchOrders.mockRejectedValueOnce(new Error('Failed to fetch orders'));
    render(<OrdersList />);

    await waitFor(() => {
      expect(screen.getByText('Something went wrong loading your orders.')).toBeInTheDocument();
    });
  });
});
