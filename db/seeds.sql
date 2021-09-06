INSERT INTO
  department (name)
VALUES
  ("Sales"),
  ("Engineer"),
  ("Finance");
INSERT INTO
  role (title, salary, department_id)
VALUES
  ("Salesperson", 123456, 1),
  ("Software Engineer", 1234567, 2),
  ("Accountant", 987645321, 3);
INSERT INTO
  employees (first_name, last_name, role_id, manager_id)
VALUES
    ("Tim", "Drake", 1, null),
    ("Stephanie", "Brown", 1, 1),
    ("Jason", "Scott", 2, null),
    ("Richard", "Paur", 3, null);