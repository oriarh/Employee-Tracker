const express = require('express');
const inquirer = require('inquirer');
const mysql = require('mysql2');
const ctable = require('console.table');
const { query } = require('express');
const inquirerLoop = require('inquirer-loop');
inquirer.registerPrompt("loop", require("inquirer-loop")(inquirer));

//connect to database
const db = mysql.createConnection (
    {
        host: '127.0.0.1',
        user: 'root',
        password: '',
        database: 'employee_db'
    },
    console.log("connected to the employee_db database")
);

inquirer.prompt([
    // {
    // type: 'loop',
    // name: 'theLoop',
    // message: 'What would you like to do?',
    // questions: [
        {
        name: "mainOptions",
        type: "list",
        message: "What would you like to do?",
        choices: ["View all departments", "View all roles", "View all employees", "Add a department", "Add a role", "Add an employee", "Update an employee role","Quit"]
        },
        {
        name: "addDepartment",
        type: "input",
        message: "What is the name of the department?",
        when (answers){
            return answers.mainOptions === "Add a department"
        }
        },
        {
        name: "addRole",
        type: "input",
        message: "What is the name of the Role?",
        when (answers){
            return answers.mainOptions === "Add a role"
        }
        },
        {
        name: "addRoleSalary",
        type: "input",
        message: "What is the salary of the Role?",
        when (answers){
            return answers.mainOptions === "Add a role"
        }
        },
        { //Have to write the code which updates this list everytime a new department is added through the prompt into the table
        name: "addRoleDepartment",
        type: "list",
        message: "What is the salary of the Role?",
        choices: ["Finance", "Engineering", "Finance", "Legal", "Sales", "Service", "Operations", "Compliance"],
        when (answers){
            return answers.mainOptions === "Add a role"
        }
        },
    //     ]
    // },
])
.then((response) => {
    if(response.mainOptions === "View all departments") {
        db.query('SELECT * FROM department', function (err,results) {
            console.table(results);
        });
        return;
    }

    else if(response.mainOptions === "View all roles") {
        db.query('select role.id, role.title, department.name as department, role.salary FROM role join department on role.department_id = department.id;', function (err,results) {
            console.table(results);
        });
    }

    else if(response.mainOptions === "View all employees") {
        db.query('SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name as department, role.salary, employee.manager_id FROM employee join role on employee.role_id = role.id join department on role.department_id = department.id', function (err,results) {
            console.table(results);
        });
    }

    else if(response.addDepartment) {
        db.query(`INSERT INTO department (name) VALUES  ("${response.addDepartment}")`, function (err,results) {
            return
        });
        addRoleDepartment.push
        console.log(`Added ${response.addDepartment} to the departments`)
    }

    else if(response.addRole) {
        db.query(`SELECT id FROM department WHERE name = "${response.addRoleDepartment}"`, function(err, results) {
            db.query(`INSERT INTO role (title, Salary, department_id) VALUES ("${response.addRole}",${response.addRoleSalary},${results[0].id})`, function (err,results) {
                console.log(`Added ${response.addRole} to the ${response.addRoleDepartment} department with salary of ${response.addRoleSalary}`);
            });
        });
    }

})

