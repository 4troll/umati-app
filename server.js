const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { MongoClient } = require("mongodb");
const cors = require("cors");

const validator = require("validator");

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const short = require('short-uuid'); // post uuids

const sharp = require("sharp"); // img processing

const app = express();
const port = process.env.PORT || 5000;

// Ratelimiters
var RateLimit = require("express-rate-limit");
var MongoStore = require("rate-limit-mongo");

var cookies = require("cookie-parser");
app.use(cookies());
app.use(cors());
app.use(express.json({limit: '10mb', extended: true}));
app.use(express.urlencoded({
    extended: true
}));

app.set('trust proxy', 1);

var jsonParser = bodyParser.json();

//app.use("/static", express.static(path.resolve(__dirname, "frontend", "static")));
//app.use("/static", express.static(path.resolve(__dirname, "./client/src")));

//app.use("/fonts", express.static(path.resolve(__dirname, "client", "static/fonts")));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", req.hostname); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });


var mongoUri = "mongodb+srv://mustafaA:loleris123@cluster0.2yo81.mongodb.net/ratelimits";

var usersDB;
var usersCollection;
var umatisDB;
var umatisCollection;
var postsDB;
var allPostsCollection;
var assetsDB;
var pfpsCollection;
var umatiLogosCollection;
var postPhotosCollection;

try {
    var client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    client.connect( (err,db) => {
        if (err) {
            throw err;
        }
        usersDB = client.db("users");
        usersCollection = usersDB.collection("users");

        umatisDB = client.db("umatis");
        umatisCollection = umatisDB.collection("umatis");

        postsDB = client.db("posts");
        allPostsCollection = postsDB.collection("all");
        postVotesCollection = postsDB.collection("votes")
        
        assetsDB = client.db("assets");
        pfpsCollection = assetsDB.collection("pfps");
        umatiLogosCollection = assetsDB.collection("umatiLogos");
        postPhotosCollection = assetsDB.collection("postPhotos");
    });
}
catch(e) {
    console.error(e);
}
finally {
    client.close();
}

function cleanUserData (userData,adminMode) { // deletes sensitive data
    if (!adminMode) {
        delete userData.email;
        delete userData.password;
        delete userData._id;
    }
    delete userData.refreshToken;
    return userData;
}

function generateAccessToken(userJson) {
    return jwt.sign(userJson, process.env.TOKEN_SECRET, { expiresIn: "1800s" }); // 30 minutes
}

function generateRefreshToken() {
    const randomString = short.generate()
    return jwt.sign({id: randomString}, process.env.TOKEN_REFRESH_SECRET, { expiresIn: "8640000s" }); // 100 days
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
                    return next();
                } else {
                    // if everything is good, save to request for use in other routes
                    req.decoded = decoded;
                    return next();
                }
            });
        } else {
            // if there is no token
            // return an error
            var err = new Error('No token provided!');
            err.status = 403;
            return next();
        }
    },
    verifyAdmin: function(req,res,next){
        if(req.decoded.isAdmin !== true)  {
            return next("You are not authorized to perform this operation!");
        }else {
            return next();
        }
    },
    ratelimitAccounts: new RateLimit({ // harshest ratelimit (5 accounts per hour)
        store: new MongoStore({
            uri: mongoUri,
            collectionName: "accountRateLimit",
            //   user: "mustafaA",
            //   password: 'mongopassword',
            // should match windowMs
            expireTimeMs: 60 * 60 * 1000,
            errorHandler: console.error.bind(null, "rate-limit-mongo")
            // see Configuration section for more options and details
        }),
        max: 5,
        // should match expireTimeMs
        windowMs: 60 * 60 * 1000
    }),
    ratelimitLogin: new RateLimit({ // 30 logins in 5m
        store: new MongoStore({
            uri: mongoUri,
            collectionName: "loginRateLimit",
            //user: "mustafaA",
            //password: "loleris123",
            // should match windowMs
            expireTimeMs: 5 * 60 * 1000,
            errorHandler: console.error.bind(null, "rate-limit-mongo")
            // see Configuration section for more options and details
        }),
        max: 30,
        // should match expireTimeMs
        windowMs: 5 * 60 * 1000
    }),
    ratelimitAccountEdit: new RateLimit({ // 30 edits in 15m
        store: new MongoStore({
            uri: mongoUri,
            collectionName: "accountEditRateLimit",
            //   user: "mustafaA",
            //   password: 'mongopassword',
            // should match windowMs
            expireTimeMs: 15 * 60 * 1000,
            errorHandler: console.error.bind(null, "rate-limit-mongo")
            // see Configuration section for more options and details
        }),
        max: 30,
        // should match expireTimeMs
        windowMs: 15 * 60 * 1000
    }),
    ratelimitPosts: new RateLimit({ // 10 posts in 5m
        store: new MongoStore({
            uri: mongoUri,
            collectionName: "postsRateLimit",
            //   user: "mustafaA",
            //   password: 'mongopassword',
            // should match windowMs
            expireTimeMs: 5 * 60 * 1000,
            errorHandler: console.error.bind(null, "rate-limit-mongo")
            // see Configuration section for more options and details
        }),
        max: 10,
        // should match expireTimeMs
        windowMs: 5 * 60 * 1000
    }),
}

function checkUsername(targetUsername) {
    if (!targetUsername) {
        return false;
    }
    if (targetUsername.length < 3) {
        return false;
    }
    if (targetUsername.length > 25) {
        return false;
    }
    if (!validator.isAlphanumeric(targetUsername)) {
        return false;
    }
    return true;
}


