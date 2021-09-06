const inquirer = require("inquirer");
const mysql = require("mysql2");
const cTable = require("console.table");

require("dotenv").config();

// Created connection to database
const connection = mysql.createConnection({
  host: "localhost",
  database: "employee_db",
  user: "root",
  password: process.env.DB_PASSWORD,
});
// Handles errors related to connection
connection.connect((err) => {
  if (err) throw err;
  console.log("You are connected");
  afterConnected();
});

// Displays header for app
afterConnected = () => {
  console.log(" ___________________________");
  console.log("|                           |");
  console.log("|     Employee Manager      |");
  console.log("|                           |");
  console.log("|___________________________|");
  console.log("");
  promptUser();
};

// Begins initial prompts
const promptUser = () => {
  inquirer
    .prompt([
      {
        type: "list",
        name: "tasks",
        message: "What would you like to do?",
        choices: [
          "View all departments",
          "View all roles",
          "View all employees",
          "Add a department",
          "Add a role",
          "Add employee",
          "Update employee role",
          "Update employee manager",
          "View employees by department",
          "Delete an employee",
          "Exit",
        ],
      },
    ])
    // Starts function based on prompt selected
    .then(({ tasks }) => {
      if (tasks === "View all departments") {
        showDepartments();
      } else if (tasks === "View all roles") {
        showRoles();
      } else if (tasks === "View all employees") {
        showEmployees();
      } else if (tasks === "Add a department") {
        addDepartment();
      } else if (tasks === "Add a role") {
        addRole();
      } else if (tasks === "Add employee") {
        addEmployee();
      } else if (tasks === "Update employee role") {
        updateEmpRole();
      } else if (tasks === "Update employee manager") {
        updateEmpManager();
      } else if (tasks === "View employees by department") {
        employeesByDept();
      } else if (tasks === "Delete an employee") {
        removeEmployee();
      } else {
        exit();
      }
    });
};

// Displays department table
showDepartments = () => {
  const deptSql = `SELECT * FROM department`;

  console.log("Showing All Departments");

  connection.query(deptSql, (err, res) => {
    if (err) throw err;
    console.table(res);
    promptUser();
  });
};

// Displays role table
showRoles = () => {
  const rolesSql = `SELECT role.id, role.title, department.name AS department
  FROM role
  INNER JOIN department ON role.department_id = department.id`;
  console.log("Showing All Roles");

  connection.query(rolesSql, (err, res) => {
    if (err) throw err;
    console.table(res);
    promptUser();
  });
};

// Displays employees table
showEmployees = () => {
  const empSql = `SELECT employees.id, employees.first_name, employees.last_name, role.title, department.name AS department, role.salary, 
  CONCAT (manager.first_name, " ", manager.last_name) AS manager
  FROM employees
  LEFT JOIN role ON employees.role_id = role.id
  LEFT JOIN department ON role.department_id = department.id
  LEFT JOIN employees manager ON employees.manager_id = manager.id`;
  console.log("Showing All Employees");

  connection.query(empSql, (err, res) => {
    if (err) throw err;
    console.table(res);
    promptUser();
  });
};

// Adds department to table
addDepartment = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "addDept",
        message: "What department do you want to add?",
        validate: (answer) => {
          if (answer.match(/[a-z A-Z\\_\\"]+$/)) {
            return true;
          } else {
            console.log(" | Please enter the department name!");
          }
        },
      },
    ])
    // Adds department name to table
    .then(({ addDept }) => {
      const addDeptSql = `INSERT INTO department (name) VALUES ('${addDept}')`;

      connection.query(addDeptSql, (err, res) => {
        if (err) throw err;
      });

      showDepartments();
    });
};

// Adds role to table
addRole = () => {
  const deptSql = `SELECT * FROM department`;

  connection.query(deptSql, (err, res) => {
    if (err) throw err;
    deptChoices = res.map(({ id, name }) => ({ name: name, value: id }));

    inquirer
      .prompt([
        {
          type: "input",
          name: "role",
          message: "What role would you like to add?",
        },
        {
          type: "input",
          name: "salary",
          message: "What is the salary of this?",
        },
        {
          type: "list",
          name: "department",
          message: "What department does this role belong to?",
          choices: deptChoices,
        },
      ])
      // Adds prompt data for role to table
      .then(({ role, salary, department }) => {
        // adds new role to table
        const addRoleSql = `INSERT INTO role (title, salary, department_id) VALUES ('${role}', ${salary}, ${department})`;

        connection.query(addRoleSql, (err, res) => {
          if (err) throw err;
        });
        // Shows update roles table
        showRoles();
      });
  });
};

