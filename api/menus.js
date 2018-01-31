const express = require('express');
const sqlite3 = require('sqlite3');
const menusRouter = express.Router();
const db = new sqlite3.Database(process.env.TEST_DATABASE
|| './database.sqlite');

// Check if Menu with given Id exists
menusRouter.param('menuId', (req, res, next, menuId) => {
  const sql = 'SELECT * FROM Menu WHERE menu.id = $menuId';
  const values = {$menuId: menuId};
  db.get(sql, values, (error, menu) => {
    if (error) {
      next(error);
    } else if (menu) {
      req.menu = menu;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

// GET All Menus
menusRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Menu',
 (err, menus) => {
     if (err) {
       next(err);
     } else {
       res.status(200).json({menus: menus});
     }
 });
});

// GET Menu By ID
menusRouter.get('/:menuId', (req, res, next) => {
  res.status(200).json({menu: req.menu});
});

// POST a new Menu
menusRouter.post('/', (req, res, next) => {
  const title = req.body.menu.title;

  if (!title) {
   return res.sendStatus(400);
  }

  const sql = 'INSERT INTO Menu (title) VALUES ($title)';
  const values = {
    $title: title,
  };
  // INSERT New Menu and Return the New Record From the DB
  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`,
       (error, menu) => {
        res.status(201).json({menu: menu});
      });
    }
  });
});

// PUT Update an Existing Menu
menusRouter.put('/:menuId', (req, res, next) => {
  const title = req.body.menu.title;

  if (!title) {
   return res.sendStatus(400);
  }

  const sql = 'UPDATE Menu SET title = $title '
  + 'WHERE Menu.id = $menuId';
  const values = {
    $title: title,
    $menuId: req.params.menuId
  };

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`,
       (error, menu) => {
        res.status(200).json({menu: menu});
      });
    }
  });
});

// DELETE a Menu
menusRouter.delete('/:menuId', (req, res, next) => {

});

module.exports = menusRouter;
