# Performance Optimization Report: TxnTracker

## 1. Baseline Performance
- **Interaction**: Typing "a" in search filter
- **Render Time**: 893.1 ms
- **Observations**: not using useMemo for virtualization for which all of the dasta is getting rendered at once.

---

## 2. Phase 1: Memoization
- **Optimization**: Wrap `TransactionRow` in `React.memo()`.
- **Render Time**: 926 ms
- **Improvement**: 0 %
- **Observations**: The memoization did not get applied.

---

## 3. Phase 2: Stable References
- **Optimization**: Use `useCallback` for the `onSelect` handler in `Transactions.jsx`.
- **Render Time**: 201 ms
- **Improvement**: 45 %
- **Observations**: Why was the previous memoization update ineffective without this change?

---

## 4. Phase 3: Computed State
- **Optimization**: Use `useMemo` for `filteredTransactions` in `useTransactions.js`.
- **Render Time**: [Record time] ms
- **Improvement**: [Percentage] %
- **Observations**: How does this impact the hook's performance during filter changes?

---

## 5. Phase 4: Virtualization
- **Optimization**: Implement `react-window` or `react-virtuoso` in `TransactionList.jsx`.
- **Render Time**:  102.32 ms
- **Improvement**: 50 %
- **Observations**: Compare the total DOM node count before and after this change.

---

## Final Summary
The rendering speed and the serching speed gradually increased with the help of hooks useCallback and useMemo and also packages like react-window made virtualization possible.
