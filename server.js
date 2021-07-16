const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { MongoClient } = require("mongodb");
var cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

var cookies = require("cookie-parser");
app.use(cookies());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var jsonParser = bodyParser.json();

//app.use("/static", express.static(path.resolve(__dirname, "frontend", "static")));
//app.use("/static", express.static(path.resolve(__dirname, "./client/src")));

//app.use("/fonts", express.static(path.resolve(__dirname, "client", "static/fonts")));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", req.hostname); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });


var uri = "mongodb+srv://mustafaA:loleris123@cluster0.2yo81.mongodb.net/test";

var usersDB;
var usersCollection;

try {
    var client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    client.connect( (err,db) => {
        if (err) {
            throw err;
        }
        usersDB = client.db("users");
        usersCollection = usersDB.collection("users");
    });
    }
    catch(e) {
        console.error(e);
    }
    finally {
        client.close();
}

app.post("/api/registerAccount", jsonParser, function (req, res) {
    if (req) {
        var newAccount;
        var taken;
        try {
            var client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
            client.connect( (err,db) => {
                if (err) throw err;

                var body = req.body;

                (async ()=>{
                    
                    newAccount = {
                        "username": body.username,
                        "email": body.email,
                        "password": body.password,
                        "admin": false,
                        "removed": false
                    }
                    taken = await usersCollection.findOne({username: body.username});
                    console.log(taken);
                    if (!taken) {
                        usersCollection.insertOne(newAccount);
                    }
                    
                })();
            });
        }
        catch(e) {
            console.error(e);
        }
        finally {
            client.close();
        }
        if (taken) {
            return "username taken";
        }
        res.json(newAccount).end();
    }
    else {
        res.status(404).end();
    }
});

app.post("/api/loginAccount", jsonParser, function (req, res) {
    if (req) {
        console.log("recieved at server");
        var loggedAccount;
        var user;
        try {
            var client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
            client.connect( (err,db) => {
                if (err) throw err;

                var body = req.body;

                (async ()=>{
                    loggedAccount = {
                        "username": body.username,
                        "password": body.password
                    }
                user = await usersCollection.findOne( {
                    $and: [
                        {username: body.username},
                        {password: body.password}
                    ]
                });
                if (user) {
                    res.json(loggedAccount).end();
                }
                else {
                    res.status(403).end();
                }
                

                })();
            });
        }
        catch(e) {
            console.error(e);
        }
        finally {
            client.close();
        }
    }
    else {
        res.status(404).end();
    }
});

app.get("/", redirectLoggedIn);
app.get("/login", redirectLoggedIn);
app.get("/register", redirectLoggedIn);

function redirectLoggedIn(req,res) {
    var body = req.cookies;
    console.log(body);
    var user;
    try {
            loggedAccount = {
                "username": body.username,
                "password": body.password
            }
            var client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
            client.connect( (err,db) => {
                if (err) throw err;
    
                (async ()=>{
                user = await usersCollection.findOne( {
                    $and: [
                        {username: body.username},
                        {password: body.password}
                    ]
                });
                console.log(user);
                if (user) {
                    res.redirect("/posts");
                }
                else if (req.originalUrl == "/register") {
                    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
                }
                else if (req.originalUrl != "/login") {
                    res.redirect("/login");
                }
                else {
                    //res.sendFile(path.resolve(__dirname, "frontend", "index.html"));
                    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
                }
                })
                ();
            });
    }
    catch (e) {
        console.error(e);
    }
    finally{
        client.close();
    }
}


if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')));

  // Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.listen(port, () => console.log(`Listening on port ${port}`));
