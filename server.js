const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const { MongoClient } = require("mongodb");

const app = express();

var cookies = require("cookie-parser");
const { nextTick } = require("process");
app.use(cookies());

var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use("/static", express.static(path.resolve(__dirname, "frontend", "static")));
app.use("/fonts", express.static(path.resolve(__dirname, "frontend", "static/fonts")));

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

                })();
            });
        }
        catch(e) {
            console.error(e);
        }
        finally {
            client.close();
        }
        res.json(loggedAccount).end();
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
    var user;
    var rootUrl = req.protocol + '://' + req.get('host');
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
                    res.redirect(rootUrl + "/posts");
                }
                else if (req.originalUrl != "/login") {
                    res.redirect(rootUrl + "/login");
                }
                else {
                    res.sendFile(path.resolve(__dirname, "frontend", "index.html"));
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

app.get("/*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "index.html"));
});



app.listen(process.env.PORT || 80, () => console.log("Server running..."));