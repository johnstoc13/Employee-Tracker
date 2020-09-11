// Declare variables needed
const inquirer = require("inquirer");
const mysql = require("mysql");
const consoleTable = require("console.table");
const async = require("async");
const { validateFirstName, validateLastName, validateNumber, validateText } = require("./utils/validate");
// Credit:  https://voidcanvas.com/make-console-log-output-colorful-and-stylish-in-browser-node/
var colors = require('colors');

const managerQuery = ('SELECT DISTINCT (concat(m.first_name, " " ,  m.last_name)) AS manager, e.manager_id AS id FROM employee e LEFT JOIN employee m ON e.manager_id = m.id WHERE e.manager_id IS NOT NULL;');
const roleQuery = 'SELECT id, title FROM role;';
const deptQuery = 'SELECT id, name AS department FROM department;';
const empQuery = 'SELECT id, (concat(first_name, " ", last_name)) AS name FROM employee;';

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root1234',
  database: 'empTracker_DB'
});

// Initialize connection at start
connection.connect((err) => {
  if (err) throw err;
  welcome();
  init();
});

function welcome() {
  console.log(`\n`);
  console.log(',-------------------------------------------------------------.'.green);
  console.log('|                                                             |'.green);
  console.log('|                       \\                                     |'.green);
  console.log('|          ___________\\__\\____                                |'.green);
  console.log('|         /           /  /                                    |'.green);
  console.log('|        /              /         __  ________                |'.green);
  console.log('|       /                        |  ||__    __|               |'.green);
  console.log('|      /                         |  |   |  |                  |'.green);
  console.log("|                                |  |   |  |                  |".green);
  console.log('|          _____  _           ___|  |   |  |                  |'.green);
  console.log('|         |  _  ||_|         |_____/    |__|                  |'.green);
  console.log('|         | |_| | _  _ __  _   _   __ _  _   _  ____          |'.green);
  console.log("|         |  _  || || '__|| | | | / _` || | | |/ ,__|         |".green);
  console.log('|         | | | || || |   | /\\| || (_| || |_| |\\__, \\         |'.green);
  console.log('|         |_| |_||_||_|   \\_/\\_/  \\__,_| \\__, ||____/         |'.green);
  console.log('|                                        |___/                |'.green);
  console.log('|                                                             |'.green);
  console.log('|              E M P L O Y E E   D A T A B A S E              |'.green);
  console.log("`-------------------------------------------------------------'".green);
  console.log(`\n`);
}

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
      "Remove Department",
      "Remove Role",
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

        case "Remove Department":
          removeDepartment();
          break;

        case "Remove Role":
          removeRole();
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
  let rolesArray = [];
  let query = 'SELECT id, name AS department FROM department;';
  connection.query(query, function (err, res) {
    if (err) throw err;
    // Create department array
    deptArray = res.map(obj => (`${obj.department}`));
    idArray = res.map(obj => (`${obj.id}, ${obj.department}`));
    let nextQuery = 'SELECT id, department_id from role';
    connection.query(nextQuery, function (err, res) {
      if (err) throw err;
      checkArray = res.map(obj => (`${obj.department_id}`));
      rolesArray = res.map(obj => (`${obj.id}, ${obj.department_id}`));
    });
    inquirer.prompt({
      name: "department",
      type: "list",
      message: "Which department would you like to view?",
      choices: deptArray
    }).then((res) => {
      let idChoice;
      idArray.forEach(dept => {
        let choice = dept.split(",")[1].trim();
        let deptId = dept.split(",")[0];
        if (choice == res.department) {
          idChoice = deptId;
        }
      });

      const foundDept = checkArray.find(dept => {
        return (dept === idChoice);
      });

      connection.query(`SELECT id from role WHERE department_id = ${idChoice}`, function (err, res) {
        if (err) throw err;
        let roles = res.map(obj => (`${obj.id}`));

        connection.query(`SELECT role_id from employee`, function (err, res) {
          if (err) throw err;
          let empArray = res.map(obj => (`${obj.role_id}`));

          // Credit:  https://stackoverflow.com/questions/16312528/check-if-an-array-contains-any-element-of-another-array-in-javascript
          const finalCheck = empArray.some(emp => roles.includes(emp));

          if (foundDept && finalCheck === true) {
            let query = `SELECT department.name AS Department, e.first_name AS "First Name", e.last_name AS "Last Name", role.title AS Title, role.salary AS Salary, IFNULL((concat(m.first_name, " " ,  m.last_name)), "N/A") AS Manager FROM employee e LEFT JOIN employee m ON e.manager_id = m.id LEFT JOIN role ON e.role_id = role.id LEFT JOIN Department ON role.department_id = department.id WHERE department.id = "${idChoice}";`;
            connection.query(query, function (err, results) {
              if (err) throw err;
              console.log("\n");
              console.table(results);

              // Start program over
              init();
            });
          }
          else {
            console.log(`\nThis department has no data to view.\n`.red);
            init();
          }
        });
      });
    });
  });
};

