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
  startSearch();
});

function startSearch() {
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
        songSearch();
        break;

      case "Exit":
        connection.end();
        break;
      }
    });
}

const viewAll = () => {
  connection.query('SELECT * from employee', function (err, results) {
    if (err) throw err;
    console.table(results);
    startSearch();
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

    let roleNumber;
    console.log(res.role);

    if (res.role= "Sales Lead") {
      // console.log("You chose sales lead!");
      roleNumber = "1";
    } else if (res.role = "Salesperson") {
      roleNumber = "2";
    } else if (res.role = "Lead Engineer") {
      roleNumber = "3";
    } else if (res.role = "Software Engineer") {
      roleNumber = "4";
    } else if (res.role = "Accountant") {
      roleNumber = "5";
    } else if (res.role = "Legal Team Lead") {
      roleNumber = "6";
    } else roleNumber = "7";

    // console.log(roleNumber);

    const query1 = `INSERT INTO employee (first_name, last_name, role_id) VALUES ("${res.firstname}", "${res.lastname}", ${res.role})`;
    const query2 = `INSERT INTO role ()`
    // console.log(res.role);
    // console.log(query1);
    // connection.query1('INSERT name')
  });
}