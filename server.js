const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');

require('dotenv').config();

// Created connection to database
const connection = mysql.createConnection({
    host: 'localhost',
    database: 'employee_db',
    user: 'root',
    password: process.env.DB_PASSWORD,
});
// Handles errors related to connection
connection.connect(err => {
    if (err) throw err;
    console.log('You are connected');
    afterConnected();
});

// Displays header for app
afterConnected = () => {
    console.log(' ___________________________');
    console.log('|                           |');
    console.log('|     Employee Manager      |');
    console.log('|                           |');
    console.log('|___________________________|');
    console.log('');
    promptUser();
};

// Begins initial prompts
const promptUser = () => {
    inquirer.prompt ([
        {
            type: 'list',
            name: 'tasks',
            message: 'What would you like to do?',
            choices: ['View all departments',
            'View all roles',
            'View all employees',
            'Add a department',
            'Add a role',
            'Add employee',
            'Update employee role',
            'Update employee manger',
            'View employees by department',
            'Delete an employee',
            'Exit'
        ]
        }
    ])
    // Starts function based on prompt selected
    .then(({ tasks }) => {
        if (tasks === 'View all departments'){
            showDepartments();
        } else if (tasks === 'View all roles') {
            showRoles();
        } else if (tasks === 'View all employees') {
            showEmployees();
        } else if (tasks === 'Add a department') {
            addDepartment();
        } else if (tasks === 'Add a role') {
            addRole();
        } else if (tasks === 'Add employee') {
            addEmployee();
        } else if (tasks === 'Update employee role') {
            updateEmployeeRole();
        } else if (tasks === 'Updated employee manager') {
            updateEmployeeManager();
        } else if (tasks === 'View employees by department') {
            employeesByDepartment();
        } else if (tasks === 'Delete an employee') {
            removeEmployee();
        } else {
            exit();
        }
    }
    )
}

// Displays department table
showDepartments = () => {
    const sql = `SELECT * FROM department`; 
    console.log('Showing All Departments');

    connection.query(sql, (err, res) => {
        if (err) throw err;
        console.table(res);
        promptUser();
      });
};

// Displays role table
showRoles = () => {
    const sql = `SELECT * from role`;
    console.log('Showing All Roles');

    connection.query(sql, (err, res) => {
        if (err) throw err;
        console.table(res);
        promptUser();
    })
};

// Displays employees table
showEmployees = () => {
    const sql = `SELECT * FROM employees`;
    console.log('Showing All Employees');

    connection.query(sql, (err, res) => {
        if (err) throw err;
        console.table(res);
        promptUser();
    })
};

// Adds department to table
addDepartment = () => {

    inquirer.prompt ([
        {
            type: 'input',
            name: 'addDept',
            message: 'What department do you want to add?',
            validate: (answer) => {
                if (answer.match(/^[A-Za-z]+$/)) {
                    return true;
                } else {
                    console.log(' | Please enter the department name!')
                }
            }
        }
    ])
    .then(({ addDept }) => {
        const sql = `INSERT INTO department (name) VALUES ('${addDept}')`
        const deptTable = `SELECT * FROM department`;
    
        connection.query(sql, (err, res) => {
            if (err) throw err;
        })
    
        connection.query(deptTable, (err, res) => {
            if (err) throw err;
            console.log('Showing All Departments');
            console.table(res);
            promptUser();
          });
    })
}