// Query to view all employees by role/title
const viewRoles = () => {

  let roleArray = [];
  connection.query('SELECT id, title FROM role', function (err, res) {
    if (err) throw err;
    roleArray = res.map(obj => obj.title);
    idArray = res.map(obj => `${obj.id}, ${obj.title}`);
    let nextQuery = 'SELECT role_id from employee';
    connection.query(nextQuery, function (err, res) {
      if (err) throw err;
      checkArray = res.map(obj => (`${obj.role_id}`));
    });
    // Prompt user for input
    inquirer.prompt({
      name: "role",
      type: "list",
      message: "Which role would you like to view?",
      choices: roleArray
    }).then((res) => {
      let idChoice;
      idArray.forEach(role => {
        let choice = role.split(",")[1].trim();
        roleId = role.split(",")[0];
        if (choice == res.role) {
          idChoice = roleId;
        }
      });

      const foundRole = checkArray.find(role => {
        return (role === idChoice);
      });

      if (foundRole) {
        let query = `SELECT role.title AS Title, e.first_name AS "First Name", e.last_name AS "Last Name", role.salary AS Salary, IFNULL((concat(m.first_name, " " ,  m.last_name)), "N/A") AS Manager, department.name AS Department FROM employee e LEFT JOIN employee m ON e.manager_id = m.id LEFT JOIN role ON e.role_id = role.id LEFT JOIN Department ON role.department_id = department.id WHERE role.title = "${res.role}";`;
        connection.query(query, function (err, res) {
          if (err) throw err;
          console.log("\n");
          console.table(res);
          // Start program over
          init();
        });
      }
      else {
        console.log(`\nThe ${res.role} Role has no data to view.\n`.red);
        init();
      }
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
      if (res.manager === "N/A") {
        let query = `SELECT IFNULL((concat(m.first_name, " " ,  m.last_name)), "N/A") AS Manager, e.first_name AS "First Name", e.last_name AS "Last Name", role.title AS Title, role.salary AS Salary, department.name AS Department FROM employee e LEFT JOIN employee m ON e.manager_id = m.id INNER JOIN role ON e.role_id = role.id INNER JOIN Department ON role.department_id = department.id WHERE e.manager_id IS NULL;`;
        connection.query(query, function (err, res) {
          if (err) throw err;
          console.log("\n");
          console.table(res);
          init();
        });
      }
      else {
        let query = `SELECT IFNULL((concat(m.first_name, " " ,  m.last_name)), "N/A") AS Manager, e.first_name AS "First Name", e.last_name AS "Last Name", role.title AS Title, role.salary AS Salary, department.name AS Department FROM employee e LEFT JOIN employee m ON e.manager_id = m.id INNER JOIN role ON e.role_id = role.id INNER JOIN Department ON role.department_id = department.id WHERE (concat(m.first_name, " ", m.last_name)) = "${res.manager}";`;
        connection.query(query, function (err, res) {
          if (err) throw err;
          console.log("\n");
          console.table(res);
          // Start program over
          init();
        });
      }
    });
  });
};

