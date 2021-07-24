const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { MongoClient } = require("mongodb");
const cors = require("cors");
const validator = require("validator");

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const sharp = require("sharp"); // img processing

const app = express();
const port = process.env.PORT || 5000;

var cookies = require("cookie-parser");
app.use(cookies());
app.use(cors());
app.use(express.json({limit: '10mb', extended: true}));
app.use(express.urlencoded({
    extended: true
}));

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
var umatisDB;
var umatisCollection;
var postsDB;
var postsCollection;

function generateAccessToken(userJson) {
    return jwt.sign(userJson, process.env.TOKEN_SECRET, { expiresIn: "1800s" });
}

const middleware = {
    jsonParser: jsonParser,
    authenticateToken: function (req, res, next) {
        // check header or url parameters or post parameters for token
        var token = req.body.token || req.query.token || req.headers["Authorization"] || req.cookies.token;
        // decode token
        if (token) {
            // verifies secret and checks exp
            jwt.verify(token, process.env.TOKEN_SECRET, function (err, decoded) {
                if (err) {
                    var err = new Error('You are not authenticated!');
                    err.status = 401;
                    return next(err);
                } else {
                    // if everything is good, save to request for use in other routes
                    req.decoded = decoded;
                    next();
                }
            });
        } else {
            // if there is no token
            // return an error
            var err = new Error('No token provided!');
            err.status = 403;
            return next(err);
        }
    },
    verifyAdmin: function(req,res,next){
        if(req.decoded.isAdmin !== true)  {
            return next("You are not authorized to perform this operation!");
        }else {
            return next();
        }
    }
}

function checkUsername(targetUsername) {
    if (!targetUsername) {
        return false;
    }
    if (targetUsername.length < 3) {
        return false;
    }
    if (!validator.isAlphanumeric(targetUsername)) {
        return false;
    }
    return true;
}

