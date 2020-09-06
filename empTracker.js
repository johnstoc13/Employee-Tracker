const inquirer = require("inquirer");
const mysql = require("mysql");
const consoleTable = require("console.table");

const { Employee, Role, Department } = require("./lib/Creators");
const questions = require("./utils/questions");

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root1234',
  database: 'empTracker_DB'
});

connection.connect((err) => {
  if (err) throw err;
  init();
});

function init() {
  inquirer
    .prompt({
      name: "action",
      type: "list",
      message: "What would you like to do?",
      choices: [
        "View All Employees",
        "View All Employees By Department",
        "View All Employees By Manager",
        "Add Employee",
        "Remove Employee",
        "Exit"
      ]
    })
    .then((answer) => {
      switch (answer.action) {

        case "View All Employees":
          // Still need to figure out JOINING all 3 tables...
          viewAll();
          break;

        case "View All Employees By Department":
          // Not Started
          viewAllByDepartment();
          break;

        case "View All Employees By Manager":
          // Not Started
          viewAllByManager();
          break;

        case "Add Employee":
          // Still need to add employee manager (after ViewAll is complete)
          addEmployee();
          break;

        case "Remove Employee":
          // COMPLETE!!!
          removeEmployee();
          break;

        case "Exit":
          // COMPLETE!!!
          connection.end();
          break;
      }
    });
}

const viewAll = () => {
  let query = 'SELECT first_name, last_name, title, salary from employee INNER JOIN role ON employee.role_ID = role.id;'
  connection.query(query, function (err, res) {
    if (err) throw err;
    console.log("\n");
    console.table(res);
    init();
  });
}

// Prompt user for questions
const promptQuestions = (type) => {
  return inquirer.prompt(questions[type]);
};


const addEmployee = () => {
  promptQuestions("addEmployee").then((res) => {
    // Variable to get role_id
    let roleNumber;
    // Run through all responses to set the role_id
    if (res.role == "Sales Lead") {
      roleNumber = "1";
    } else if (res.role == "Salesperson") {
      roleNumber = "2";
    } else if (res.role == "Lead Engineer") {
      roleNumber = "3";
    } else if (res.role == "Software Engineer") {
      roleNumber = "4";
    } else if (res.role == "Accountant") {
      roleNumber = "5";
    } else if (res.role == "Legal Team Lead") {
      roleNumber = "6";
    } else roleNumber = "7";
    // Query to add employee
    const query = `INSERT INTO employee (first_name, last_name, role_id) VALUES ("${res.firstname}", "${res.lastname}", ${roleNumber})`;
    connection.query(query, function (err) {
      if (err) throw err;
      console.log(`Added ${res.firstname} ${res.lastname} to the database!`);
      // Start program over from beginning
      init();
    })
  });
}

const removeEmployee = () => {
  // Set up empty arrays to use later
  let empArray = [];
  let idArray = [];
  // Query for IDs and Names in ASC order
  const query = 'SELECT employee.id, concat(first_name, " ", last_name) AS employee FROM employee ORDER BY Employee ASC'
  connection.query(query, (err, res) => {
    if (err) throw err;
    // console.log("#1", res);
    
    empArray = res.map(obj => obj.employee);
    // console.log("#2", empArray);

    idArray = res.map(obj => (`${obj.id}, ${obj.employee}`));
    // console.log("#3", idArray);

    // Ask user which employee to remove
    inquirer.prompt({
      name: "employee",
      type: "list",
      message: "Which employee would you like to remove?",
      choices: empArray
    }).then((emp) => {
      // Then loop through all choices to match user choice
      idArray.forEach(person => {
        let choices = person.split(",")[1].trim();
        if (choices == emp.employee) {
          let chosenId = person.split(",")[0];
          // Query to remove the chosen employee
          const query = `DELETE from employee WHERE id = ${chosenId};`
          connection.query(query, (err, res) => {
            if (err) throw err;
            console.log(`\n ${emp.employee} successfully removed! \n`);
            // Start program over from beginning
            init();
          })
        }
      })
    })
  });
}