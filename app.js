'use strict';

const express = require('express');
const app = express();

const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

const multer = require('multer');

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer().none());

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const INVALID_PARAM_ERROR = 400;
const SERVER_ERROR = 500;
const SERVER_ERROR_MSG = 'An error occurred on the server. Try again later.';
const PORT_8000 = 8000;

// endpoint 1：get all courses data and search courses(courses table)
app.get('/enroll/courses', async (req, res) => {
  try {
    let search = req.query.search;
    let result;
    let db = await getDBConnection();
    if (search) {
      let searchQuery =
        "SELECT * FROM courses " +
        "WHERE name LIKE ? OR title LIKE ? OR description LIKE ? ORDER BY id";
      result = await db.all(searchQuery, ['%' + search + '%',
      '%' + search + '%', '%' + search + '%']);
    } else {
      let query = 'SELECT * FROM courses ORDER BY id';
      result = await db.all(query);
    }

    await db.close();
    res.json(result);
  } catch (error) {
    res.type('text').status(SERVER_ERROR);
    res.send(SERVER_ERROR_MSG);
  }
});

// endpoint 2: Filter courses based on credit, department, and spot availability
app.get('/enroll/courses/filter', async (req, res) => {
  try {
    let query = "SELECT * FROM courses WHERE 1=1";
    let credit = req.query.credit;
    let department = req.query.department;
    let spot = req.query.spot;
    let result;
    let params = [];
    if (credit) {
      query += " AND credit = ?";
      params.push(credit);
    }
    if (department) {
      query += " AND name LIKE ?";
      params.push('%' + department + '%');
    }
    if (spot === "full") {
      query += " AND available_spot = 0";
    }
    if (spot === "notfull") {
      query += " AND available_spot > 0";
    }

    const db = await getDBConnection();
    result = await db.all(query, params);
    res.json(result);

  } catch (error) {
    res.type('text').status(SERVER_ERROR);
    res.send(SERVER_ERROR_MSG);
  }
});

// endpoint 3: Save user logged in with Cookies.
app.post('/enroll/login', async (req, res) => {
  try {
    let email = req.body.email;
    let password = req.body.password;
    let db = await getDBConnection();
    let query = 'SELECT * FROM users WHERE email = ? AND password = ?;';
    let result = await db.get(query, [email, password]);
    await db.close();
    if (result) {
      res.cookie("userId", result.user_id);
      res.type('text').send('success');
    } else {
      res.type('text').status(INVALID_PARAM_ERROR);
      res.send('Wrong email or password. Please try again.');
    }
  } catch (err) {
    res.type('text').status(SERVER_ERROR);
    res.send(SERVER_ERROR_MSG);
  }
});

// endpoint 4: Enroll courses.
app.post('/enroll/enrollcourse', async (req, res) => {
  try {
    let loginCheck = req.cookies;
    if (Object.keys(loginCheck).length !== 0) {
      let userId = loginCheck.userId;
      let courseId = req.body.id;
      let db = await getDBConnection();
      let getQuery = 'SELECT * FROM courses WHERE id = ?;';
      let result = await db.get(getQuery, courseId);
      let availableSpot = result.available_spot;
      if (availableSpot <= 0) {
        res.type('text').status(INVALID_PARAM_ERROR);
        res.send('There is no available spot.');
      } else {
        let query = 'UPDATE enrollment SET enrolled_courses = ? WHERE user_id = ?;';
        await db.run(query, [courseId, userId]);
        res.type('text').send('success');
      }
      await db.close();
    } else {
      res.type('text').status(INVALID_PARAM_ERROR);
      res.send('Please login at first.');
    }
  } catch (err) {
    res.type('text').status(SERVER_ERROR);
    res.send(SERVER_ERROR_MSG);
  }
});

// endpoint 5: Add to wishlist.
app.post('/enroll/addwishlist', async (req, res) => {
  try {
    let loginCheck = req.cookies;
    if (Object.keys(loginCheck).length !== 0) {
      let userId = loginCheck.userId;
      let courseId = req.body.id;
      let db = await getDBConnection();
      let query = 'UPDATE enrollment SET course_waiting = ? WHERE user_id = ?;';
      await db.run(query, [courseId, userId]);
      await db.close();
      res.type('text').send('success');
    } else {
      res.type('text').status(INVALID_PARAM_ERROR);
      res.send('Please login at first.');
    }
  } catch (err) {
    res.type('text').status(SERVER_ERROR);
    res.send(SERVER_ERROR_MSG);
  }
});

// endpoint 6: View account.
app.get('/enroll/viewenrollment', async (req, res) => {
  try {
    let loginCheck = req.cookies;
    if (Object.keys(loginCheck).length !== 0) {
      let userId = loginCheck.userId;
      let db = await getDBConnection();
      let getCompleted = 'SELECT name, title FROM courses c JOIN enrollment e ON ' +
      'c.id = e.pre_courses WHERE e.user_id = ?;';
      let completed = await db.get(getCompleted, userId);
      let getEnrolling = 'SELECT name, title FROM courses c JOIN enrollment e ON ' +
      'c.id = e.enrolled_courses WHERE e.user_id = ?;';
      let enrolling = await db.get(getEnrolling, userId);
      let getWishlist = 'SELECT name, title FROM courses c JOIN enrollment e ON ' +
      'c.id = e.course_waiting WHERE e.user_id = ?;';
      let wishlist = await db.get(getWishlist, userId);
      await db.close();
      let result = {'completed': {'name': completed.name, 'title': completed.title},
        'enrolling': {'name': enrolling.name, 'title': enrolling.title},
        'wishlist': {'name': wishlist.name, 'title': wishlist.title}};
      res.json(result);
    } else {
      res.type('text').status(INVALID_PARAM_ERROR);
      res.send('Please login at first.');
    }
  } catch (err) {
    res.type('text').status(SERVER_ERROR);
    res.send(SERVER_ERROR_MSG);
  }
});

// endpoint 7: Notification.
app.get('/enroll/notification', async (req, res) => {
  try {
    let loginCheck = req.cookies;
    let userId = loginCheck.userId;
    if (Object.keys(loginCheck).length !== 0) {
      res.type('text');
      let db = await getDBConnection();
      let checkWishlistQuery = 'SELECT course_waiting FROM enrollment WHERE user_id = ?;';
      let checkResult = await db.get(checkWishlistQuery, userId);
      if (checkResult) {
        let query = 'SELECT name, title FROM courses c JOIN enrollment e ON ' +
        'c.id = e.course_waiting WHERE e.user_id = ? AND c.available_spot != 0;';
        let result = await db.get(query, userId);
        await db.close();
        if (result) {
          res.send('Now there is spot available of ' + result.name + ': ' + result.title);
        } else {
          res.send('There is no available spot of your waiting course.');
        }
      } else {
        res.send('There is no course in your wishlist.');
      }
    } else {
      res.status(INVALID_PARAM_ERROR).send('Please login at first.');
    }
  } catch (err) {
    res.status(SERVER_ERROR).send(SERVER_ERROR_MSG);
  }
});

/**
 * Establishes a database connection to the database and returns the database object.
 * Any errors that occur should be caught in the function that calls this one.
 * @returns {Object} - The database object for the connection.
 */
async function getDBConnection() {
  const db = await sqlite.open({
    filename: 'enrollment.db',
    driver: sqlite3.Database
  });
  return db;
}

app.use(express.static('public'));
const PORT = process.env.PORT || PORT_8000;
app.listen(PORT);
