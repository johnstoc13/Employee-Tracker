const inquirer = require("inquirer");
const mysql = require("mysql");
const consoleTable = require("console.table");

const {Employee, Role, Department} = require("./lib/Creators");
const questions = require("./utils/questions");

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root1234',
    database : 'empTracker_DB'
});

connection.connect(function(err) {
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
    .then(function(answer) {
      switch (answer.action) {
      case "View All Employees":
        viewAll();
        break;

      case "View All Employees By Department":
        multiSearch();
        break;

      case "View All Employees By Manager":
        rangeSearch();
        break;

      case "Add Employee":
        addEmployee();
        break;

      case "Remove Employee":
        removeEmployee();
        break;

      case "Exit":
        connection.end();
        break;
      }
    });
}

const viewAll = () => {
  connection.query('SELECT first_name, last_name, title, salary from employee INNER JOIN role ON employee.role_ID = role.id;', function (err, results) {
    if (err) throw err;
    console.log("\n");
    console.table(results);
    init();
  });
}

// const viewByDepartment = () => {
//   const query = 'SELECT * from employee'
//   connection.query(query, function (err, results) {
//     if (err) throw err;
//     console.table(results);
//     startSearch();
//   });
// }


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
    const query = `INSERT INTO employee (first_name, last_name, role_id) VALUES ("${res.firstname}", "${res.lastname}", ${roleNumber})`;
    connection.query(query, function (err) {
      if (err) throw err;
      console.log(`Added ${res.firstname} ${res.lastname} to the database!`);
      init();
    })
  });
}

const removeEmployee = () => {
  // inquirer.prompt({
  //   name: "delete",
  //   type: "list",
  //   message: "Which employee would you like to remove",
  //   choices: viewEmployees()
  // })
  viewEmployees();
  // console.log("Made it this far!!!");
}


const viewEmployees = () => {
  connection.query('SELECT first_name, last_name from employee', function (err, results) {
    if (err) throw err;
    // console.table(results);

    let empArray = JSON.stringify(results);
    for (let i = 0; i < empArray.length; i++) {
      const newResults = empArray[i];
      console.log(newResults);
      
    }
    // console.log(JSON.stringify(results));
    // console.log(results);

  });
}