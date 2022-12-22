DROP DATABASE IF EXISTS employee_db;

CREATE DATABASE employee_db;

USE employee_db;

CREATE TABLE department (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) not null,
    PRIMARY KEY (id)
);

CREATE TABLE role (
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(30) not null,
    salary DECIMAL not null,
    department_id INT not null,
    PRIMARY KEY (id),
    FOREIGN KEY (department_id) REFERENCES department(id)
);

CREATE TABLE employee (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(30) not null,
    last_name VARCHAR(30) not null,
    role_id INT not null,
    manager_id INT,
    FOREIGN KEY (role_id) REFERENCES role (id)
    FOREIGN KEY(manager_id) REFERENCES employee (first_name)
)