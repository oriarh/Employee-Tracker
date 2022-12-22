const express = require('express');
const inquirer = require('inquirer');
const mysql = require('mysql2');
const ctable = require('console.table');
const { query, response } = require('express');
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
function runInquirer() {
    inquirer.prompt([
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
    ])
    .then((response) => {

        if(response.mainOptions === "View all departments") {
            db.query('SELECT * FROM department', function (err,results) {
                console.table(results);
                runInquirer();
            });
        }

        else if(response.mainOptions === "View all roles") {
            db.query('select role.id, role.title, department.name as department, role.salary FROM role join department on role.department_id = department.id order by role.id', function (err,results) {
                console.table(results);
                runInquirer();
            });
        }

        else if(response.mainOptions === "View all employees") {
            db.query(`SELECT e.id, e.first_name, e.last_name, CONCAT(m.first_name,', ',m.last_name) as Manager, department.name, role.title, role.salary FROM employee e left join employee m on m.id = e.manager_id join role on e.role_id = role.id join department on role.department_id = department.id`, function (err,results) {
                console.table(results);
                runInquirer();
            });
        }

        else if(response.addDepartment) {
            db.query(`INSERT INTO department (name) VALUES  ("${response.addDepartment}")`, function (err,results) {
                return
            });
            console.log(`Added ${response.addDepartment} to the departments`)
            runInquirer()
        }

        else if(response.mainOptions === "Add a role") {
            addRole();
        }

        else if(response.mainOptions === "Add an employee") {
            addEmployee();
        }

        else if(response.mainOptions === "Update an employee role") {
            updateEmployeeRole();
        }

        else {db.end();}

    })
}

function addRole () {
    db.query("Select name from department",function(err,results){
        for(i=0;i<results.length;i++) {
            roleDepartmentChoices.push(results[i].name);
        }
    })

    let roleDepartmentChoices = [];

    inquirer.prompt ([
        {
        name: "addRole",
        type: "input",
        message: "What is the title of the Role?",
        },
        {
        name: "addRoleSalary",
        type: "input",
        message: `What is the salary of the role?`,
        },
        {
        name: "addRoleDepartment",
        type: "list",
        message: "Which department does the role belong to?",
        choices: roleDepartmentChoices,
        },
    ])
    .then((response) => {
            db.query(`SELECT id FROM department WHERE name = "${response.addRoleDepartment}"`, function(err, results) {
                db.query(`INSERT INTO role (title, Salary, department_id) VALUES ("${response.addRole}",${response.addRoleSalary},${results[0].id})`, function (err,results) {
                    console.log(`Added ${response.addRole} to the ${response.addRoleDepartment} department with salary of ${response.addRoleSalary}`);
                    runInquirer()
                });
            });
        }
    )
}


function addEmployee () {
    db.query("Select title from role", function(err,results){
        for(i=0;i<results.length;i++) {
            employeeRoleChoices.push(results[i].title);
        }
    })

    let employeeRoleChoices = [];

    db.query("Select CONCAT(first_name,', ',last_name) as manager from employee", function(err,results){
        for(i=0;i<results.length;i++) {
            employeeManagerChoices.push(results[i].manager);
        }
    })

    let employeeManagerChoices = [];

    inquirer.prompt ([
        {
        name: "addEmployee",
        type: "input",
        message: "What is the employee's first name?",
        },
        {
        name: "addEmployeeLastName",
        type: "input",
        message: "What is the employee's last name?",
        },
        {
        name: "addEmployeeRole",
        type: "list",
        message: "What is the employee's role?",
        choices: employeeRoleChoices,
        },
        {
        name: "addEmployeeManager",
        type: "list",
        message: "Who is the employee's manager?",
        choices: employeeManagerChoices,
        },
    ])
    .then((response) => {
        db.query(`SELECT id FROM role WHERE title = "${response.addEmployeeRole}"`, function(err, roleResults) {
            db.query(`SELECT id FROM employee WHERE CONCAT(first_name,', ',last_name) = "${response.addEmployeeManager}"`,function(err,results) {    
                db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("${response.addEmployee}","${response.addEmployeeLastName}",${roleResults[0].id},${results[0].id})`, function (err,results) {
                    console.log(`Added ${response.addEmployee} to the employees directory`);
                    runInquirer()
                });
            })
        });
    })
}

function updateEmployeeRole () {

    //To create a list of current employees
    db.query("Select CONCAT(first_name,', ',last_name) as staff from employee", function(err,results){
        for(i=0;i<results.length;i++) {
            employeeChoices.push(results[i].staff);
        }
    })

    let employeeChoices = [];

    //To create the list of roles
    db.query("Select title from role", function(err,results){
        for(i=0;i<results.length;i++) {
            employeeRoleChoices.push(results[i].title);
        }
    })

    let employeeRoleChoices = [];

    inquirer.prompt ([
        {
        name: "Placeholder",
        type: "confirm",
        message: "Are you sure you want to update an employee?",
        },
        {
        name: "updateEmployeeName",
        type: "list",
        message: "Which employee's role would you like to update?",
        choices: employeeChoices,
        },
        {
        name: "updateEmployeeRole",
        type: "list",
        message: "Which role do you want to assign the selected employee?",
        choices: employeeRoleChoices,
        },
    ])
    .then((response) => {
        db.query(`SELECT id FROM role WHERE title = "${response.updateEmployeeRole}"`, function(err, roleResults) {
            db.query(`UPDATE employee set role_id = ${roleResults[0].id} where CONCAT(first_name,', ',last_name) = "${response.updateEmployeeName}"`,function(err,results) {
                console.log(`The role of ${response.updateEmployeeName} has been changed to ${response.updateEmployeeRole}`)
                runInquirer()
            })
        })
    })
}

runInquirer();