// Account Requests

app.post("/api/registerAccount", [middleware.ratelimitAccounts, jsonParser], function (req, res) {
    if (req) {
        var newAccount;
        var taken;
        try {
            var client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
            client.connect( (err,db) => {
                if (err) throw err;

                var body = req.body;

                (async ()=>{
                    let usersCounter = usersDB.collection("counter");
                    var increment = await usersCounter.findOneAndUpdate(
                        {_id: "userCounter" },
                        {$inc:{sequence_value:1}},
                        {}
                    );  


                    newAccount = {
                        "username": body.username,
                        "userId": increment.value.sequence_value + 1,
                        "email": body.email,
                        "password": body.password,
                        "avatar": "/assets/profilePicture/" + (increment.value.sequence_value + 1),
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

app.post("/api/loginAccount", [middleware.ratelimitLogin, jsonParser], function (req, res) {
    if (req) {
        var user;
        try {
            var client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
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
                    let refreshToken = generateRefreshToken();
                    const addTokenOperation = await usersCollection.updateOne({userId: user.userId},
                        {$set: {refreshToken: refreshToken}}
                    );
                    console.log(addTokenOperation);
                    
                    let isAdmin = user.admin;
                    const token = generateAccessToken({ username: req.body.username, isAdmin: isAdmin, userId: user.userId });
                    let tokenResponse = {
                        token: token,
                        refreshToken: refreshToken
                    }
                    res.json(tokenResponse).end();
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

app.get("/api/getAccessToken", [middleware.ratelimitLogin, jsonParser], function (req, res) {
    if (req) {  
        var user;
        try {
            var client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
            client.connect( (err,db) => {
                if (err) throw err;

                (async ()=>{
                let refreshToken = req.cookies.refreshToken;
                if (refreshToken) {
                    jwt.verify(refreshToken, process.env.TOKEN_REFRESH_SECRET, async function (err, decoded) {
                        if (err) {
                            console.log("Unauthorized");
                            res.status(401).end(); // unauthorized
                        }
                        else {
                            user = await usersCollection.findOne({refreshToken: refreshToken});
                            console.log("Looking for user");
                            if (user) {
                                const token = generateAccessToken({ username: user.username, isAdmin: user.admin, userId: user.userId });
                                let tokenResponse = {
                                    token: token
                                }
                                console.log(tokenResponse);
                                res.json(tokenResponse).end();
                            }
                            else {
                                res.status(401).end();
                            }
                        }
                        return;
                    });
                }
                else {
                    res.status(403).end(); // no refresh token found
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
            var client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
            client.connect( (err,db) => {
                if (err) throw err;

                var tokenData;
                var adminMode;
                if (req.decoded) {
                    var tokenData = req.decoded
                    var adminMode = tokenData.isAdmin;
                }

                (async ()=>{

                    user = await usersCollection.findOne({username: username});
                    if (user) {
                        user = cleanUserData(user,adminMode);
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
            var client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
            client.connect( (err,db) => {
                if (err) throw err;

                var tokenData;
                var adminMode;
                if (req.decoded) {
                    var tokenData = req.decoded
                    var adminMode = tokenData.isAdmin;
                }

                (async ()=>{

                    user = await usersCollection.findOne({userId: id}, {});
                    if (user) {
                        user = cleanUserData(user,adminMode);
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

app.get("/api/fetchUsers", [middleware.jsonParser, middleware.authenticateToken], function (req, res) {
    if (req) {
        try {
            var client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
            client.connect( (err,db) => {
                if (err) throw err;
                
                var tokenData;
                var adminMode;
                if (req.decoded) {
                    var tokenData = req.decoded
                    var adminMode = tokenData.isAdmin;
                }
                

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
                    
                    var userStream = []

                    let startingCount = ( queryStuff.pageNum > 0 ? ( ( queryStuff.pageNum - 1 ) * queryStuff.limit ) : 0 );

                    const skip = {$skip: startingCount};
                    const limit = {$limit: queryStuff.limit};
                    var query = "";

                    let aggregation;
                    if (req.query.search && req.query.search.length > 0) {
                        query = req.query.search;
                        console.log("query: " + query);
                        aggregation = await usersCollection.aggregate([
                            {$search: {index: "userSearch", "autocomplete": {
                                "query": query,
                                "path": "username",
                                "tokenOrder": "any",
                                "fuzzy": {}
                            }} },
                            {$addFields: {
                                searchScore: { $meta: "searchScore" }
                            }},
                            { $sort: {searchScore: 1} },
                            {$skip: startingCount},
                            {$limit: queryStuff.limit}
                        ]);
                    }
                    else {
                        aggregation = await usersCollection.aggregate([
                            { $sort: {userId:1}},
                            skip,limit
                        ]);
                    }
                    // let cursor = await usersCollection.find({ userId: { $gt: startingCount} })
                    // .sort({userId:1})
                    // .skip( queryStuff.pageNum > 0 ? ( ( queryStuff.pageNum - 1 ) * queryStuff.limit ) : 0 )
                    // .limit( queryStuff.limit )
                    for await (let user of aggregation) {
                        user = cleanUserData(user,adminMode);
                        userStream.push(user);
                    }
                    res.json(userStream).end();
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

app.post("/api/editDescription/user/:username", [middleware.ratelimitAccountEdit, middleware.jsonParser, middleware.authenticateToken], function (req, res) {
    if (req) {
        try {
            var client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
            client.connect( (err,db) => {
                if (err) throw err;
                
                var tokenData;
                var adminMode;
                if (req.decoded) {
                    var tokenData = req.decoded
                    var adminMode = tokenData.isAdmin;
                }

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

app.post("/api/updateNameAvatar/:username", [middleware.ratelimitAccountEdit, middleware.jsonParser, middleware.authenticateToken], function (req, res) {
    if (req && checkUsername(req.body.username)) {
        try {
            var client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
            client.connect( (err,db) => {
                if (err) throw err;

                var tokenData;
                var adminMode;
                if (req.decoded) {
                    var tokenData = req.decoded
                    var adminMode = tokenData.isAdmin;
                }
                

                (async ()=>{
                    var targetUser = await usersCollection.findOne({username: req.params.username});
                    if ((req.params.username == tokenData.username) || adminMode) {
                        const editingOnBehalf = !(req.params.username == tokenData.username) // if user is admin and does not own the account
                        var foundUser = await usersCollection.findOne({username: req.body.username});
                        
                        if (!foundUser || (req.body.username == req.params.username)) { // if username not taken by anyone else
                            let body = req.body;

                            var resizedBase64;

                            const isUrlOptions = {require_tld: false, require_protocol: false, require_host: false, require_port: false, require_valid_protocol: false, allow_underscores: false, host_whitelist: false, host_blacklist: false, allow_trailing_dot: false, allow_protocol_relative_urls: true, disallow_auth: false, validate_length: true }
                            if (body.avatar && !validator.isURL(body.avatar,isUrlOptions)) { // if avatar exists and avatar is b64
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

                                await pfpsCollection.replaceOne(
                                    {id: targetUser.userId}, 
                                    {
                                        id: targetUser.userId,
                                        contents: resizedBase64
                                    },
                                    {upsert: true}
                                );
                                
                            }
                            if (body.avatar == "") {
                                await pfpsCollection.remove(
                                    {id: targetUser.userId}
                                );
                            }

                            
                            let pfpLink = "/assets/profilePicture/" + targetUser.userId;

                            let updateUser = await usersCollection.updateOne({username: req.params.username},
                            {$set: {username: body.username, displayname: body.displayname, avatar: pfpLink}}
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
                                res.status(401).end();
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

app.post("/api/usernameLookup", [middleware.jsonParser, middleware.authenticateToken], function (req, res) {
    if (req && checkUsername(req.body.username)) {
        var lookup;
        var user;
        try {
            var client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
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

app.get("/assets/profilePicture/:id", [middleware.jsonParser, middleware.authenticateToken], function (req, res) {
    if (req) {
        const id = parseInt(req.params.id);
        try {
            var client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
            client.connect( (err,db) => {
                if (err) throw err;
                (async ()=>{
                    const operation = await pfpsCollection.findOne({id: id});
                    var foundImage = operation.contents;
                    if (foundImage) {
                        var img = Buffer.from(foundImage.split(',')[1], "base64");
                        res.writeHead(200, {
                            'Content-Type': 'image/png',
                            'Content-Length': img.length
                        });
                        res.end(img);
                    }
                    else {
                        res.status(404).end();
                    }
                })();
            })
        }
        catch (e) {
            console.error(e);
        }
    }
    else {
        res.status(404).end();
    }
});

// Umati (Group) Requests

app.post("/api/createUmati", [middleware.ratelimitAccounts, middleware.jsonParser, middleware.authenticateToken], function (req, res) {
    if (req) {
        var newUmati;
        var taken;
        try {
            var client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
            client.connect( (err,db) => {
                if (err) throw err;

                var body = req.body;

                (async ()=>{
                    if (req.decoded) { // if logged in

                        taken = await umatisCollection.findOne({umatiname: body.umatiname});
                        if (!taken && checkUsername(body.umatiname)) {
                            let usersCounter = umatisDB.collection("counter");
                            var increment = await usersCounter.findOneAndUpdate(
                                {_id: "umatisCounter" },
                                {$inc:{sequence_value:1}},
                                { }
                            );

                            if (body.logo && !validator.isURL(body.logo,isUrlOptions)) {
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
                                console.log(targetUmati.umatiId);
                                // update logo asset
                                let operation = await umatiLogosCollection.replaceOne(
                                    {id: targetUmati.umatiId}, 
                                    {
                                        id: targetUmati.umatiId,
                                        contents: resizedBase64
                                    },
                                    {upsert: true}
                                );
                            }
                            
                            let logoLink = "/assets/umatiLogo/" + targetUmati.umatiId;

                            newUmati = {
                                "umatiname": body.umatiname,
                                "displayname": body.displayname,
                                "logo": logoLink,
                                "umatiId": increment.value.sequence_value + 1,
                                "owner": req.decoded.userId,
                                "removed": false,
                                "creationDate": Date.now()
                            }
                            
                                let insertOperation = await umatisCollection.insertOne(newUmati);
                                res.json(insertOperation).end();
                        }
                    }
                    else {
                        res.status(401).end();
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

app.post("/api/updateUmati/:umatiname", [middleware.ratelimitAccountEdit, middleware.jsonParser, middleware.authenticateToken], function (req, res) {
    if (req && checkUsername(req.body.umatiname)) {
        try {
            var client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
            client.connect( (err,db) => {
                if (err) throw err;
                
                var tokenData;
                var adminMode;
                if (req.decoded) {
                    var tokenData = req.decoded
                    var adminMode = tokenData.isAdmin;
                }
                let body = req.body;

                (async ()=>{
                    let targetUmati = await umatisCollection.findOne({ umatiname: req.params.umatiname})
                    if (req.decoded && (targetUmati.owner == req.decoded.userId || adminMode)) { // if user owns the umati or admin
                        console.log("authorized");
                        var foundUmati = await umatisCollection.findOne({umatiname: body.umatiname});
                        if (!foundUmati || (body.umatiname == req.params.umatiname)) { // if umatiname not taken by other umatis
                            console.log("unique");
                            let resizedBase64;

                            const isUrlOptions = {require_tld: false, require_protocol: false, require_host: false, require_port: false, require_valid_protocol: false, allow_underscores: false, host_whitelist: false, host_blacklist: false, allow_trailing_dot: false, allow_protocol_relative_urls: true, disallow_auth: false, validate_length: true }
                            
                            console.log("Is not URL: " + !validator.isURL(body.logo,isUrlOptions));
                            console.log("Is b64: " + validator.isBase64(body.logo));
                            
                            if (body.logo && !validator.isURL(body.logo,isUrlOptions)) {
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
                                // update logo asset
                                await umatiLogosCollection.replaceOne(
                                    {id: targetUmati.umatiId}, 
                                    {
                                        id: targetUmati.umatiId,
                                        contents: resizedBase64
                                    },
                                    {upsert: true}
                                );
                            }
                            if (body.logo == "") {
                                await umatiLogosCollection.remove(
                                    {id: targetUmati.umatiId}
                                );
                            }
                            

                            let logoLink = "/assets/umatiLogo/" + targetUmati.umatiId;


                            let updateUmati = await umatisCollection.updateOne(
                                {umatiname: req.params.umatiname},
                                {$set: {umatiname: body.umatiname, displayname: body.displayname, logo: logoLink}}
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

app.post("/api/editDescription/umati/:umatiname", [middleware.ratelimitAccountEdit, middleware.jsonParser, middleware.authenticateToken], function (req, res) {
    if (req) {
        try {
            var client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
            client.connect( (err,db) => {
                if (err) throw err;
                
                var tokenData;
                var adminMode;
                if (req.decoded) {
                    var tokenData = req.decoded
                    var adminMode = tokenData.isAdmin;
                }

                (async ()=>{
                    console.log(req.decoded);
                    if (req.decoded) {
                        let targetUmati = await umatisCollection.findOne({ umatiname: req.params.umatiname});
                        console.log(req.decoded);
                        if (targetUmati && (targetUmati.owner = req.decoded.userId || adminMode) ) {
                            var updateUmati = await umatisCollection.updateOne(
                                {umatiname: req.params.umatiname},
                                {$set: {description: req.body.description}}
                            )
                            if (updateUmati) {
                                res.json(updateUmati).end();
                            }
                            else {
                                res.status(403).end();
                            }
                        }
                        else {
                            res.status(403).end();
                        }
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

app.get("/api/umatiData/:umati", [middleware.jsonParser, middleware.authenticateToken], function (req, res) {
    console.log("recieved at server");
    if (req) {
        var umatiname = req.params.umati;
        var umati;
        try {
            var client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
            client.connect( (err,db) => {
                if (err) throw err;
                (async ()=>{
                    var tokenData;
                    var adminMode;
                    if (req.decoded) {
                        var tokenData = req.decoded
                        var adminMode = tokenData.isAdmin;
                    }
                    umati = await umatisCollection.findOne({umatiname: umatiname});
                    if (umati) {
                        await usersCollection.findOne({userId: umati.owner})
                        .then(ownerData => {
                            if (ownerData) {
                                ownerData = cleanUserData(ownerData,adminMode);
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
            var client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
            client.connect( (err,db) => {
                if (err) throw err;
                
                var tokenData;
                var adminMode;
                if (req.decoded) {
                    var tokenData = req.decoded
                    var adminMode = tokenData.isAdmin;
                }
                

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
                    
                    

                    let startingCount = ( queryStuff.pageNum > 0 ? ( ( queryStuff.pageNum - 1 ) * queryStuff.limit ) : 0 );

                    const skip = {$skip: startingCount};
                    const limit = {$limit: queryStuff.limit};
                    var query = "";

                    let aggregation;
                    if (req.query.search && req.query.search.length > 0) {
                        query = req.query.search;
                        console.log("query: " + query);
                        aggregation = await umatisCollection.aggregate([
                            {$search: {index: "umatiSearch", "autocomplete": {
                                "query": query,
                                "path": "umatiname",
                                "tokenOrder": "any",
                                "fuzzy": {}
                            }} },
                            {$addFields: {
                                searchScore: { $meta: "searchScore" }
                            }},
                            { $sort: {searchScore: 1} },
                            {$skip: startingCount},
                            {$limit: queryStuff.limit}
                        ]);
                    }
                    else {
                        aggregation = await umatisCollection.aggregate([
                            { $sort: {umatiId:1}},
                            skip,limit
                        ]);
                    }
                    var umatiStream = []
                    // let cursor = await umatisCollection.find({ umatiId: { $gt: startingCount} })
                    // .sort({umatiId:1})
                    // .skip( queryStuff.pageNum > 0 ? ( ( queryStuff.pageNum - 1 ) * queryStuff.limit ) : 0 )
                    // .limit( queryStuff.limit )
                    for await (let umati of aggregation) {
                        await usersCollection.findOne({userId: umati.owner})
                        .then(ownerData => {
                            if (ownerData) {
                                ownerData = cleanUserData(ownerData,adminMode);
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



app.post("/api/umatiLookup", [middleware.jsonParser, middleware.authenticateToken], function (req, res) {
    if (req && checkUsername(req.body.umatiname)) {
        var umati;
        try {
            var client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
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

app.get("/assets/umatiLogo/:id", [middleware.jsonParser, middleware.authenticateToken], function (req, res) {
    if (req) {
        const id = parseInt(req.params.id);
        try {
            var client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
            client.connect( (err,db) => {
                if (err) throw err;
                (async ()=>{
                    const operation = await umatiLogosCollection.findOne({id: id});
                    if (operation && operation.contents) {
                        var img = Buffer.from(operation.contents.split(',')[1], "base64");
                        res.writeHead(200, {
                            'Content-Type': 'image/png',
                            'Content-Length': img.length
                        });
                        res.end(img);
                    }
                    else {
                        res.status(404).end();
                    }
                })();
            })
        }
        catch (e) {
            console.error(e);
        }
    }
    else {
        res.status(404).end();
    }
});

// Post requests

app.post("/api/createPost/:umatiname", [middleware.ratelimitPosts, middleware.jsonParser, middleware.authenticateToken], function (req, res) {
    if (req && req.params.umatiname) {
        var hostUmatiname = req.params.umatiname;
        var newPost;
        try {
            var client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
            client.connect( (err,db) => {
                if (err) throw err;
                if (req.decoded) {
                    var body = req.body;
                    (async ()=>{
                        let targetUmati = await umatisCollection.findOne({umatiname: hostUmatiname});
                        if (targetUmati && body.title.length > 0) { // if umati actually exists, and title exists
                            const postId = short.generate();

                            const isUrlOptions = {require_tld: false, require_protocol: false, require_host: false, require_port: false, require_valid_protocol: false, allow_underscores: false, host_whitelist: false, host_blacklist: false, allow_trailing_dot: false, allow_protocol_relative_urls: true, disallow_auth: false, validate_length: true };
                            
                            var logoLink = "";
                            if (body.photo && !validator.isURL(body.photo,isUrlOptions)) {
                                let uncompressedb64 = body.photo;
                                let parts = uncompressedb64.split(';');
                                let mimType = parts[0].split(':')[1];
                                let imageData = parts[1].split(',')[1];
                                var img = new Buffer.from(imageData, 'base64');
                                await sharp(img)
                                .resize(1280, 720, {
                                    fit: sharp.fit.inside,
                                    withoutEnlargement: true
                                })
                                .toBuffer()
                                .then(resizedImageBuffer => {
                                    let resizedImageData = resizedImageBuffer.toString('base64');
                                    resizedBase64 = `data:${mimType};base64,${resizedImageData}`;
                                })
                                // update logo asset
                                let operation = await postPhotosCollection.replaceOne(
                                    {id: postId}, 
                                    {
                                        id: postId,
                                        contents: resizedBase64
                                    },
                                    {upsert: true}
                                );
                                logoLink = "/assets/postPhoto/" + postId;
                            }

                            let postsCounter = await postsDB.collection("counter");
                            var increment = await postsCounter.findOneAndUpdate(
                                {_id: "postsCounter" },
                                {$inc:{sequence_value:1}},
                                {}
                            );  

                            newPost = {
                                "title": body.title,
                                "body": body.body,
                                "photo": logoLink,
                                "author": req.decoded.userId,
                                "hostUmati": targetUmati.umatiId,
                                "postId": postId,
                                "incrementId": increment.value.sequence_value + 1,
                                "creationDate": Date.now(),
                                "removed": false
                            }

                            


                            let insertOperation = await allPostsCollection.insertOne(newPost);
                            let voteDoc = await postVotesCollection.insertOne({postId: postId, voteCount: 0});
                            res.json(newPost).end();
                        
                        }
                    })();
                }
                else {
                    res.status(403).end();
                }
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

async function updateReputation(senderId,authorId,postId,change,voterType) {
    const settings = {upsert:true};
    if (voterType == "undo") { // new votes already checked
        await postVotesCollection.updateOne({"postId": postId},{
            $inc: {
                "voteCount": change
            }
            }, settings);
        await usersCollection.updateOne({userId: authorId}, { $inc: {rep: change}});
    }
    else { // vote-changing not checked yet
        await postVotesCollection.updateOne({"postId": postId},{
            $addToSet: {
                [voterType]: senderId
            }
        }, settings, async (error,result) => {
            if (error) {
                console.log("ERROR: " + error);
            }
            if(result.modifiedCount && result.modifiedCount > 0){
                await postVotesCollection.updateOne({"postId": postId},{
                    $inc: {
                        "voteCount": change
                    }
                    }, settings);
                await usersCollection.updateOne({userId: authorId}, { $inc: {rep: change}});
            }
        }
        );
    }
    
        
    
}

app.post("/api/voteOnPost/:postId", [middleware.jsonParser, middleware.authenticateToken], function (req, res) {
    var client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    var body = req.body;
    if (req && req.params.postId && (body.vote == 0 || body.vote == -1 || body.vote == 1)) {
        try {
            if (req.decoded) {
            
            client.connect( (err,db) => {
                if (err) throw err;
                
                    
                    (async ()=>{
                        let loggedUser = await usersCollection.findOne({userId: req.decoded.userId});
                        let targetPost = await allPostsCollection.findOne({postId: req.params.postId});
                        if (targetPost && loggedUser.username == req.decoded.username) { // verify logged in
                            const postId = req.params.postId;

                            var counterInc = 0;
                            var voterType = null;

                            const postInQuestion = await allPostsCollection.findOne({postId: postId});
                            const authorId = postInQuestion.author;

                            if (authorId != req.decoded.userId) {
                                if (body.vote == 0) {
                                    postVotesCollection.updateOne({postId: postId},{
                                        $pull: {
                                            "dislikers": req.decoded.userId
                                        }
                                    }, async (error, result) => {
                                        if(result.modifiedCount > 0){
                                            await updateReputation(req.decoded.userId,authorId,postId,1,"undo");
                                        }
                                        else{
                                            postVotesCollection.updateOne({postId: postId},{
                                                $pull: {
                                                    "likers": req.decoded.userId
                                                }
                                            }, async (error, result) => {
                                                if(result.modifiedCount > 0){
                                                    await updateReputation(req.decoded.userId,authorId,postId,-1,"undo");
                                                }
                                            });
                                        }
                                    });
                                }
                                if(body.vote == 1){
                                    voterType = "likers";
                                    counterInc = 1;
                                    await postVotesCollection.updateOne({"postId": postId},{
                                        $pull: {
                                            "dislikers": req.decoded.userId
                                        },
                                    }, 
                                    async(error,result) => {
                                        if (error) {
                                            console.log("ERROR: " + error);
                                        }
                                        console.log(result);
                                        if(result.modifiedCount > 0){
                                            console.log("Down to Up");
                                            counterInc = 2;
                                            await updateReputation(req.decoded.userId,authorId,postId,2,voterType);
                                        }
                                        else if (!result) {
                                            console.log("what");
                                            counterInc = 0;
                                            
                                        }
                                        else {
                                            await updateReputation(req.decoded.userId,authorId,postId,1,voterType);
                                        }
                                    }
                                    );
                                }
                                else if(body.vote == -1){
                                    voterType = "dislikers";
                                    counterInc = -1;
                                    await postVotesCollection.updateOne({"postId": postId},{
                                        $pull: {
                                            "likers": req.decoded.userId
                                        },
                                    }, 
                                    async (error,result) => {
                                        if (error) {
                                            console.log("ERROR: " + error);
                                        }
                                        console.log(result);
                                        if(result.modifiedCount > 0){
                                            console.log("Up To Down");
                                            counterInc = -2;
                                            await updateReputation(req.decoded.userId,authorId,postId,-2,voterType);
                                        }
                                        else if (!result) {
                                            console.log("what");
                                            counterInc = 0;
                                        }
                                        else {
                                            await updateReputation(req.decoded.userId,authorId,postId,-1,voterType);
                                                
                                        }
                                    }
                                    );
                                } 
                            }
                            
                            
                            // if(body.vote != 0 && voterType){
                            //     await postVotesCollection.updateOne({"postId": postId},{
                            //             $addToSet: {
                            //                 [voterType]: req.decoded.userId
                            //             }
                            //         }, settings, async (error,result) => {
                            //             if (error) {
                            //                 console.log("ERROR: " + error);
                            //             }
                            //             if(result.modifiedCount && result.modifiedCount > 0){
                            //                 // const voteStats = await postVotesCollection.findOne({"postId": postId});

                            //                 // var likeCount = 0;
                            //                 // console.log(voteStats.likers);
                            //                 // if (voteStats.likers) {
                            //                 //     likeCount = voteStats.likers.length;
                            //                 // }
                            //                 // var dislikeCount = 0;
                            //                 // if (voteStats.dislikers) {
                            //                 //     dislikeCount = voteStats.dislikers.length;
                            //                 // }
                            //                 // const finalCount = likeCount - dislikeCount;
                            //                 // postVotesCollection.updateOne({"postId": postId},{
                            //                 //     $set: {
                            //                 //         "voteCount": finalCount
                            //                 //     }
                            //                 // }, settings);
                            //                 if (Math.abs(counterInc) == 1) {
                            //                     console.log(result);
                            //                 }
                                            
                            //                 console.log(counterInc);
                            //                 await postVotesCollection.findOneAndUpdate({"postId": postId},{
                            //                     $inc: {
                            //                         "voteCount": counterInc
                            //                     }
                            //                 }, settings);
                            //             }
                            //             else {
                            //                 await postVotesCollection.updateOne({"postId": postId},{
                            //                     $inc: {
                            //                         "voteCount": 0
                            //                     }
                            //                 }, settings);
                            //             }
                            //     });
                            // }

                            
                        
                        }
                    })();
                
                    res.json(req.body).end();
            }); 
            }
            else {
                res.status(403).end();
            }
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

app.get("/api/fetchPosts", [middleware.jsonParser, middleware.authenticateToken], function (req, res) {
    if (req) {
        console.log("fetching posts");
        try {
            var client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
            client.connect( (err,db) => {
                if (err) throw err;
                
                var tokenData;
                var adminMode;
                if (req.decoded) {
                    var tokenData = req.decoded
                    var adminMode = tokenData.isAdmin;
                }


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
                    
                    var postsStream = []

                    let startingCount = ( queryStuff.pageNum > 0 ? ( ( queryStuff.pageNum - 1 ) * queryStuff.limit ) : 0 );
                    
                    const postsCounter = await postsDB.collection("counter");
                    var increment = await postsCounter.findOne({_id: "postsCounter" });
                    var lastPostId = increment.sequence_value;
                    var maxPostId = lastPostId - startingCount;

                    // var query = { incrementId: { $lte: maxPostId} };
                    var query = {};
                    if (parseInt(req.query.umatiId)) {
                        query["hostUmati"] = parseInt(req.query.umatiId);
                    }
                    else if (parseInt(req.query.userId)) {
                        query["author"] = parseInt(req.query.userId);
                    }

                    const chosenSort = req.query.sort || (query["author"] ? "new" : "trending");
                    console.log(chosenSort);

                    const match = {$match: query};
                    const lookup = {$lookup: {
                        from: "votes",
                        localField: "postId",
                        foreignField: "postId",
                        as: "voteData"
                    }};
                    const skip = {$skip: startingCount};
                    const limit = {$limit: queryStuff.limit};

                    var aggregation;
                    switch(chosenSort) {
                        case "new":
                            // New Sort
                            // Sort by newest
                            aggregation = await allPostsCollection.aggregate([
                                match, lookup,
                                {$sort: {incrementId: -1}},

                                skip, limit
                            ]);
                            break;
                        case "old":
                            // Old Sort
                            // Sort by oldest
                            aggregation = await allPostsCollection.aggregate([
                                match, lookup,
                                {$sort: {incrementId: 1}},

                                skip, limit
                            ]);
                            break;
                        case "top":
                            // Top Sort
                            // https://www.evanmiller.org/how-not-to-sort-by-average-rating.html
                            // "We need to balance the proportion of positive ratings with the uncertainty of a small number of observations."
                            aggregation = await allPostsCollection.aggregate([
                                match, lookup,
                                {$addFields: {
                                    likeCount: {$cond: {if: {$gt:[{$first: "$voteData.likers"}, null]}, then: {$size: {$first: "$voteData.likers"}}, else: 0}},
                                    dislikeCount: {$cond: {if: {$gt:[{$first: "$voteData.dislikers"}, null]}, then: {$size: {$first: "$voteData.dislikers"}}, else: 0}}
                                }},
                                {$addFields: {
                                    topScore: { $cond: { if: {$eq: [{$add: ["$likeCount", "$dislikeCount"]}, 0]}, then: 0, else: { // if like + dislike = 0
                                        // Lower bound of Wilson score confidence interval for a Bernoulli parameter
                                        // Implemented in MongoDB Aggregation Pipeline
                                        // https://stackoverflow.com/questions/55851612/score-lower-bound-of-wilson-score-confidence-interval-for-a-bernoulli-paramete
                                        $divide: [
                                                {
                                                    $subtract: [
                                                            {
                                                                $divide: [
                                                                    { $add: ["$likeCount",1.9208] },
                                                                    { $add: ["$likeCount","$dislikeCount"] }
                                                                ],
                                                            },
                                                            {
                                                                $multiply: [
                                                                    1.96,
                                                                    {
                                                                        $divide: [ 
                                                                            { 
                                                                                $sqrt: { 
                                                                                    $add: [
                                                                                        { 
                                                                                            $divide: [ 
                                                                                                {
                                                                                                    $multiply: ["$likeCount","$dislikeCount"] 
                                                                                                }, 
                                                                                                {   
                                                                                                    $add: ["$likeCount","$dislikeCount"]
                                                                                                } 
                                                                                            ] 
                                                                                        },
                                                                                        0.9604
                                                                                    ]
                                                                                }
                                                                            },
                                                                            {   
                                                                                $add: ["$likeCount","$dislikeCount"]
                                                                            }
                                                                        ]
                                                                    }
                                                                ]
                                                            },
                                                    ]
                                                },
                                                {
                                                    $add: [
                                                        {
                                                            $divide: [ 3.8416, {$add: ["$likeCount","$dislikeCount"]}  ]
                                                        },
                                                        1
                                                    ]
                                                }
                                        ]
                                    },
                                    }}
                                }},
                                {$sort: {topScore: -1}},

                                skip, limit
                            ]);
                            break;
                            case "liked":
                                // Liked Sort
                                // Sort by most liked
                                aggregation = await allPostsCollection.aggregate([
                                    match, lookup,
                                    {$addFields: {
                                        likeCount: {$cond: {if: {$gt:[{$first: "$voteData.likers"}, null]}, then: {$size: {$first: "$voteData.likers"}}, else: 0}}
                                    }},
                                    {$sort: {likeCount: -1}},

                                    skip, limit
                                ]);
                                break;
                            case "disliked":
                                // Disliked Sort
                                // Sort by most disliked
                                aggregation = await allPostsCollection.aggregate([
                                    match, lookup,
                                    {$addFields: {
                                        dislikeCount: {$cond: {if: {$gt:[{$first: "$voteData.dislikers"}, null]}, then: {$size: {$first: "$voteData.dislikers"}}, else: 0}}
                                    }},
                                    {$sort: {dislikeCount: -1}},

                                    skip, limit
                                ]);
                                break;
                        case "controversial":
                            // Controversial Sort
                            // Posts closest to 50% upvoted are shown first
                            aggregation = await allPostsCollection.aggregate([
                                match, lookup,
                                {$addFields: {
                                    likeCount: {$cond: {if: {$gt:[{$first: "$voteData.likers"}, null]}, then: {$size: {$first: "$voteData.likers"}}, else: 0}},
                                    dislikeCount: {$cond: {if: {$gt:[{$first: "$voteData.dislikers"}, null]}, then: {$size: {$first: "$voteData.dislikers"}}, else: 0}}
                                }},
                                {$addFields: {
                                    totalVotes: {$add: ["$likeCount","$dislikeCount"]},
                                    voteBal: {$cond: { if : {$and: [{$gt: ["$likeCount", 0]},{$gt: ["$dislikeCount", 0]} ]}, 
                                                            then: {$cond: {if: {$gt: ["$likeCount", "$dislikeCount"]}, 
                                                                                then: {$divide: ["$dislikeCount", "$likeCount"]},
                                                                                else: {$divide: ["$likeCount", "$dislikeCount"]} }}, 
                                                            else: 0

                                    }},
                                }},
                                {$addFields: {
                                    controScore: {$cond: {if: {$gt: ["$voteBal", 0]}, then: {$pow: ["$totalVotes","$voteBal"]}, else: 0}}
                                }},
                                {$sort: {controScore: -1}},

                                skip, limit
                            ]);
                            break;
                        case "hot":

                        default:
                            // Trending Sort
                            // Same algorithm as reddit's hot (time and votes) sort
                            aggregation = await allPostsCollection.aggregate([
                                match, lookup,

                                {$addFields: {
                                    repSign: {$cond: {if : {$lt : [{$first: "$voteData.voteCount"}, 0]}, then: -1, 
                                        else: {$cond: {if : {$gt : [{$first: "$voteData.voteCount"}, 0]}, then: 1, else: 0}}
                                    }},
                                    order: {$log: [{$max: [{$abs: {$first: "$voteData.voteCount"}},1]},10]},
                                    // msSincePost: {$subtract: [{$toDouble: "$$NOW"}, {$first: "$postData.creationDate"}]},
                                }},
                                {$addFields: {
                                    trendScore: {$add: [ {$multiply: ["$repSign", "$order"]}, {$divide : [{$subtract: ["$creationDate", 1600000000000]}, 450000000]}]}
                                }},
                                {$sort: {trendScore: -1}},

                                skip, limit
                            ]);
                    }

                    // for await (let post of aggregation) {
                    //     console.log(post);
                    // }


                    // let cursor = await allPostsCollection.find(query)
                    // .sort({incrementId:-1})
                    // .skip( queryStuff.pageNum > 0 ? ( ( queryStuff.pageNum - 1 ) * queryStuff.limit ) : 0 )
                    // .limit(queryStuff.limit)

                    // parseInt(req.query.info)

                    
                    if (aggregation) {
                        var targetUmati;
                        var targetUser;
                        if (parseInt(req.query.umatiId)) {
                            targetUmati = await umatisCollection.findOne({umatiId: parseInt(req.query.umatiId)})
                        }
                        else if (parseInt(req.query.userId)) {
                            targetUser = await usersCollection.findOne({userId: parseInt(req.query.userId)})
                        }
                        for await (let post of aggregation) {
                            
                            let user = targetUser || await usersCollection.findOne({userId: post.author});
                            let umati = targetUmati || await umatisCollection.findOne({umatiId: post.hostUmati});
                            let voteStatus = post.voteData[0];
                            // if (!parseInt(req.query.umatiId) && !parseInt(req.query.userId)) {
                            //     let umati = targetUmati || await umatisCollection.findOne({umatiId: post.hostUmati});
                                
                            // }
                            user = cleanUserData(user,adminMode);
                            post.authorData = user;
                            
                            post.hostUmatiname = umati.umatiname;
                            post.umatiData = umati;

                            let userVoteStatus = 0;

                            

                            if (voteStatus && req.decoded) {
                                if (voteStatus.likers) {
                                    for (let i = 0; i < voteStatus.likers.length; i++) {
                                        if (voteStatus.likers[i] == req.decoded.userId) {
                                            userVoteStatus = 1;
                                        }
                                    }
                                }
                                
                                if (voteStatus.dislikers) {
                                    for (let i = 0; i < voteStatus.dislikers.length; i++) {
                                        if (voteStatus.dislikers[i] == req.decoded.userId) {
                                            userVoteStatus = -1;
                                        }
                                    }
                                }
        
                                post.userVote = userVoteStatus;
                                post.voteCount = voteStatus.voteCount;
                            }
                            
                            
                            postsStream.push(post);
                        }
                        res.json(postsStream).end();
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

app.get("/assets/postPhoto/:id", [middleware.jsonParser, middleware.authenticateToken], function (req, res) {
    if (req) {
        const id = req.params.id;
        try {
            var client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
            client.connect( (err,db) => {
                if (err) throw err;
                (async ()=>{
                    const operation = await postPhotosCollection.findOne({id: id});
                    var foundImage = operation.contents;
                    if (foundImage) {
                        var img = Buffer.from(foundImage.split(',')[1], "base64");
                        res.writeHead(200, {
                            'Content-Type': 'image/png',
                            'Content-Length': img.length
                        });
                        res.end(img);
                    }
                    else {
                        res.status(404).end();
                    }
                })();
            })
        }
        catch (e) {
            console.error(e);
        }
    }
    else {
        res.status(404).end();
    }
});

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