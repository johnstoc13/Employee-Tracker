// Declare variables needed
const inquirer = require("inquirer");
const mysql = require("mysql");
const consoleTable = require("console.table");
const async = require("async");

// const { Employee, Role, Department } = require("./lib/Creators");
// const questions = require("./utils/questions");

const roleQuery = 'SELECT id, title FROM role;';
const managerQuery = ('SELECT DISTINCT (concat(m.first_name, " " ,  m.last_name)) AS manager, e.manager_id AS id FROM employee e LEFT JOIN employee m ON e.manager_id = m.id WHERE e.manager_id IS NOT NULL;');
const deptQuery = 'SELECT id, name AS department FROM department;';

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root1234',
  database: 'empTracker_DB'
});

// Initialize connection at start
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
      "View Roles",
      "View Manager Database",
      "Add Employee",
      "Add New Role",
      "Add New Department",
      "Update Employee Role",
      "Update Employee Manager",
      "Remove Employee",
      "View Department Budget",
      "Exit"
    ]
  })
    .then((answer) => {
      switch (answer.action) {

        case "View All Employees":
          viewAll();
          break;

        case "View Departments":
          viewDepartments();
          break;

        case "View Roles":
          viewRoles();
          break;

        case "View Manager Database":
          viewManagers();
          break;

        case "Add Employee":
          addEmployee();
          break;

        case "Add New Role":
          addNewRole();
          break;

        case "Add New Department":
          addNewDepartment();
          break;

        case "Update Employee Role":
          updateEmployeeRole();
          break;

        case "Update Employee Manager":
          updateEmployeeManager();
          break;

        case "Remove Employee":
          removeEmployee();
          break;

        case "View Department Budget":
          viewDepartmentBudget();
          break;

        case "Exit":
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

  let deptArray = [];
  let query = 'SELECT name AS department FROM department;';
  connection.query(query, function (err, res) {
    if (err) throw err;
    // Create department array
    deptArray = res.map(obj => (`${obj.department}`));
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
        // ********** Could add conditional here to say "No roles yet assigned to this DEPT" if no data **********

        // Start program over
        init();
      });
    });
  });
};

