const inquirer = require("inquirer");
const mysql = require("mysql");
const consoleTable = require("console.table")
const async = require("async");

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
      "View Departments",
      "View Manager Database",
      "Add Employee",
      "Add New Role",
      "Add New Department",
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

        case "View Departments":
          // COMPLETE!!!
          viewDepartments();
          break;

        case "View Manager Database":
          // COMPLETE!!!
          viewManagers();
          break;

        case "Add Employee":
          // COMPLETE!!!
          addEmployee();
          break;

        case "Add New Role":
          // COMPLETE!!!
          addNewRole();
          break;

        case "Add New Department":
          // COMPLETE!!!
          addNewDepartment();
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
  let query = 'SELECT e.first_name AS "First Name", e.last_name AS "Last Name", role.title AS Title, role.salary AS Salary, IFNULL((concat(m.first_name, " " ,  m.last_name)), "N/A") AS Manager, department.name AS Department FROM employee e LEFT JOIN employee m ON e.manager_id = m.id INNER JOIN role ON e.role_id = role.id INNER JOIN Department ON role.department_id = department.id ORDER BY e.first_name ASC;';
  connection.query(query, function (err, res) {
    if (err) throw err;
    console.log("\n");
    console.table(res);

    // Start program over
    init();
  });
};

// Query to view all departments
const viewDepartments = () => {

  let query = 'SELECT name AS department FROM department;';
  connection.query(query, function (err, res) {
    if (err) throw err;
    deptArray = res.map(obj => (`${obj.department}`));
    console.log(deptArray);
    inquirer.prompt({
      name: "department",
      type: "list",
      message: "Which department would you like to view?",
      choices: deptArray
    }).then((res) => {
      let query = `SELECT department.name AS Department, e.first_name AS "First Name", e.last_name AS "Last Name", role.title AS Title, role.salary AS Salary, IFNULL((concat(m.first_name, " " ,  m.last_name)), "N/A") AS Manager FROM employee e LEFT JOIN employee m ON e.manager_id = m.id LEFT JOIN role ON e.role_id = role.id LEFT JOIN Department ON role.department_id = department.id WHERE department.name = "${res.department}";`;
      connection.query(query, function (err, res) {
        if (err) throw err;
        console.log("\n");
        console.table(res);

        // ********** Could add conditional here to say 
        // "No roles yet assigned to this DEPT"
        // if no data   **********

        // Start program over
        init();
      });
    });
  });
};

// Query to view all employees by manager
const viewManagers = () => {

  let query = 'SELECT DISTINCT IFNULL((concat(m.first_name, " " ,  m.last_name)), "N/A") AS manager FROM employee e LEFT JOIN employee m ON e.manager_id = m.id;';
  connection.query(query, function (err, res) {
    if (err) throw err;
    managerArray = res.map(obj => (`${obj.manager}`));
    inquirer.prompt({
      name: "manager",
      type: "list",
      message: "Which manager database would you like to view?",
      choices: managerArray
    }).then((res) => {
      let query = `SELECT IFNULL((concat(m.first_name, " " ,  m.last_name)), "N/A") AS Manager, e.first_name AS "First Name", e.last_name AS "Last Name", role.title AS Title, role.salary AS Salary, department.name AS Department FROM employee e LEFT JOIN employee m ON e.manager_id = m.id INNER JOIN role ON e.role_id = role.id INNER JOIN Department ON role.department_id = department.id WHERE (concat(m.first_name, " ", m.last_name)) = "${res.manager}";`;
      connection.query(query, function (err, res) {
        if (err) throw err;
        console.log("\n");
        console.table(res);

        // Start program over
        init();
      });
    });
  });
};

// ******* NOT USING CURRENTLY *******
// Prompt user for questions
const promptQuestions = (type) => {
  return inquirer.prompt(questions[type]);
};

