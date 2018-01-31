const express = require('express');
const sqlite3 = require('sqlite3');
const employeesRouter = express.Router();
const db = new sqlite3.Database(process.env.TEST_DATABASE
|| './database.sqlite');
const timesheetsRouter = require('./timesheets');
employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);

// Check if Employee with given Id exists
employeesRouter.param('employeeId', (req, res, next, employeeId) => {
  const sql = 'SELECT * FROM Employee WHERE Employee.id = $employeeId';
  const values = {$employeeId: employeeId};
  db.get(sql, values, (error, employee) => {
    if (error) {
      next(error);
    } else if (employee) {
      req.employee = employee;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

// GET All Employees
employeesRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Employee WHERE Employee.is_current_employee = 1',
 (err, employees) => {
     if (err) {
       next(err);
     } else {
       res.status(200).json({employees: employees});
     }
 });
});

// GET employees By ID
employeesRouter.get('/:employeeId', (req, res, next) => {
  res.status(200).json({employee: req.employee});
});

// POST a new employee
employeesRouter.post('/', (req, res, next) => {
  const name = req.body.employee.name;
  const position = req.body.employee.position;
  const wage = req.body.employee.wage;
  const is_current_employee = req.body.employee.is_current_employee === 0 ? 0 : 1;

  if (!name || !position || !wage) {
   return res.sendStatus(400);
  }

  const sql = 'INSERT INTO Employee (name, position, wage, '
  +  'is_current_employee) VALUES ($name, $position, $wage, '
  + '$is_current_employee)';
  const values = {
    $name: name,
    $position: position,
    $wage: wage,
    $is_current_employee: is_current_employee
  };
  // INSERT New Employee and Return the New Record From the DB
  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`,
       (error, employee) => {
        res.status(201).json({employee: employee});
      });
    }
  });
});

// PUT Update an Existing Employee
employeesRouter.put('/:employeeId', (req, res, next) => {
  const name = req.body.employee.name;
  const position = req.body.employee.position;
  const wage = req.body.employee.wage;
  const is_current_employee = req.body.employee.is_current_employee === 0 ? 0 : 1;

  if (!name || !position || !wage) {
   return res.sendStatus(400);
  }

  const sql = 'UPDATE Employee SET name = $name, position = $position, '
  + 'wage = $wage, is_current_employee = $is_current_employee '
  + 'WHERE Employee.id = $employeeId';
  const values = {
    $name: name,
    $position: position,
    $wage: wage,
    $is_current_employee: is_current_employee,
    $employeeId: req.params.employeeId
  };

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`,
       (error, employee) => {
        res.status(200).json({employee: employee});
      });
    }
  });
});

// DELETE an Employee
employeesRouter.delete('/:employeeId', (req, res, next) => {
  const sql = 'UPDATE Employee SET is_current_employee = 0 '
  + 'WHERE Employee.id = $employeeId';
  const values = {
    $employeeId: req.params.employeeId
  };

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`,
       (error, employee) => {
        res.status(200).json({employee: employee});
      });
    }
  });
});

module.exports = employeesRouter;