// Query to view all employees by role/title
const viewRoles = () => {

  let roleArray = [];
  connection.query('SELECT title FROM role', function (err, res) {
    if (err) throw err;
    roleArray = res.map(obj => obj.title);
    // Prompt user for input
    inquirer.prompt({
      name: "role",
      type: "list",
      message: "Which role would you like to view?",
      choices: roleArray
    }).then((res) => {
      let query = `SELECT role.title AS Title, e.first_name AS "First Name", e.last_name AS "Last Name", role.salary AS Salary, IFNULL((concat(m.first_name, " " ,  m.last_name)), "N/A") AS Manager, department.name AS Department FROM employee e LEFT JOIN employee m ON e.manager_id = m.id LEFT JOIN role ON e.role_id = role.id LEFT JOIN Department ON role.department_id = department.id WHERE role.title = "${res.role}";`;
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
// const promptQuestions = (type) => {
//   return inquirer.prompt(questions[type]);
// };

// Query to add a new employee to the database
const addEmployee = () => {

  let mgrArray = [];
  let mgrIdArray = [];
  // Get updated manager list for mgrArray
  connection.query(managerQuery, function (err, res) {
    if (err) throw err;
    mgrArray = res.map(obj => (`${obj.manager}`));
    mgrIdArray = res.map(obj => (`${obj.id}, ${obj.manager}`));
    // Get updated role list for roleArray
    connection.query(roleQuery, (err, result) => {
      if (err) throw err;
      roleArray = result.map(obj => obj.title);
      roleIdArray = result.map(obj => `${obj.id}, ${obj.title}`);

      // Prompt user for questions
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
            choices: roleArray
          },
          {
            type: "list",
            name: "manager",
            message: "Who is the employee's manager?",
            choices: mgrArray
          }
        ])
        .then((emp) => {

          mgrIdArray.forEach(person => {
            // Credit:  Ask BCS helped me find a way to compare choices by using SPLIT
            let choices = person.split(",")[1].trim();
            if (choices == emp.manager) {
              // Get manager ID
              let managerId = person.split(",")[0];

              roleIdArray.forEach(role => {
                let roleChoice = role.split(",")[1].trim();
                if (roleChoice == emp.role) {
                  // Get role ID
                  let roleId = role.split(",")[0];

                  // Query to add employee
                  const query = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("${emp.firstname}", "${emp.lastname}", ${roleId}, ${managerId})`;
                  connection.query(query, function (err) {
                    if (err) throw err;
                    console.log(`\n Added ${emp.firstname} ${emp.lastname} to the database! \n`);

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

// Query to add new role to database
const addNewRole = () => {

  let deptArray = [];
  let deptIdArray = [];
  // Get updated list of departments
  connection.query(deptQuery, function (err, res) {
    if (err) throw err;
    deptArray = res.map(obj => (`${obj.department}`));
    deptIdArray = res.map(obj => (`${obj.id}, ${obj.department}`));
    // Prompt user for inputs
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
            // Declare department ID to use in query
            let deptId = dept.split(",")[0];
            const newRoleQuery = `INSERT INTO role (title, salary, department_id) VALUES ("${answer.role}", ${answer.salary}, ${deptId});`;
            connection.query(newRoleQuery, function (err, res) {
              if (err) throw err;
              console.log(`\n Added ${answer.role} to the database! \n`);

              // Start program over
              init();
            });
          }
        });
      });
  });
};

// Query to add new department to database
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
    });
  });
};

// Query to update employee's role
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

// Query to update employee's manager
const updateEmployeeManager = () => {
  // Set up empty arrays to use later
  let empArray = [];
  let idArray = [];
  let managerArray = [];
  let managerIdArray = [];

  // Query for IDs and Names in ASC order
  const query = 'SELECT employee.id, concat(first_name, " ", last_name) AS employee FROM employee ORDER BY Employee ASC';
  connection.query(query, (err, res) => {
    if (err) throw err;
    empArray = res.map(obj => obj.employee);
    idArray = res.map(obj => (`${obj.id}, ${obj.employee}`));

    // Get updated list of managers
    connection.query(managerQuery, (err, result) => {
      if (err) throw err;
      managerArray = result.map(obj => obj.manager);
      managerIdArray = result.map(obj => `${obj.id}, ${obj.manager}`);

      // Ask user which employee to update
      inquirer.prompt([
        {
          name: "employee",
          type: "list",
          message: "Which employee would you like to update?",
          choices: empArray
        },
        {
          name: "manager",
          type: "list",
          message: "Who is the employee's new manager?",
          choices: managerArray
        }
      ]).then((emp) => {

        // Then loop through all choices to match user choice
        idArray.forEach(person => {
          let choices = person.split(",")[1].trim();
          if (choices == emp.employee) {
            // Declare employee ID
            let personId = person.split(",")[0];

            managerIdArray.forEach(role => {
              let mgrChoice = role.split(",")[1].trim();
              if (mgrChoice == emp.manager) {
                // Declare manager ID
                let managerId = role.split(",")[0];

                const query = `UPDATE employee SET manager_id = "${managerId}" WHERE id = ${personId};`;
                connection.query(query, (err, res) => {
                  if (err) throw err;
                  console.log(`\n ${emp.employee}'s manager successfully updated to ${emp.manager}! \n`);

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

// Query to remove an employee from database
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

// Query to view each department's budget
const viewDepartmentBudget = () => {
  let deptArray = [];
  connection.query(deptQuery, function (err, res) {
    if (err) throw err;
    deptArray = res.map(obj => (`${obj.department}`));
    inquirer.prompt(
      {
        name: "dept",
        type: "list",
        message: "Which department's budget would you like to view?",
        choices: deptArray
      }
    ).then((ans) => {
      // Credit:  https://www.w3schools.com/sql/sql_count_avg_sum.asp
      let budgetQuery = `SELECT IFNULL(SUM(salary), "$0") AS "Total ${ans.dept} Department Budget" FROM employee e LEFT JOIN employee m ON e.manager_id = m.id LEFT JOIN role ON e.role_id = role.id LEFT JOIN Department ON role.department_id = department.id WHERE department.name = "${ans.dept}";`;
      connection.query(budgetQuery, function (err, res) {
        if (err) throw err;
        let totalBudget = res.map(obj => obj);
        console.log(`\n`);
        console.table(totalBudget);
        init();
      });
    });
  });
};