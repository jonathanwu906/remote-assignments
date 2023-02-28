const express = require('express');
const mysql = require("mysql2");
const app = express();
require('dotenv').config();
app.use(express.json())

app.use(express.urlencoded({ extended: false }))


// 連線到rds
const rds_connection = mysql.createConnection({
  user: 'admin',
  password: process.env.PASSWORD,
  host: 'appworkswebdb.cblbc4wor1us.ap-northeast-1.rds.amazonaws.com',
  database: "assignment",
});

// 確認是否連上
rds_connection.connect((err) => {
  if (err) {
    console.error(err);
  } else {
    console.log('successfully connected');
  }
});



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/healthcheck', (req, res) => {
  res.send('This page is for healthcheck')
})

// User Query API
app.get('/users', (req, res) => {

  const id = req.body.id;

  const get_date = new Date().toUTCString();

  rds_connection.query("SELECT * FROM user WHERE id = ?", [id], (err, results) => {
    if (!results[0]) {
      return res.status(403).send("User not existing")
    } else if (err) {
      return res.status(400).send("Client error")
    } else {
      return res.status(200).send({
        "data": {
          "user": {
            "id": results[0].id,
            "name": results[0].name,
            "email": results[0].email
          },
          "date": get_date,
        }
      })
    }
  })

})

// User Sign Up APi
app.post('/users', (req, res) => {

  const userData = {
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


  // Password and Email validation
  if (passwordValidation(userData.password) && userData.email.includes("@")) {
    const request_date = new Date().toUTCString();
    rds_connection.query("INSERT INTO user (name, email, password, created) VALUES (?,?,?,NOW())", [userData.name, userData.email, userData.password], (err, results) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(403).send("Email already exists")
        } else {
          return res.status(400).send("Client error")
        }
      } else {
        return res.status(200).send({
          "data": {
            "user": {
              "id": results.insertId,
              "name": userData.name,
              "email": userData.email
            },
            "date": request_date,
          }
        })
      }
    })
  }
  else {
    return res.send("Invalid password or email");
  }
}
);





app.listen(3000, () => {
  console.log(`Example app listening on port 3000`)
})