import { useState } from 'react';
import { generateTransactions } from '../data/generateTransactions';
import { useMemo } from 'react';

// Pre-seeded transactions
const initialTransactions = generateTransactions(2000);

export const useTransactions = () => {
  const [transactions] = useState(initialTransactions);
  const [filter, setFilter] = useState('');

  // DELIBERATE PERFORMANCE PROBLEM:
  // Computing filteredTransactions every render without useMemo
  const filteredTransactions = useMemo(()=>{
    return transactions.filter(t => 
    t.name.toLowerCase().includes(filter.toLowerCase()) ||
    t.category.toLowerCase().includes(filter.toLowerCase())
  )
},[transactions,filter]);

  return {
    transactions,
    filteredTransactions,
    filter,
    setFilter
  };
};
