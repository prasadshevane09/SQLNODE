const { faker } = require('@faker-js/faker'); //fekar
const mysql = require("mysql2");
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const { v4: uuidv4 } = require("uuid");

app.use(methodOverride("_method"));
app.use(express.urlencoded({extended: true}));
app.set("view engine", "ejs"); //ejs
app.set("views", path.join(__dirname, "/views")); //ejs


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'delta_app',
    password: "Shevane?@33",
  });

  let getRandomUser = () => {
    return [
      faker.string.uuid(),
      faker.internet.username(), // before version 9.1.0, use userName()
      faker.internet.email(),
      faker.internet.password(),
    ];
};

// Home page or route
app.get('/', (req, res) => {
  let q = `Select count(*) from user`;
  try{
    connection.query(q, (err, result) => {
      if(err) throw err;
      let count = result[0]["count(*)"];
      res.render("home.ejs", { count });
    })
  } catch (err) {
      console.log(err);
      res.send("some error in db");
  }
 
});

// show route
app.get("/user", (req, res) => {
  let q = `select * from user`;

  try{
    connection.query(q, (err, users) => {
      if(err) throw err;
      res.render("showusers.ejs", { users });
    })
  } catch (err) {
      console.log(err);
      res.send("some error in db");
  }
});

//edit route
app.get("/user/:id/edit", (req, res) => {
    let { id } = req.params;
    let q = `select * from user where id = '${id}'`;

    try{
      connection.query(q, (err, result) => {
        if(err) throw err;
        let user = result[0];
        res.render("edit.ejs", { user });
      })
    } catch (err) {
        console.log(err);
        res.send("some error in db");
    }
});


// update route
app.patch("/user/:id", (req, res) => {
  let { id } = req.params;
  let {password: formPass, username: newUsername } = req.body;
  let q = `select * from user where id = '${id}'`;

  try{
    connection.query(q, (err, result) => {
      if(err) throw err;
      let user = result[0];
      if(formPass != user.password){
        res.send("Wrong password");
      } else {
        let q2 = `update user set username='${newUsername}' where id = '${id}'`;
        connection.query(q2, (err, result) => {
          if(err) throw err;
          res.redirect("/user");
        });
      }
    });
  } catch (err) {
      console.log(err);
      res.send("some error in db");
  }
});

// Adding new user
app.get("/user/newuser", (req, res) => {
  res.render("newuser.ejs");
});

app.post("/user/newuser", (req, res) => {
  let{ username, email, password } = req.body;
  let id = uuidv4();

  let q = `INSERT INTO user (id, username, email, password) VALUES ('${id}','${username}','${email}','${password}') `;
  
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      console.log("added new user");
      res.redirect("/user");
    });
  } catch (err) {
    res.send("some error occurred");
  }
});


app.get("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("delete.ejs", { user });
    });
  } catch (err) {
    res.send("some error with DB");
  }
});

app.delete("/user/:id/", (req, res) => {
  let { id } = req.params;
  let { password } = req.body;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];

      if (user.password != password) {
        res.send("WRONG Password entered!");
      } else {
        let q2 = `DELETE FROM user WHERE id='${id}'`; //Query to Delete
        connection.query(q2, (err, result) => {
          if (err) throw err;
          else {
            console.log(result);
            console.log("deleted!");
            res.redirect("/user");
          }
        });
      }
    });
  } catch (err) {
    res.send("some error with DB");
  }
});

app.listen("2020", () => {
  console.log("server is listning to port 2020");
});