const addEmployee = () => {

  let mgrArray = [];
  let mgrIdArray = [];
  let query = ('SELECT DISTINCT (concat(m.first_name, " " ,  m.last_name)) AS manager, e.manager_id AS id FROM employee e LEFT JOIN employee m ON e.manager_id = m.id WHERE e.manager_id IS NOT NULL;');
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
      ])
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

        mgrIdArray.forEach(person => {
          // Credit:  Ask BCS helped me find a way to compare choices by using SPLIT
          let choices = person.split(",")[1].trim();
          if (choices == res.manager) {
            let managerId = person.split(",")[0];

            // Query to add employee
            const query = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("${res.firstname}", "${res.lastname}", ${roleNumber}, ${managerId})`;
            connection.query(query, function (err) {
              if (err) throw err;
              console.log(`\n Added ${res.firstname} ${res.lastname} to the database! \n`);

              // Start program over
              init();
            });
          }
        });
      });
  });
};

const addNewRole = () => {

  let deptArray = [];
  let deptIdArray = [];
  let query = 'SELECT DISTINCT department.id, department.name AS department FROM employee e LEFT JOIN role ON e.role_id = role.id LEFT JOIN Department ON role.department_id = department.id;';
  connection.query(query, function (err, res) {
    if (err) throw err;
    deptArray = res.map(obj => (`${obj.department}`));
    deptIdArray = res.map(obj => (`${obj.id}, ${obj.department}`));
    inquirer.prompt([
      {
        type: "input",
        name: "role",
        message: "What is the title of the role you want to add?"
      },
      {
        type: "input",
        name: "salary",
        message: "What is the salary of this role?"
      },
      {
        type: "list",
        name: "department",
        message: "Which department does this role belong to?",
        choices: deptArray
      }]).then((answer) => {
        deptIdArray.forEach(dept => {
          let choice = dept.split(",")[1].trim();
          if (choice == answer.department) {
            let deptId = dept.split(",")[0];
            const newRoleQuery = `INSERT INTO role (title, salary, department_id) VALUES ("${answer.role}", ${answer.salary}, ${deptId});`;
            connection.query(newRoleQuery, function (err, res) {
              if (err) throw err;
              console.log(`\n Added ${answer.role} to the database! \n`);

              // Start program over
              init();
            });
          }
        })
      });
  });
};

const addNewDepartment = () => {
  inquirer.prompt({
    name: "department",
    type: "input",
    message: "Which department would you like to create?"
  }).then((answer) => {
    let newDeptQuery = `INSERT INTO department (name) VALUE ("${answer.department}");`;
    connection.query(newDeptQuery, (err, res) => {
      if (err) throw err;
      console.log(`\n ${answer.department} department successfully added!\n`);

      init();
    })
  })
};

const removeEmployee = () => {
  // Set up empty arrays to use later
  let empArray = [];
  let idArray = [];

  // Query for IDs and Names in ASC order
  const query = 'SELECT employee.id, concat(first_name, " ", last_name) AS employee FROM employee ORDER BY Employee ASC';
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
          let personId = person.split(",")[0];

          // Query to remove the chosen employee
          const query = `DELETE from employee WHERE id = ${personId};`;
          connection.query(query, (err, res) => {
            if (err) throw err;
            console.log(`\n ${emp.employee} successfully removed! \n`);

            // Start program over
            init();
          });
        }
      });
    });
  });
};


const updateEmployeeRole = () => {
  // Set up empty arrays to use later
  let empArray = [];
  let idArray = [];
  let roleArray = [];

  // Query for IDs and Names in ASC order
  const query = 'SELECT employee.id, concat(first_name, " ", last_name) AS employee FROM employee ORDER BY Employee ASC';
  connection.query(query, (err, res) => {
    if (err) throw err;
    empArray = res.map(obj => obj.employee);
    idArray = res.map(obj => (`${obj.id}, ${obj.employee}`));

    const roleQuery = 'SELECT id, title FROM role;';
    connection.query(roleQuery, (err, result) => {
      if (err) throw err;
      roleArray = result.map(obj => obj.title);
      roleIdArray = result.map(obj => `${obj.id}, ${obj.title}`);

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
          choices: roleArray
        }
      ]).then((emp) => {

        // Then loop through all choices to match user choice
        idArray.forEach(person => {
          let choices = person.split(",")[1].trim();
          if (choices == emp.employee) {
            let personId = person.split(",")[0];

            roleIdArray.forEach(role => {
              let roleChoice = role.split(",")[1].trim();
              if (roleChoice == emp.role) {
                let roleId = role.split(",")[0];

                const query = `UPDATE employee SET role_id = "${roleId}" WHERE id = ${personId};`;
                connection.query(query, (err, res) => {
                  if (err) throw err;
                  console.log(`\n ${emp.employee}'s role successfully updated to ${emp.role}! \n`);
    
                  // Start program over
                  init();
                });
              }
            });
          }
        });
      });
    });
  });
};