// Function to add new employee to employees table
addEmployee = () => {
  // Connection to collect title and id from role table
  const empRoleSql = `SELECT * FROM role`;

  connection.query(empRoleSql, (err, res) => {
    if (err) throw err;
    roleChoices = res.map(({ id, title }) => ({ name: title, value: id }));

    // Connection to colleted id, first name, and last name from employees table
    const empMangersSql = `SELECT * FROM employees`;

    connection.query(empMangersSql, (err, res) => {
      if (err) throw err;
      managerChoices = res.map(({ id, first_name, last_name }) => ({
        name: first_name + " " + last_name,
        value: id,
      }));

      // Start questions for adding employee
      inquirer
        .prompt([
          {
            type: "input",
            name: "firstName",
            message: "What is the employee's first name?",
          },
          {
            type: "input",
            name: "lastName",
            message: "What is the employee's last name?",
          },
          {
            type: "list",
            name: "title",
            message: "What is this employee's job title?",
            choices: roleChoices,
          },
          {
            type: "list",
            name: "managerId",
            message: "Who is this employee's manager?",
            choices: managerChoices,
          },
        ])
        // Adds prompts from employee to table
        .then(({ firstName, lastName, title, managerId }) => {
          const addEmpSql = `INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ('${firstName}', '${lastName}', ${title}, ${managerId})`;

          connection.query(addEmpSql, (err, res) => {
            if (err) throw err;
          });
          // Shows updated employees table
          showEmployees();
        });
    });
  });
};

// Updates employee's role
updateEmpRole = () => {
  // Gets list of employees names
  const updateEmpRoleSql = `SELECT * FROM employees`;

  connection.query(updateEmpRoleSql, (err, res) => {
    if (err) throw err;
    empChoices = res.map(({ id, first_name, last_name }) => ({
      name: first_name + " " + last_name,
      value: id,
    }));

    // Gets list of roles
    const empRole = `SELECT * FROM role`;

    connection.query(empRole, (err, res) => {
      if (err) throw err;
      roleChoices = res.map(({ id, title }) => ({ name: title, value: id }));

      // Prompts to select desired employee to edit and their new position
      inquirer
        .prompt([
          {
            type: "list",
            name: "updateEmp",
            message: "Which employee would you like to update?",
            choices: empChoices,
          },
          {
            type: "list",
            name: "updateRole",
            message: "What is the employee's new role?",
            choices: roleChoices,
          },
        ])
        // Updates employee's role to newly selected role
        .then(({ updateEmp, updateRole }) => {
          const updateEmpRole = `UPDATE employees
                                SET role_id = ${updateRole}
                                WHERE id = ${updateEmp}`;

          connection.query(updateEmpRole, (err, res) => {
            if (err) throw err;
          });
          // Shows updated employees table
          showEmployees();
        });
    });
  });
};

// Updates employee's role
updateEmpManager = () => {
  // Gets list of employees names
  const updateManagerSql = `SELECT * FROM employees`;

  connection.query(updateManagerSql, (err, res) => {
    if (err) throw err;
    empChoices = res.map(({ id, first_name, last_name }) => ({
      name: first_name + " " + last_name,
      value: id,
    }));

    managerChoices = res.map(({ id, first_name, last_name }) => ({
      name: first_name + " " + last_name,
      value: id,
    }));

    // Prompts to select desired employee to edit and their new position
    inquirer
      .prompt([
        {
          type: "list",
          name: "updateEmp",
          message: "Which employee would you like to update?",
          choices: empChoices,
        },
        {
          type: "list",
          name: "updateManager",
          message: "Who is the employee's new manager?",
          choices: managerChoices,
        },
      ])
      // Updates employee's role to newly selected role
      .then(({ updateEmp, updateManager }) => {
        if (updateEmp === updateManager) {
          // Ensures that employees are not accidently set as their own manager
          console.log("---An employee cannot be their own manager---");
          updateEmpManager();
        } else {
          const updateEmpMan = `UPDATE employees
            SET manager_id = ${updateManager}
            WHERE id = ${updateEmp}`;
          // Updates employees manager
          connection.query(updateEmpMan, (err, res) => {
            if (err) throw err;
          });
          // Shows updated employees table
          showEmployees();
        }
      });
  });
};

// Function to display a table of employees by department
employeesByDept = () => {
  // searches for all departments
  const deptSql = `SELECT * from department`;

  connection.query(deptSql, (err, res) => {
    if (err) throw err;
    deptChoices = res.map(({ id, name }) => ({ name: name, value: id }));

    inquirer
      .prompt([
        {
          type: "list",
          name: "department",
          message: "What department's employees would you like to view?",
          choices: deptChoices,
        },
      ])
      .then(({ department }) => {
        //Sets up to create table for positions with the same department id
        const empDept = `SELECT employees.id, employees.first_name, employees.last_name, role.title, department.name AS department, role.salary,
        CONCAT (manager.first_name, " ", manager.last_name) AS manager
        FROM employees
        LEFT JOIN role ON employees.role_id = role.id
        LEFT JOIN department ON role.department_id = department.id
        LEFT JOIN employees manager ON employees.manager_id = manager.id
        WHERE department.id = ${department}`;

        connection.query(empDept, (err, res) => {
          if (err) throw err;
          console.table(res);
          promptUser();
        });
      });
  });
};
