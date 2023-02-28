const express = require('express');
const mysql = require("mysql2");

require('dotenv').config();
const app = express();

app.use(express.json())

app.use(express.urlencoded({ extended: false }))


// 連線到rds
const rds_connection = mysql.createConnection({
  user: 'admin',
  password: process.env.PASSWORD,
  host: 'appworkswebdb.cblbc4wor1us.ap-northeast-1.rds.amazonaws.com',
  database: "assignment",
  // ssl: 'Amazon RDS'
});

// 確認是否連上
rds_connection.connect((err) => {
  if (err) {
    console.error(err);
  } else {
    console.log('successfully connected');
  }
});

// simple query
// rds_connection.query(
//   'SELECT `name` FROM `user` WHERE `email` = "jonathanwu906@gmail.com"',
//   function (err, results, fields) {
//     console.log(results[0] === undefined); // results contains rows returned by server
//     // console.log(fields); // fields contains extra meta data about results, if available
//   }
// );



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/healthcheck', (req, res) => {
  res.send('This page is for healthcheck')
})

// User Query API
app.get('/users', (req, res) => {

  const data = {
    id: req.body.id,
  }

  rds_connection.query(
    "SELECT id FROM user WHERE id = ?", [data.id],
    function (err, results, fields) {
      if (results[0] !== undefined) {
        res.status(200);
        res.send({
          "data": {
            "user": {
              "id": 13,
              "name": data.name,
              "email": data.email
            },
            // "date": req.get(Date),
          }
        });
      } else {
        res.status(403);
        res.send("User not existing");
      };
    })

})

// User Sign Up APi
app.post('/users', async (req, res) => {

  const data = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  }

  // Password validation function
  function passwordValidation(password) {
    let type = 0;
    if (/[A-Z]+/.test(password)) { type++ };
    if (/[a-z]+/.test(password)) { type++ };
    if (/[0-9]+/.test(password)) { type++ };
    if (/[~`!@#$%^&*()_\-+={}\[\]:;"'<,>.?\/]+/.test(password)) { type++ };
    if (type >= 3) {
      return true;
    } else {
      return false;
    }
  }

  function emailValidation(email) {
    rds_connection.query(
      "SELECT name FROM user WHERE email = ?", [email],
      function (err, results, fields) {
        if (err !== null) {
          return true;
        } else {
          return
        };
      })
  }

  try {
    // // Email already exists: 403
    if (emailValidation(data.email)) {
      res.status(403).send("Email already exists");
    } else if (passwordValidation(data.password) === true && data.email.includes("@")) {
      // Password and Email validation
      rds_connection.execute("INSERT INTO user (name,email,password,created) VALUES (?,?,?,NOW())", [data.name, data.email, data.password]);
      res.status(200);
      res.send({
        "data": {
          "user": {
            "id": 13,
            "name": data.name,
            "email": data.email
          },
          // "date": req.get(Date),
        }
      });
    } else {
      res.send("Invalid password or email");
    }
  } catch (error) {
    res.send("403 Client error");
  }
})



app.listen(3000, () => {
  console.log(`Example app listening on port 3000`)
})