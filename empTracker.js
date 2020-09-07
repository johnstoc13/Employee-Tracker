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

// Main function to start program
function init() {

  inquirer.prompt({
    name: "action",
    type: "list",
    message: "What would you like to do?",
    choices: [
      "View All Employees",
      "View All Employees By Department",
      "View All Employees By Manager",
      "Add Employee",
      "Update Employee Role",
      "Remove Employee",
      "Exit"
    ]
  })
    .then((answer) => {
      switch (answer.action) {

        case "View All Employees":
          // COMPLETE!!!
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
          // COMPLETE!!!
          addEmployee();
          break;

        case "Update Employee Role":
          // COMPLETE!!!
          updateEmployeeRole();
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

// Query to view all employees and data
const viewAll = () => {
  let query = 'SELECT e.first_name AS "First Name", e.last_name AS "Last Name", role.title AS Title, role.salary AS Salary, IFNULL((concat(m.first_name, " " ,  m.last_name)), "N/A") AS Manager, department.name AS Department FROM employee e LEFT JOIN employee m ON e.manager_id = m.id INNER JOIN role ON e.role_id = role.id INNER JOIN Department ON role.department_id = department.id ORDER BY e.first_name ASC;'
  connection.query(query, function (err, res) {
    if (err) throw err;
    console.log("\n");
    console.table(res);

    // Start program over
    init();
  });
}

// ******* NOT USING CURRENTLY *******
// Prompt user for questions
const promptQuestions = (type) => {
  return inquirer.prompt(questions[type]);
};


const addEmployee = () => {

  let mgrArray = [];
  let mgrIdArray = [];

  let query = ('SELECT DISTINCT (concat(m.first_name, " " ,  m.last_name)) AS manager, e.manager_id AS id FROM employee e LEFT JOIN employee m ON e.manager_id = m.id WHERE e.manager_id IS NOT NULL;')
  connection.query(query, function (err, res) {
    if (err) throw err;
    mgrArray = res.map(obj => (`${obj.manager}`));
    mgrIdArray = res.map(obj => (`${obj.id}, ${obj.manager}`));
    // console.log(mgrArray);
    // console.log(mgrIdArray);

    inquirer.prompt(
      [
        {
          type: "input",
          name: "firstname",
          message: "What is the employee's first name?"
        },
        {
          type: "input",
          name: "lastname",
          message: "What is the employee's last name?"
        },
        {
          type: "list",
          name: "role",
          message: "What is the employee's role?",
          choices: [
            "Sales Lead",
            "Salesperson",
            "Lead Engineer",
            "Software Engineer",
            "Accountant",
            "Legal Team Lead",
            "Lawyer"
          ]
        },
        {
          type: "list",
          name: "manager",
          message: "Who is the employee's manager?",
          choices: mgrArray
        }
      ]
    )
      .then((res) => {


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


        // console.log(mgrIdArray);
        mgrIdArray.forEach(person => {
          // Credit:  Ask BCS helped me find a way to compare choices by using SPLIT
          let choices = person.split(",")[1].trim();
          if (choices == res.manager) {
            let managerId = person.split(",")[0];
            // console.log("####", managerId);


            // Query to add employee
            const query = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("${res.firstname}", "${res.lastname}", ${roleNumber}, ${managerId})`;
            connection.query(query, function (err) {
              if (err) throw err;
              console.log(`\n Added ${res.firstname} ${res.lastname} to the database! \n`);

              // Start program over
              init();
            })
          }
        })
      });
  })
}

const removeEmployee = () => {
  // Set up empty arrays to use later
  let empArray = [];
  let idArray = [];

  // Query for IDs and Names in ASC order
  const query = 'SELECT employee.id, concat(first_name, " ", last_name) AS employee FROM employee ORDER BY Employee ASC'
  connection.query(query, (err, res) => {
    if (err) throw err;
    empArray = res.map(obj => obj.employee);
    idArray = res.map(obj => (`${obj.id}, ${obj.employee}`));

    // Ask user which employee to remove
    inquirer.prompt({
      name: "employee",
      type: "list",
      message: "Which employee would you like to remove?",
      choices: empArray
    }).then((emp) => {

      // Then loop through all choices to match user choice
      idArray.forEach(person => {
        // Credit:  Ask BCS helped me find a way to compare choices by using SPLIT
        let choices = person.split(",")[1].trim();
        if (choices == emp.employee) {
          let chosenId = person.split(",")[0];

          // Query to remove the chosen employee
          const query = `DELETE from employee WHERE id = ${chosenId};`
          connection.query(query, (err, res) => {
            if (err) throw err;
            console.log(`\n ${emp.employee} successfully removed! \n`);

            // Start program over
            init();
          })
        }
      })
    })
  });
}


const updateEmployeeRole = () => {
  // Set up empty arrays to use later
  let empArray = [];
  let idArray = [];

  // Query for IDs and Names in ASC order
  const query = 'SELECT employee.id, concat(first_name, " ", last_name) AS employee FROM employee ORDER BY Employee ASC'
  connection.query(query, (err, res) => {
    if (err) throw err;
    empArray = res.map(obj => obj.employee);
    idArray = res.map(obj => (`${obj.id}, ${obj.employee}`));

    // Ask user which employee to remove
    inquirer.prompt([
      {
        name: "employee",
        type: "list",
        message: "Which employee would you like to update?",
        choices: empArray
      },
      {
        name: "role",
        type: "list",
        message: "Which new role would you like to use?",
        choices: [
          "Sales Lead",
          "Salesperson",
          "Lead Engineer",
          "Software Engineer",
          "Accountant",
          "Legal Team Lead",
          "Lawyer"
        ]
      }
    ]).then((emp) => {

      // Then loop through all choices to match user choice
      idArray.forEach(person => {
        let choices = person.split(",")[1].trim();
        if (choices == emp.employee) {
          let chosenId = person.split(",")[0];

          // Variable to get role_id
          let roleNumber;

          // Run through all responses to set the role_id
          if (emp.role == "Sales Lead") {
            roleNumber = "1";
          } else if (emp.role == "Salesperson") {
            roleNumber = "2";
          } else if (emp.role == "Lead Engineer") {
            roleNumber = "3";
          } else if (emp.role == "Software Engineer") {
            roleNumber = "4";
          } else if (emp.role == "Accountant") {
            roleNumber = "5";
          } else if (emp.role == "Legal Team Lead") {
            roleNumber = "6";
          } else roleNumber = "7";

          // Query to remove the chosen employee
          const query = `UPDATE employee SET role_id = ${roleNumber} WHERE id = ${chosenId};`
          connection.query(query, (err, res) => {
            if (err) throw err;
            console.log(`\n ${emp.employee}'s role successfully updated to ${emp.role}! \n`);

            // Start program over
            init();
          })
        }
      })
    })
  });
}