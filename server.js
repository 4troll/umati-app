const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const { MongoClient } = require("mongodb");

const app = express();

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

app.get("/*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "index.html"));
});



app.listen(process.env.PORT || 80, () => console.log("Server running..."));