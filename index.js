const express = require('express');
const mysql = require("mysql2");
const app = express();
const path = require('path')
const dotenv = require('dotenv')

dotenv.config({ path: path.join(__dirname, './.env') })
app.use(express.json())

app.use(express.urlencoded({ extended: false }))


// 連線到rds
const rds_connection = mysql.createConnection({
  user: 'admin',
  password: process.env.PASSWORD,
  host: 'appworkswebdb.cblbc4wor1us.ap-northeast-1.rds.amazonaws.com',
  database: "assignment",
  port: 3306
});

// 確認是否連上
rds_connection.connect((err) => {
  if (err) {
    console.error(err);
  } else {
    console.log('successfully connected');
  }
});

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

// Email validation function
function emailValidation(email) {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if (emailRegex.test(email)) {
    return true;
  } else {
    return false;
  }
}

// Name validation function
function nameValidation(name) {
  const nameRegex = /[~`!@#$%^&*()_\-+={}\[\]:;"'<,>.?\/]+/;
  if (nameRegex.test(name) || (name === "")) {
    return false;
  } else {
    return true;
  }
}


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/healthcheck', (req, res) => {
  res.send('This page is for healthcheck')
})

// User Query API
app.get('/users', async (req, res) => {

  const id = req.query.id;
  const contentType = req.headers["content-type"];
  const requestDate = req.headers["request-date"];

  try {
    if (contentType === "application/json") {
      await rds_connection.promise().query("SELECT * FROM user WHERE id = ?", [id])
        .then((results) => {
          if (!results[0]) {
            return res.status(403).send("User not existing")
          } else {
            return res.status(200).send({
              "data": {
                "user": {
                  "id": id,
                  "name": results[0][0].name,
                  "email": results[0][0].email
                },
                "date": requestDate,
              }
            })
          }
        })
        .catch((err) => {
          return res.status(400).send(err)
        })
    } else {
      return res.send("Content type is not JSON");
    }
  } catch (error) {
    return res.send("Something went wrong")
  }


})

// User Sign Up APi
app.post('/users', async (req, res) => {

  const contentType = req.headers["content-type"];
  const requestDate = req.headers["request-date"];

  const userData = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  }

  // Content type validation
  if (contentType === "application/json") {

    // Name validation
    if (nameValidation(userData.name)) {

      // Email and password validation
      if (emailValidation(userData.email) && passwordValidation(userData.password)) {
        await rds_connection.promise().query("INSERT INTO user (name, email, password, created) VALUES (?,?,?,NOW())", [userData.name, userData.email, userData.password])
          .then((results) => {
            return res.status(200).send({
              "data": {
                "user": {
                  "id": results[0].insertId.toString(),
                  "name": userData.name,
                  "email": userData.email
                },
                "date": requestDate,
              }
            });
          })
          .catch((err) => {
            if (err.code === "ER_DUP_ENTRY") {
              return res.status(403).send("Email already exists")
            } else {
              return res.status(400).send("Client error")
            }
          })
      } else {
        return res.send("Invalid email or password");
      }
    }
    else {
      return res.send("Invalid user name");
    }
  } else {
    return res.send("Content type is not JSON");
  }

}
);

app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), () => {
  console.log("Example app listening to port")
});