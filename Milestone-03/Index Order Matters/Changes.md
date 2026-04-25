# Document your index fixes here

- Original index:
  CREATE INDEX idx_salary_department ON employees(salary, department);

- Issue observed:
  The query:
  SELECT * FROM employees
  WHERE department = 'Sales' AND salary > 50000;

  PostgreSQL performed a Sequential Scan instead of using the index.
  This resulted in slower performance because the entire table was scanned.

  The issue occurred because the index column order (salary, department)
  did not match the query filtering pattern, which starts with department.

- Fixed index:
  CREATE INDEX idx_department_salary ON employees(department, salary);

- Performance improvement:
  After correcting the index order, PostgreSQL used an Index Scan instead of a Sequential Scan.

  This improved performance by:
  - Reducing the number of rows scanned
  - Lowering query execution time
  - Making filtering more efficient using the Left-Most Prefix Rule