try {
    var client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    client.connect( (err,db) => {
        if (err) {
            throw err;
        }
        usersDB = client.db("users");
        usersCollection = usersDB.collection("users");

        umatisDB = client.db("umatis");
        umatisCollection = umatisDB.collection("umatis");

        postsDB = client.db("posts");
        postsCollection = postsDB.collection("posts");
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
                    let usersCounter = usersDB.collection("counter");
                    var increment = await usersCounter.findOneAndUpdate(
                        {_id: "userCounter" },
                        {$inc:{sequence_value:1}},
                        { returnOriginal: false }
                    );  


                    newAccount = {
                        "username": body.username,
                        "userId": increment.value.sequence_value + 1,
                        "email": body.email,
                        "password": body.password,
                        "admin": false,
                        "removed": false,
                        "creationDate": Date.now()
                    }
                    taken = await usersCollection.findOne({username: body.username});
                    if (!taken && checkUsername(body.username)) {
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

app.post("/api/createUmati", [middleware.jsonParser, middleware.authenticateToken], function (req, res) {
    if (req) {
        var newUmati;
        var taken;
        try {
            var client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
            client.connect( (err,db) => {
                if (err) throw err;

                var body = req.body;

                (async ()=>{
                    if (req.decoded) { // if logged in
                        let usersCounter = umatisDB.collection("counter");
                        var increment = await usersCounter.findOneAndUpdate(
                            {_id: "umatisCounter" },
                            {$inc:{sequence_value:1}},
                            { returnOriginal: false }
                        );
                        
                        newUmati = {
                            "umatiname": body.umatiname,
                            "displayname": body.displayname,
                            "logo": body.logo,
                            "umatiId": increment.value.sequence_value + 1,
                            "owner": logIn.userId,
                            "removed": false,
                            "creationDate": Date.now()
                        }
                        taken = await umatisCollection.findOne({umatiname: body.umatiname});
                        if (!taken && checkUsername(body.umatiname)) {
                            let insertOperation = umatisCollection.insertOne(newUmati);
                            res.json(insertOperation).end();
                        }
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
        if (taken) {
            return "username taken";
        }
    }
    else {
        res.status(404).end();
    }
});

app.get("/api/umatiData/:umati", [middleware.jsonParser, middleware.authenticateToken], function (req, res) {
    console.log("recieved at server");
    if (req) {
        var umatiname = req.params.umati;
        var umati;
        try {
            var client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
            client.connect( (err,db) => {
                if (err) throw err;
                (async ()=>{
                    let adminMode = req.decoded.isAdmin;
                    umati = await umatisCollection.findOne({umatiname: umatiname});
                    if (umati) {
                        await usersCollection.findOne({userId: umati.owner})
                        .then(ownerData => {
                            if (ownerData) {
                                if (!adminMode) {
                                    delete ownerData.email;
                                    delete ownerData.password;
                                    delete ownerData._id;
                                }
                                umati.ownerData = ownerData;
                                res.json(umati).end();
                            }
                        })
                        .catch(e => {
                            console.error(e);
                        })
                        
                    }
                    else {
                        res.status(404).end();
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

app.get("/api/fetchUmatis", [middleware.jsonParser, middleware.authenticateToken], function (req, res) {
    if (req) {
        try {
            var client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
            client.connect( (err,db) => {
                if (err) throw err;

                var adminMode = req.decoded.isAdmin;

                (async ()=>{
                    let queryStuff = {
                        "pageNum": 0,
                        "limit": 25
                    }

                    if (parseInt(req.query.page) && parseInt(req.query.page) > 0) {
                        queryStuff.pageNum = parseInt(req.query.page);
                    }

                    if (parseInt(req.query.limit) && parseInt(req.query.limit) < 100) {
                        queryStuff.limit = parseInt(req.query.limit);
                    }
                    
                    var umatiStream = []

                    let startingCount = ( queryStuff.pageNum > 0 ? ( ( queryStuff.pageNum - 1 ) * queryStuff.limit ) : 0 );

                    let cursor = await umatisCollection.find({ umatiId: { $gt: startingCount} })
                    .sort({umatiId:1})
                    // .skip( queryStuff.pageNum > 0 ? ( ( queryStuff.pageNum - 1 ) * queryStuff.limit ) : 0 )
                    .limit( queryStuff.limit )
                    for await (let umati of cursor) {
                        await usersCollection.findOne({userId: umati.owner})
                        .then(ownerData => {
                            if (ownerData) {
                                if (!adminMode) {
                                    delete ownerData.email;
                                    delete ownerData.password;
                                    delete ownerData._id;
                                }
                                umati.ownerData = ownerData;
                                // console.log(umati);
                                umatiStream.push(umati);
                            }
                        })
                        .catch(e => {
                            console.error(e);
                        })
                    }
                    res.json(umatiStream).end();
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

app.post("/api/usernameLookup", [middleware.jsonParser, middleware.authenticateToken], function (req, res) {
    if (req && checkUsername(req.body.username)) {
        var lookup;
        var user;
        try {
            var client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
            client.connect( (err,db) => {
                if (err) throw err;
                var body = req.body;

                (async ()=>{
                    lookup = {
                        "username": body.username
                    }
                    user = await usersCollection.findOne({username: body.username});
                    if (user) {
                        res.status(200).end();
                    }
                    else {
                        res.status(404).end();
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

app.post("/api/umatiLookup", [middleware.jsonParser, middleware.authenticateToken], function (req, res) {
    if (req && checkUsername(req.body.umatiname)) {
        var umati;
        try {
            var client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
            client.connect( (err,db) => {
                if (err) throw err;
                var body = req.body;

                (async ()=>{
                    umati = await umatisCollection.findOne({umatiname: body.umatiname});
                    if (umati) {
                        res.status(200).end();
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

app.post("/api/loginAccount", jsonParser, function (req, res) {
    if (req) {
        var user;
        try {
            var client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
            client.connect( (err,db) => {
                if (err) throw err;

                var body = req.body;

                (async ()=>{
                user = await usersCollection.findOne( {
                    $and: [
                        {username: body.username},
                        {password: body.password}
                    ]
                });
                

                if (user) {
                    let isAdmin = user.admin
                    const token = generateAccessToken({ username: req.body.username, isAdmin: isAdmin, userId: user.userId });
                    res.json(token).end();
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

app.get("/api/userData/:username", [middleware.jsonParser, middleware.authenticateToken], function (req, res) {
    if (req) {
        var user;
        var username = req.params.username;
        try {
            var client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
            client.connect( (err,db) => {
                if (err) throw err;

                var adminMode = req.decoded.isAdmin;

                (async ()=>{

                    user = await usersCollection.findOne({username: username});
                    if (user) {
                        if (!adminMode) {
                            delete user.email;
                            delete user.password;
                            delete user._id;
                        }
                        res.json(user).end();
                    }
                    else {
                        res.status(404).end();
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

app.get("/api/user/id=:id", [middleware.jsonParser, middleware.authenticateToken], function (req, res) {
    if (req) {
        var user;
        var id = parseInt(req.params.id);
        try {
            var client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
            client.connect( (err,db) => {
                if (err) throw err;

                var adminMode = req.decoded.isAdmin;

                (async ()=>{

                    user = await usersCollection.findOne({userId: id}, {});
                    if (user) {
                        if (!adminMode) {
                            delete user.email;
                            delete user.password;
                            delete user._id;
                        }
                        res.json(user).end();
                    }
                    else {
                        res.status(404).end();
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

app.post("/api/editDescription/:username", [middleware.jsonParser, middleware.authenticateToken], function (req, res) {
    if (req) {
        try {
            var client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
            client.connect( (err,db) => {
                if (err) throw err;
                
                var tokenData = req.decoded;
                var adminMode = tokenData.isAdmin;
                var cookies = req.cookies;

                (async ()=>{
                    if (req.params.username == tokenData.username || adminMode) {
                        var updateUser = await usersCollection.updateOne(
                            {username: req.params.username},
                            {$set: {description: req.body.description}}
                        )
                        if (updateUser) {
                            res.json(updateUser).end();
                        }
                        else {
                            res.status(403).end();
                        }
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

app.post("/api/updateNameAvatar/:username", [middleware.jsonParser, middleware.authenticateToken], function (req, res) {
    if (req && checkUsername(req.body.username)) {
        try {
            var client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
            client.connect( (err,db) => {
                if (err) throw err;

                const tokenData = req.decoded
                const adminMode = tokenData.isAdmin;
                

                (async ()=>{
                    if (req.params.username == tokenData.username || adminMode) {
                        const editingOnBehalf = !(req.params.username == tokenData.username) // if user is admin and does not own the account
                        var foundUser = await usersCollection.findOne({username: req.body.username});
                        if (!foundUser || (req.body.username == req.params.username)) { // if username not taken by anyone else
                            let body = req.body;

                            let resizedBase64;
                            if (body.avatar) {
                                let uncompressedb64 = body.avatar
                                let parts = uncompressedb64.split(';');
                                let mimType = parts[0].split(':')[1];
                                let imageData = parts[1].split(',')[1];
                                var img = new Buffer.from(imageData, 'base64');
                                await sharp(img)
                                .resize(64, 64)
                                .toBuffer()
                                .then(resizedImageBuffer => {
                                    let resizedImageData = resizedImageBuffer.toString('base64');
                                    resizedBase64 = `data:${mimType};base64,${resizedImageData}`;
                                    
                                })
                            }


                            let updateUser = await usersCollection.updateOne({username: req.params.username},
                            {$set: {username: body.username, displayname: body.displayname, avatar: resizedBase64}}
                            )
                            
                            if (updateUser) {
                                req.decoded.username = req.body.username;
                                delete req.decoded.exp;
                                delete req.decoded.iat;
                                const response = {
                                    "token": generateAccessToken(req.decoded) // regen token with new username
                                }
                                if (!editingOnBehalf) { // if not editing on behalf of someone else (not admin)
                                    res.json(response).end();
                                }
                                else {
                                    res.json(updateUser).end();
                                }
                                
                            }
                            else { // if no credentials
                                res.status(403).end();
                            }
                        }
                        else{ // if username taken
                            res.status(403).end();
                        }
                    }
                    else { // if the one editing profile does not own the account (different name)
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

app.post("/api/updateUmati/:umatiname", [middleware.jsonParser, middleware.authenticateToken], function (req, res) {
    if (req && checkUsername(req.body.umatiname)) {
        try {
            var client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
            client.connect( (err,db) => {
                if (err) throw err;
                
                const adminMode = req.decoded.isAdmin;
                var cookies = req.cookies;
                let body = req.body;

                (async ()=>{
                    let targetUmati = await umatisCollection.findOne({ umatiname: req.params.umatiname})
                    if (req.decoded && (targetUmati.owner == req.decoded.userId || adminMode)) { // if user owns the umati or admin
                        console.log("authorized");

                        var foundUmati = await umatisCollection.findOne({umatiname: body.umatiname});
                        if (!foundUmati || (body.umatiname == req.params.umatiname)) { // if umatiname not taken by other umatis
                            console.log("unique");
                            let resizedBase64;
                            if (body.logo) {
                                console.log("logo found");
                                let uncompressedb64 = body.logo
                                let parts = uncompressedb64.split(';');
                                let mimType = parts[0].split(':')[1];
                                let imageData = parts[1].split(',')[1];
                                var img = new Buffer.from(imageData, 'base64');
                                await sharp(img)
                                .resize(64, 64)
                                .toBuffer()
                                .then(resizedImageBuffer => {
                                    let resizedImageData = resizedImageBuffer.toString('base64');
                                    resizedBase64 = `data:${mimType};base64,${resizedImageData}`;
                                    
                                })
                            }


                            let updateUmati = await umatisCollection.updateOne(
                                {umatiname: req.body.umatiname},
                                {$set: {umatiname: body.umatiname, displayname: body.displayname, logo: resizedBase64}}
                            );
                            if (updateUmati) {
                                console.log("success");
                                res.json(updateUmati).end();
                            }
                            else { // if update failed
                                res.status(404).end();
                            }
                        }
                        else{ // if umatiname taken
                            res.status(403).end();
                        }
                    }
                    else { // if the one editing profile does not own the account (different name)
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

app.get("", redirectLoggedIn);
app.get("/", redirectLoggedIn);
app.get("/login", redirectLoggedIn);
app.get("/register", redirectLoggedIn);

function redirectLoggedIn(req,res) {
    var body = req.cookies;
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

  app.use(express.static(path.join(__dirname, 'client/build', "registerServiceWorker.js")));
  app.use(express.static(path.join(__dirname, 'client/build')));

  // Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.listen(port, () => console.log(`Listening on port ${port}`));
