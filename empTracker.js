const inquirer = require("inquirer");
const mysql = require("mysql");
const consoleTable = require("console.table");

const {Employee, Role, Department} = require("./lib/Creators");

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root1234',
    database : 'empTracker_DB'
  });

  connection.connect();

  connection.query('SELECT * from employee', function (error, results, fields) {
    if (error) throw error;
    console.table(results);
  });

  connection.end();