// Query to add a new employee to the database
const addEmployee = () => {

  let empArray = [];
  let empIdArray = [];
  // Get updated manager list for empArray
  connection.query(empQuery, function (err, res) {
    if (err) throw err;
    empArray = res.map(obj => (`${obj.name}`));
    empIdArray = res.map(obj => (`${obj.id}, ${obj.name}`));

    // Get updated role list for roleArray
    connection.query(roleQuery, (err, result) => {
      if (err) throw err;
      roleArray = result.map(obj => obj.title);
      roleIdArray = result.map(obj => `${obj.id}, ${obj.title}`);

      // Find out if employee has a manager assigned
      inquirer.prompt(
        {
          type: "list",
          name: "haveManager",
          message: "Does this employee have a manager?",
          choices: [
            "YES",
            "NO"
          ]
        }).then((res) => {
          if (res.haveManager == "YES") {
            // Prompt user for questions
            inquirer.prompt(
              [
                {
                  type: "input",
                  name: "firstname",
                  message: "What is the employee's first name?",
                  validate: validateFirstName
                },
                {
                  type: "input",
                  name: "lastname",
                  message: "What is the employee's last name?",
                  validate: validateLastName
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
                  choices: empArray
                }
              ])
              .then((emp) => {

                empIdArray.forEach(person => {
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
                          console.log(`\n Added ${emp.firstname} ${emp.lastname} to the database! \n`.green);

                          // Start program over
                          init();
                        });
                      }
                    });
                  }
                });
              });
          }
          else {
            // Prompt user for questions
            inquirer.prompt(
              [
                {
                  type: "input",
                  name: "firstname",
                  message: "What is the employee's first name?",
                  validate: validateFirstName
                },
                {
                  type: "input",
                  name: "lastname",
                  message: "What is the employee's last name?",
                  validate: validateLastName
                },
                {
                  type: "list",
                  name: "role",
                  message: "What is the employee's role?",
                  choices: roleArray
                }
              ])
              .then((emp) => {
                roleIdArray.forEach(role => {
                  let roleChoice = role.split(",")[1].trim();
                  if (roleChoice == emp.role) {
                    // Get role ID
                    let roleId = role.split(",")[0];

                    // Query to add employee
                    const query = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("${emp.firstname}", "${emp.lastname}", ${roleId}, null)`;
                    connection.query(query, function (err) {
                      if (err) throw err;
                      console.log(`\n Added ${emp.firstname} ${emp.lastname} to the database! \n`.green);

                      // Start program over
                      init();
                    });
                  }
                });
              });
          }
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
        message: "What is the title of the role you want to add?",
        validate: validateText
      },
      {
        type: "input",
        name: "salary",
        message: "What is the salary of this role?",
        validate: validateNumber
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
              console.log(`\n Added ${answer.role} to the database! \n`.green);

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
    message: "Which department would you like to create?",
    validate: validateText
  }).then((answer) => {
    let newDeptQuery = `INSERT INTO department (name) VALUE ("${answer.department}");`;
    connection.query(newDeptQuery, (err, res) => {
      if (err) throw err;
      console.log(`\n ${answer.department} department successfully added!\n`.green);

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
                  console.log(`\n ${emp.employee}'s role successfully updated to ${emp.role}! \n`.green);

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
      inquirer.prompt({
          name: "employee",
          type: "list",
          message: "Which employee would you like to update?",
          choices: empArray
        }).then((emp) => {

        // Then loop through all choices to match user choice
        let personId;
        idArray.forEach(person => {
          let choices = person.split(",")[1].trim();
          if (choices == emp.employee) {
            // Declare employee ID
            personId = person.split(",")[0];
          }
        });

        // Remove employee from empArray (emp cannot manage themselves)
        const availMgrArray = empArray.filter((val) => val != `${emp.employee}`);
        inquirer.prompt({
          name: "manager",
          type: "list",
          message: "Who is the employee's new manager?",
          choices: availMgrArray
        }).then((res) => {
          idArray.forEach(role => {
            let mgrChoice = role.split(",")[1].trim();
            if (mgrChoice == res.manager) {
              // Declare manager ID
              let managerId = role.split(",")[0];
  
              const query = `UPDATE employee SET manager_id = "${managerId}" WHERE id = ${personId};`;
              connection.query(query, (err, res) => {
                if (err) throw err;
                console.log(`\n ${emp.employee}'s manager successfully updated to ${mgrChoice}! \n`.green);
  
                // Start program over
                init();
              });
            }
          });
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
  let mgrIdArray = [];

  // Query for IDs and Names in ASC order
  const query = 'SELECT employee.id, concat(first_name, " ", last_name) AS employee, manager_id FROM employee ORDER BY Employee ASC';
  connection.query(query, (err, res) => {
    if (err) throw err;
    empArray = res.map(obj => obj.employee);
    idArray = res.map(obj => (`${obj.id}, ${obj.employee}`));
    mgrIdArray = res.map(obj => (`${obj.manager_id}, ${obj.employee}`));
    mgrIdsOnly = res.map(obj => (`${obj.manager_id}`));

    // Ask user which employee to remove
    inquirer.prompt([
      {
        name: "employee",
        type: "list",
        message: "Which employee would you like to remove?",
        choices: empArray
      },
      {
        name: "confirm",
        type: "list",
        message: "Are you sure you want to delete this employee?",
        choices: [
          "YES",
          "NO"
        ]
      }]).then((emp) => {
        if (emp.confirm == "NO") {
          console.log(`\nYour request has been cancelled!\n`.red);
          init();
        } else {
          // Then loop through all choices to match user choice
          let personId;
          idArray.forEach(person => {
            // Credit:  Ask BCS helped me find a way to compare choices by using SPLIT
            let choices = person.split(",")[1].trim();
            if (choices == emp.employee) {
              personId = person.split(",")[0];
            }
          });
          // Look through roles to see if any are assigned to department selected
          let mgrChoice;
          mgrIdArray.forEach(person => {
            let choice = person.split(",")[1].trim();
            if (choice == emp.employee) {
              mgrChoice = person.split(",")[0];
            }
          });
          const foundManager = mgrIdsOnly.find(managerId => {
            return (managerId === personId);
          });
          if (foundManager) {
            console.log(`\nYou cannot delete a management employee with 'employees' assigned to them.\n`.red);
            inquirer.prompt(
              {
                name: "decision",
                type: "list",
                message: "What would you like to do now?",
                choices: [
                  "View Manager Database",
                  "View All Employees",
                  "Update Employee Manager",
                  "Start Over"
                ]
              }).then((next) => {
                if (next.decision == "View Manager Database") {
                  viewManagers();
                }
                else if (next.decision == "View All Employees") {
                  viewAll();
                }
                else if (next.decision == "Update Employee Manager") {
                  updateEmployeeManager();
                }
                else {
                  init();
                }
              });
          }
          else {
            // Query to remove the chosen employee
            const query = `DELETE from employee WHERE id = ${personId};`;
            connection.query(query, (err, res) => {
              if (err) throw err;
              console.log(`\n ${emp.employee} successfully removed! \n`.green);

              // Start program over
              init();
            });
          }
        }
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

// Query to remove a department from database
const removeDepartment = () => {
  let deptArray = [];
  let deptId;
  connection.query(deptQuery, function (err, res) {
    if (err) throw err;
    deptArray = res.map(obj => (`${obj.department}`));
    deptIdArray = res.map(obj => (`${obj.id}, ${obj.department}`));

    let roleDeptQuery = (`SELECT title, department_id FROM role;`);
    connection.query(roleDeptQuery, function (err, res) {
      roleArray = res.map(obj => (`${obj.title}`));
      roleIdArray = res.map(obj => (`${obj.department_id}, ${obj.title}`));
      roleIdsOnlyArray = res.map(obj => (`${obj.department_id}`));

      inquirer.prompt([
        {
          name: "dept",
          type: "list",
          message: "Which department would you like to remove?",
          choices: deptArray
        },
        {
          name: "confirm",
          type: "list",
          message: "Are you sure you want to delete this department?",
          choices: [
            "YES",
            "NO"
          ]
        }]).then((res) => {
          if (res.confirm == "NO") {
            console.log(`Your request has been cancelled!\n`.red);
            init();
          } else {
            // Then loop through all choices to match user choice
            let idChoice;
            deptIdArray.forEach(dept => {
              let choice = dept.split(",")[1].trim();
              deptId = dept.split(",")[0];
              if (choice == res.dept) {
                idChoice = deptId;
              }
            });

            // Look through roles to see if any are assigned to department selected
            const foundArray = roleIdsOnlyArray.find(roleId => {
              return (roleId === idChoice);
            });

            // If found, disallow user to delete the department
            if (foundArray) {
              console.log(`\nYou cannot delete a department with 'roles' assigned to it.\n`.red);
              inquirer.prompt(
                {
                  name: "decision",
                  type: "list",
                  message: "What would you like to do now?",
                  choices: [
                    "View Department",
                    "View Roles",
                    "Remove Roles",
                    "Start Over"
                  ]
                }).then((next) => {
                  if (next.decision == "View Department") {
                    viewDepartments();
                  }
                  else if (next.decistion == "View Roles") {
                    viewRoles();
                  }
                  else if (next.decision == "Remove Roles") {
                    removeRole();
                  }
                  else {
                    init();
                  }
                });
            }
            else {
              // Otherwise perform query to delete department
              const query = `DELETE from department WHERE id = ${idChoice};`;
              connection.query(query, (err, result) => {
                if (err) throw err;
                console.log(`\n ${res.dept} Department successfully removed! \n`.green);

                // Start program over
                init();
              });
            }
          }
        });
    });
  });
};

// Query to remove a role from database
const removeRole = () => {
  let roleArray = [];
  let roleId;
  connection.query(roleQuery, function (err, res) {
    if (err) throw err;
    roleArray = res.map(obj => (`${obj.title}`));
    roleIdArray = res.map(obj => (`${obj.id}, ${obj.title}`));

    let empRoleQuery = (`SELECT concat(first_name, " ", last_name) AS name, role_id FROM employee;`);
    connection.query(empRoleQuery, function (err, res) {
      if (err) throw err;
      empArray = res.map(obj => (`${obj.name}`));
      empIdArray = res.map(obj => (`${obj.role_id}, ${obj.name}`));
      empIdsOnlyArray = res.map(obj => (`${obj.role_id}`));

      inquirer.prompt([
        {
          name: "role",
          type: "list",
          message: "Which role would you like to remove?",
          choices: roleArray
        },
        {
          name: "confirm",
          type: "list",
          message: "Are you sure you want to delete this role?",
          choices: [
            "YES",
            "NO"
          ]
        }]).then((res) => {
          if (res.confirm == "NO") {
            console.log(`Your request has been cancelled!\n`.red);
            init();
          } else {
            // Then loop through all choices to match user choice
            let idChoice;
            roleIdArray.forEach(role => {
              let choice = role.split(",")[1].trim();
              roleId = role.split(",")[0];
              if (choice == res.role) {
                idChoice = roleId;
              }
            });

            // Look through roles to see if any are assigned to department selected
            const foundArray = empIdsOnlyArray.find(empId => {
              return (empId === idChoice);
            });

            // If found, disallow user to delete the department
            if (foundArray) {
              console.log(`\nYou cannot delete a role with 'employees' assigned to it.\n`.red);
              inquirer.prompt(
                {
                  name: "decision",
                  type: "list",
                  message: "What would you like to do now?",
                  choices: [
                    "View Roles",
                    "View All Employees",
                    "Remove Employee",
                    "Start Over"
                  ]
                }).then((next) => {
                  if (next.decision == "View Roles") {
                    viewRoles();
                  }
                  else if (next.decision == "View All Employees") {
                    viewAll();
                  }
                  else if (next.decision == "Remove Employee") {
                    removeEmployee();
                  }
                  else {
                    init();
                  }
                });
            }
            else {
              // Otherwise perform query to delete department
              const query = `DELETE from role WHERE id = ${idChoice};`;
              connection.query(query, (err, result) => {
                if (err) throw err;
                console.log(`\n ${res.role} role successfully removed! \n`.green);

                // Start program over
                init();
              });
            }
          }
        });
    });
  });
};