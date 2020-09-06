const inquirer = require("inquirer");
const mysql = require("mysql");
const consoleTable = require("console.table");

const {Employee, Role, Department} = require("./lib/Creators");
const questions = require("./utils/questions");

const connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root1234',
    database : 'empTracker_DB'
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
  let query = 'SELECT first_name, last_name, title, salary from employee INNER JOIN role ON employee.role_ID = role.id;'
  connection.query(query, function (err, res) {
    if (err) throw err;
    console.log("\n");
    console.table(res);
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
  let empArray = [];
  let idArray = [];
  const query = 'SELECT employee.id, concat(first_name, " ", last_name) AS employee FROM employee ORDER BY Employee ASC'
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.log("#1", res);

    // empArray.push(res);
    // console.log("HEEEERREE", empArray);

    empArray = res.map(obj => obj.employee);
    console.log("#2", empArray);

    idArray = res.map(obj => (`${obj.id}, "${obj.employee}"`));
    console.log("#3", idArray);
    


    inquirer.prompt({
      name: "employee",
      type: "list",
      message: "Which employee would you like to remove?",
      choices: empArray
    }).then((emp) => {
      console.log("#4", emp);
      console.log("THIS", emp.employee);

      function getKeyByValue(object, value) {
        return Object.keys(object).find(key => object[key] === value);
      }
      const map = idArray;
      console.log(getKeyByValue(map, emp.employee));
      // let chosenId = idArray.find(element => element == emp.employee);
        
          // console.log("This is what I found!", id);
          // return element;
        
      
      // console.log("#6", chosenId);
      // if (emp.employee == obj.employee)
    })
    // console.log("#2", empArray);
  });
  // console.log("Made it this far!!!");
}

// Need a function to call in "choices" that loops through
// array of all employees (with IDs attached) and then 
// displays only the employees as choices. Then compare (emp)
// to that choice and delete using a SQL query WHERE employee ID = ID





const viewEmployees = () => {
  let newArray = [];
  connection.query('SELECT first_name, last_name from employee', function (err, results) {
    if (err) throw err;
    newArray = results.map(obj => {
      return `${obj.first_name} ${obj.last_name}`;
    })
  });
}