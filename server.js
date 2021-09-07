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
var notifsCollection;

var umatisDB;
var umatisCollection;

var postsDB;
var allPostsCollection;
var postVotesCollection;

var commentsDB;
var commentsCollection;
var commentVotesCollection;

var assetsDB;
var pfpsCollection;
var umatiLogosCollection;
var postPhotosCollection;

const scoreMilestones = [
    1,
    5,10, 25, 50, 75,
    100, 200, 250, 500, 750, 
    1000, 2000, 3000, 5000, 7500,
    10000, 20000, 30000, 50000, 75000,
    100000
]

try {
    var client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    client.connect( (err,db) => {
        if (err) {
            throw err;
        }
        usersDB = client.db("users");
        usersCollection = usersDB.collection("users");
        notifsCollection = usersDB.collection("notifications");

        umatisDB = client.db("umatis");
        umatisCollection = umatisDB.collection("umatis");

        postsDB = client.db("posts");
        allPostsCollection = postsDB.collection("all");
        postVotesCollection = postsDB.collection("votes");

        commentsDB = client.db("comments");
        commentsCollection = commentsDB.collection("all");
        commentVotesCollection = commentsDB.collection("votes");
        
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
// usersCounter.insert({_id: "userCounter", sequence_value_: 0});

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
                        {$inc:{sequence_value:1}}
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

app.post("/api/joinUmati/:umatiname", [middleware.jsonParser, middleware.authenticateToken], function (req, res) {
    if (req && req.params.umatiname) {
        var targetUmatiname = req.params.umatiname;
        try {
            var client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
            client.connect( (err,db) => {
                if (err) throw err;
                var body = req.body;
                var join = body.join;
                if (req.decoded && body) {
                    (async ()=>{
                        const targetUmati = await umatisCollection.findOne({umatiname: targetUmatiname});
                        const targetUser = await usersCollection.findOne({userId: req.decoded.userId});
                        if (targetUmati && targetUser) { // if umati actually exists, and user authorized
                            let umatiJoined = false;
                            let indexOfJoinedUmati;
                            let joinedIncrement = 0;
                            if (targetUser.joinedUmatis) {
                                
                                for (let i = 0; i < targetUser.joinedUmatis.length; i++) {
                                    if (targetUser.joinedUmatis[i] == req.params.umatiname) {
                                        indexOfJoinedUmati = i;
                                        umatiJoined = true;
                                        break;
                                    }
                                }
                                // indexOfJoinedUmati = targetUser.joinedUmatis.findIndex(umati => umati == req.params.umatiname);
                            }
                            if (umatiJoined != join) { // if there is no cheating
                                if (join) { // join
                                    await usersCollection.updateOne({userId: req.decoded.userId}, {$push: {joinedUmatis: req.params.umatiname}}, {upsert: true});
                                    joinedIncrement = 1;
                                }
                                else if (targetUser.joinedUmatis.length > 0){ // leave
                                    await usersCollection.updateOne({userId: req.decoded.userId}, {$pull: {joinedUmatis: req.params.umatiname}}, {upsert: true});
                                    joinedIncrement = -1;
                                }
                                await umatisCollection.updateOne({umatiname: targetUmatiname}, {$inc: {joinCount: joinedIncrement}}, {upsert: true});
                                res.json(body).end();
                            }
                            else {
                                res.status(403).end();
                            }
                            
                            
                        
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
                        if (targetUmati && (targetUmati.owner == req.decoded.userId || adminMode) ) {
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

app.post("/api/editRules/:umatiname", [ middleware.jsonParser, middleware.authenticateToken], function (req, res) {
    if (req && req.params.umatiname) {
        var hostUmatiname = req.params.umatiname;
        try {
            var client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
            client.connect( (err,db) => {
                if (err) throw err;
                var body = req.body;
                var newRules = body.rules;
                if (req.decoded && body && newRules) {
                    (async ()=>{
                        const targetUmati = await umatisCollection.findOne({umatiname: hostUmatiname});
                        if (targetUmati && (targetUmati.owner == req.decoded.userId || adminMode) ) { // if umati actually exists, and user authorized
                            var oldRules = targetUmati.rules;
                            var finalRules = []; // negotiated rules
                            console.log(newRules);
                            for (let i = 0; i < newRules.length; i++) {
                                let newRule = newRules[i];
                                let foundRuleId;
                                if (oldRules && oldRules.length > 0) {
                                    if (newRule.id && newRule.id.length > 4) {
                                        
                                        for (let j = 0; j < oldRules.length; j++) {
                                            console.log(oldRules[j].id);
                                            if (oldRules[j].id == newRule.id) {
                                                foundRuleId = oldRules[j].id;
                                                break;
                                            }
                                        }
                                    }
                                }
                                let title = newRule.title;
                                let appliedTo = newRule.appliedTo; // 0-both, 1-posts, 2-comments
                                let description = newRule.description;

                                    
                                    console.log("basic tests passed");
                                    if (title.length >= 3 && title.length <= 100) {
                                        if (appliedTo >= 0 && newRule.appliedTo <= 2) {
                                            if (description.length >= 0 && description.length <= 1000) {
                                                console.log("tests passed");
                                                const ruleId = foundRuleId || short.generate();
                                                finalRules.push({
                                                    id: ruleId,
                                                    title: title,
                                                    appliedTo: appliedTo,
                                                    description: description,
                                                });
                                            }
                                        }
                                    }



                            }
                            await umatisCollection.updateOne({umatiname: hostUmatiname}, {$set: {rules: finalRules}});
                            res.json(finalRules).end();
                        
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
                    var joined = false;
                    if (req.decoded) {
                        var tokenData = req.decoded
                        var adminMode = tokenData.isAdmin;
                        let viewingUser = await usersCollection.findOne({userId: req.decoded.userId});
                        if (viewingUser.joinedUmatis) {
                            for (let i = 0; i < viewingUser.joinedUmatis.length; i++) {
                                if (viewingUser.joinedUmatis[i] == umatiname) {
                                    joined = true;
                                    break;
                                }
                            }
                        }
                        
                    }
                    umati = await umatisCollection.findOne({umatiname: umatiname});
                    if (umati) {
                        await usersCollection.findOne({userId: umati.owner})
                        .then(ownerData => {
                            if (ownerData) {
                                ownerData = cleanUserData(ownerData,adminMode);
                                umati.ownerData = ownerData;
                                umati.joined = joined;
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
                    var viewingUser;
                    if (req.decoded) {
                        viewingUser = await usersCollection.findOne({userId: req.decoded.userId});
                    }
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
                        umati.joined = false;
                        if (viewingUser && viewingUser.joinedUmatis) {
                            for (let i = 0; i < viewingUser.joinedUmatis.length; i++) {
                                if (viewingUser.joinedUmatis[i] == umati.umatiname) {
                                    umati.joined = true;
                                    break;
                                }
                            }
                        }
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

                            let pingedUsersAggregation = await usersCollection.aggregate([
                                {$match: {joinedUmatis: req.params.umatiname}}
                            ]);

                            for await (let user of pingedUsersAggregation) {
                                await notifsCollection.updateOne({userId: user.userId}, {$push: 
                                    {notifs: {
                                        type: "newPost",
                                        postId: postId,
                                        notifId: short.generate(),
                                        date: newPost.creationDate,
                                        seen: false
                                        }
                                    } 
                                    
                            },{upsert: true});
                            }


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

app.get("/api/postData/:postId", [middleware.jsonParser, middleware.authenticateToken], function (req, res) {
    console.log("recieved at server");
    if (req && req.params.postId) {
        var postId = req.params.postId;
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
                    post = await allPostsCollection.findOne({postId: postId});
                    if (post) {
                        const umatiData = await umatisCollection.findOne({umatiId: post.hostUmati});
                        const voteStatus = await postVotesCollection.findOne({postId: postId});
                        var authorData = await usersCollection.findOne({userId: post.author})
                        if (authorData) {
                            let userVoteStatus = 0;
                            if (authorData && umatiData) {
                                if (voteStatus) {
                                    if (voteStatus.likers && req.decoded) {
                                        for (let i = 0; i < voteStatus.likers.length; i++) {
                                            if (voteStatus.likers[i] == req.decoded.userId) {
                                                userVoteStatus = 1;
                                            }
                                        }
                                    }
                                    
                                    if (voteStatus.dislikers && req.decoded) {
                                        for (let i = 0; i < voteStatus.dislikers.length; i++) {
                                            if (voteStatus.dislikers[i] == req.decoded.userId) {
                                                userVoteStatus = -1;
                                            }
                                        }
                                    }
            
                                    post.userVote = userVoteStatus;
                                    post.voteCount = voteStatus.voteCount;
                                }
                                authorData = cleanUserData(authorData,adminMode);
                                post.umatiData = umatiData;
                                post.authorData = authorData;

                                // Votes

                                let matchComment = {$match: {}};
                                if (req.query.commentId) {
                                    matchComment = {$match: {commentId: req.query.commentId}}
                                }

                                let commentsAggregate = await commentsCollection.aggregate([
                                    {$match: {postId: postId}},
                                    matchComment,
                                    {$lookup: {
                                        from: "votes",
                                        localField: "commentId",
                                        foreignField: "commentId",
                                        as: "voteData"
                                    }},
                                ]
                                );
                                var commentStream = [];
                                for await (let comment of commentsAggregate) {
                                    let commenter = await usersCollection.findOne({userId: comment.commentAuthor});
                                    comment.commenterData = commenter;
                                    let voteStatus = comment.voteData[0]
                                    let userVoteStatus = 0;
                                    if (voteStatus) {
                                        if (voteStatus.likers && req.decoded) {
                                            for (let i = 0; i < voteStatus.likers.length; i++) {
                                                if (voteStatus.likers[i] == req.decoded.userId) {
                                                    userVoteStatus = 1;
                                                }
                                            }
                                        }
                                        
                                        if (voteStatus.dislikers && req.decoded) {
                                            for (let i = 0; i < voteStatus.dislikers.length; i++) {
                                                if (voteStatus.dislikers[i] == req.decoded.userId) {
                                                    userVoteStatus = -1;
                                                }
                                            }
                                        }
                
                                        comment.userVote = userVoteStatus;
                                        comment.voteCount = voteStatus.voteCount;
                                    }
                                    // console.log(voteData.voteCount);
                                    commentStream.push(comment);
                                }
                                post.commentData = commentStream;
                                res.json(post).end();
                            }
                        }
                        else {
                            res.status(404).end();
                        }
                        
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

async function updatePostReputation(senderId,authorId,postId,change,voterType) {
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
                if (change == 1) {
                    let postVoteCount = await postVotesCollection.findOne({"postId": postId});
                    if (postVoteCount.voteCount && scoreMilestones.find(element => element == postVoteCount.voteCount)) {
                        if (postVoteCount.voteCount > postVoteCount.milestone || !postVoteCount.milestone ) {
                            await notifsCollection.updateOne({userId: authorId}, {$push: 
                                {notifs: {
                                    type: "voteMilestone",
                                    milestone: postVoteCount.voteCount,
                                    postId: postId,
                                    notifId: short.generate(),
                                    date: Date.now(),
                                    seen: false

                                    }
                                } 
                                
                            },{upsert: true});
                            await postVotesCollection.updateOne({"postId": postId},{
                                $set: {
                                    "milestone": postVoteCount.voteCount
                                }
                                }, settings);
                        }
                        
                    }
                    
                }
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
                                            await updatePostReputation(req.decoded.userId,authorId,postId,1,"undo");
                                        }
                                        else{
                                            postVotesCollection.updateOne({postId: postId},{
                                                $pull: {
                                                    "likers": req.decoded.userId
                                                }
                                            }, async (error, result) => {
                                                if(result.modifiedCount > 0){
                                                    await updatePostReputation(req.decoded.userId,authorId,postId,-1,"undo");
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
                                            await updatePostReputation(req.decoded.userId,authorId,postId,2,voterType);
                                        }
                                        else if (!result) {
                                            console.log("what");
                                            counterInc = 0;
                                            
                                        }
                                        else {
                                            await updatePostReputation(req.decoded.userId,authorId,postId,1,voterType);
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
                                            await updatePostReputation(req.decoded.userId,authorId,postId,-2,voterType);
                                        }
                                        else if (!result) {
                                            console.log("what");
                                            counterInc = 0;
                                        }
                                        else {
                                            await updatePostReputation(req.decoded.userId,authorId,postId,-1,voterType);
                                                
                                        }
                                    }
                                    );
                                } 
                            }
                        
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

                            

                            if (voteStatus) {
                                if (voteStatus.likers && req.decoded) {
                                    for (let i = 0; i < voteStatus.likers.length; i++) {
                                        if (voteStatus.likers[i] == req.decoded.userId) {
                                            userVoteStatus = 1;
                                        }
                                    }
                                }
                                
                                if (voteStatus.dislikers && req.decoded) {
                                    for (let i = 0; i < voteStatus.dislikers.length; i++) {
                                        if (voteStatus.dislikers[i] == req.decoded.userId) {
                                            userVoteStatus = -1;
                                        }
                                    }
                                }
                                post.voteCount = voteStatus.voteCount;
                                post.userVote = userVoteStatus;
                                
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

// Comments

app.post("/api/createComment/:postId", [middleware.ratelimitPosts, middleware.jsonParser, middleware.authenticateToken], function (req, res) {
    console.log("recieved comment request");
    if (req && req.params.postId && req.body.content) {
        const postId = req.params.postId;
        const commentBody = req.body.content;
        try {
            if (req.decoded) {
                var tokenData = req.decoded
                var adminMode = tokenData.isAdmin;
                var client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
                client.connect( (err,db) => {
                    if (err) throw err;
                    console.log("connected");
                    var body = req.body;

                    (async ()=>{

                        const postInQuestion = await allPostsCollection.findOne({postId: postId});
                        const commentingUser = await usersCollection.findOne({userId: req.decoded.userId});
                        if (postInQuestion && commentingUser) {
                            console.log("post and user verified");
                            let commentsCounter = commentsDB.collection("counter");
                            let commentsVotesCollection = commentsDB.collection("votes");
                            var increment = await commentsCounter.findOneAndUpdate(
                                {_id: "commentCounter" },
                                {$inc:{sequence_value:1}}
                            );
                            const commentData = {
                                postId: postId,
                                commentId: short.generate(),
                                commentAuthor: req.decoded.userId,
                                content: commentBody,
                                creationDate: Date.now()
                            }
                            let insertOperation = await commentsCollection.insertOne(commentData);
                            let voteDoc = await commentsVotesCollection.insertOne({commentId: commentData.commentId, voteCount: 0});
                            
                            await notifsCollection.updateOne({userId: postInQuestion.author}, {$push: 
                                {notifs: {
                                    type: "newComment",
                                    postId: postId,
                                    commentId: commentData.commentId,
                                    notifId: short.generate(),
                                    commentAuthor: commentData.commentAuthor,
                                    date: commentData.creationDate,
                                    seen: false
                                    }
                                } 
                                
                            },{upsert: true});

                            res.json(commentData).end();
                        }
                    })();
                });
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

async function updateCommentReputation(senderId,authorId,commentId,change,voterType) {
    const settings = {upsert:true};
    if (voterType == "undo") { // new votes already checked
        await commentVotesCollection.updateOne({"commentId": commentId},{
            $inc: {
                "voteCount": change
            }
            }, settings);
        await usersCollection.updateOne({userId: authorId}, { $inc: {rep: change}});
    }
    else { // vote-changing not checked yet
        await commentVotesCollection.updateOne({"commentId": commentId},{
            $addToSet: {
                [voterType]: senderId
            }
        }, settings, async (error,result) => {
            if (error) {
                console.log("ERROR: " + error);
            }
            if(result.modifiedCount && result.modifiedCount > 0){
                await commentVotesCollection.updateOne({"commentId": commentId},{
                    $inc: {
                        "voteCount": change
                    }
                    }, settings);
                await usersCollection.updateOne({userId: authorId}, { $inc: {rep: change}});
                if (change == 1) {
                    let commentVoteCount = await commentVotesCollection.findOne({"commentId": commentId});
                    if (commentVoteCount.voteCount && scoreMilestones.find(element => element == commentVoteCount.voteCount)) {
                        if (commentVoteCount.voteCount > commentVoteCount.milestone || !commentVoteCount.milestone ) {
                            await notifsCollection.updateOne({userId: authorId}, {$push: 
                                {notifs: {
                                    type: "voteMilestoneComment",
                                    milestone: commentVoteCount.voteCount,
                                    commentId: commentId,
                                    notifId: short.generate(),
                                    date: Date.now(),
                                    seen: false

                                    }
                                } 
                                
                            },{upsert: true});
                            await commentVotesCollection.updateOne({"commentId": commentId},{
                                $set: {
                                    "milestone": commentVoteCount.voteCount
                                }
                                }, settings);
                        }
                        
                    }
                    
                }
            }
        }
        );
    }
    
        
    
}

app.post("/api/voteOnComment/:commentId", [middleware.jsonParser, middleware.authenticateToken], function (req, res) {
    var client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    var body = req.body;

    if (req && req.params.commentId && (body.vote == 0 || body.vote == -1 || body.vote == 1)) {
        try {
            if (req.decoded) {
            
            client.connect( (err,db) => {
                if (err) throw err;
                
                    
                    (async ()=>{
                        let loggedUser = await usersCollection.findOne({userId: req.decoded.userId});
                        let targetComment = await commentsCollection.findOne({commentId: req.params.commentId});
                        if (targetComment && loggedUser.username == req.decoded.username) { // verify logged in
                            console.log("verified vote request");
                            const commentId = req.params.commentId;

                            var counterInc = 0;
                            var voterType = null;

                            const authorId = targetComment.commentAuthor;

                            if (authorId != req.decoded.userId) {
                                if (body.vote == 0) {
                                    commentVotesCollection.updateOne({commentId: commentId},{
                                        $pull: {
                                            "dislikers": req.decoded.userId
                                        }
                                    }, async (error, result) => {
                                        if(result.modifiedCount > 0){
                                            await updateCommentReputation(req.decoded.userId,authorId,commentId,1,"undo");
                                        }
                                        else{
                                            commentVotesCollection.updateOne({commentId: commentId},{
                                                $pull: {
                                                    "likers": req.decoded.userId
                                                }
                                            }, async (error, result) => {
                                                if(result.modifiedCount > 0){
                                                    await updateCommentReputation(req.decoded.userId,authorId,commentId,-1,"undo");
                                                }
                                            });
                                        }
                                    });
                                }
                                if(body.vote == 1){
                                    voterType = "likers";
                                    counterInc = 1;
                                    await commentVotesCollection.updateOne({"commentId": commentId},{
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
                                            await updateCommentReputation(req.decoded.userId,authorId,commentId,2,voterType);
                                        }
                                        else if (!result) {
                                            console.log("what");
                                            counterInc = 0;
                                            
                                        }
                                        else {
                                            await updateCommentReputation(req.decoded.userId,authorId,commentId,1,voterType);
                                        }
                                    }
                                    );
                                }
                                else if(body.vote == -1){
                                    voterType = "dislikers";
                                    counterInc = -1;
                                    await commentVotesCollection.updateOne({"commentId": commentId},{
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
                                            await updateCommentReputation(req.decoded.userId,authorId,commentId,-2,voterType);
                                        }
                                        else if (!result) {
                                            console.log("what");
                                            counterInc = 0;
                                        }
                                        else {
                                            await updateCommentReputation(req.decoded.userId,authorId,commentId,-1,voterType);
                                        }
                                    }
                                    );
                                } 
                            }
                        
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

// Notifications

app.get("/api/fetchNotifs", [middleware.jsonParser, middleware.authenticateToken], function (req, res) {
    if (req) {
        try {
            if (req.decoded) {
                var client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
                client.connect( (err,db) => {
                    if (err) throw err;
                
                    var tokenData = req.decoded
                    var adminMode = tokenData.isAdmin;
                    (async ()=>{
                        let queryStuff = {
                            "pageNum": 0,
                            "limit": 25
                        }

                        if (parseInt(req.query.page) && parseInt(req.query.page) > 0) {
                            queryStuff.pageNum = parseInt(req.query.page);
                        }

                        // if (parseInt(req.query.limit) && parseInt(req.query.limit) < 100) {
                        //     queryStuff.limit = parseInt(req.query.limit);
                        // }
                        
                        var notifStream = []

                        let startingCount = ( queryStuff.pageNum > 0 ? ( ( queryStuff.pageNum - 1 ) * queryStuff.limit ) : 0 );

                        let foundNotifs = await notifsCollection.aggregate([
                            {
                                $match: {
                                    userId: req.decoded.userId
                                },
                              },
                              {
                                $project: {
                                    notifs: {
                                    $slice: [
                                      { $reverseArray: "$notifs" },
                                      startingCount,
                                      startingCount + queryStuff.limit,
                                    ],
                                  },
                                },
                              },
                        ]
                        );
                        // let cursor = await usersCollection.find({ userId: { $gt: startingCount} })
                        // .sort({userId:1})
                        // .skip( queryStuff.pageNum > 0 ? ( ( queryStuff.pageNum - 1 ) * queryStuff.limit ) : 0 )
                        // .limit( queryStuff.limit )
                        
                        if (foundNotifs) {
                            for await (let main of foundNotifs) {
                                for (let notif of main.notifs) {
                                    console.log(notif);
                                    if (notif.type == "newPost" || notif.type == "voteMilestone" ) {
                                        let post = await allPostsCollection.findOne({postId: notif.postId});
                                        notif.postData = post;
                                        
                                        let umati = await umatisCollection.findOne({umatiId: post.hostUmati});
                                        notif.umatiData = umati;
                                        

                                        if (notif.type == "newPost") {
                                            let user = await usersCollection.findOne({userId: post.author});
                                            user = cleanUserData(user,adminMode);
                                            notif.userData = user;
                                        }
                                        
                                    }
                                    else if (notif.type == "voteMilestoneComment") {
                                        let comment = await commentsCollection.findOne({commentId: notif.commentId});
                                        let post = await allPostsCollection.findOne({postId: comment.postId});
                                        let umati = await umatisCollection.findOne({umatiId: post.hostUmati});
                                        notif.commentData = comment;
                                        notif.postData = post;
                                        notif.umatiData = umati;
                                    }
                                    else if (notif.type == "newComment") {
                                        let comment = await commentsCollection.findOne({commentId: notif.commentId});
                                        let user = await usersCollection.findOne({userId: comment.commentAuthor});
                                        user = cleanUserData(user,adminMode);
                                        notif.userData = user;
                                        let post = await allPostsCollection.findOne({postId: notif.postId});
                                        let umati = await umatisCollection.findOne({umatiId: post.hostUmati});
                                        notif.commentData = comment;
                                        notif.postData = post;
                                        notif.umatiData = umati;
                                    }
                                    
                                    notifStream.push(notif);
                                }
                                
                            }
                            res.json(notifStream).end();
                        }
                        else {
                            res.status(404).end();
                        }
                        
                    })();
                });
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

app.get("/api/notifCount", [middleware.jsonParser, middleware.authenticateToken], function (req, res) {
    if (req) {
        var client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
        try {
            if (req.decoded) {
                
                client.connect( (err,db) => {
                    if (err) throw err;
                
                    var tokenData = req.decoded
                    var adminMode = tokenData.isAdmin;
                    console.log("notifCount");
                    (async ()=>{
                        let foundNotifs = await notifsCollection.findOne(
                            {userId: req.decoded.userId},
                            {notifs: 1}
                        );
                        
                        if (foundNotifs) {
                            let notifCount = 0;
                            for (let i = 0; i < foundNotifs.notifs.length; i++) {
                                if (foundNotifs.notifs[i].seen != true) {
                                    notifCount++;
                                }
                            }
                            let send = {
                                notifCount: notifCount
                            }
                            res.json(send).end();
                        }
                        else {
                            res.status(404).end();
                        }
                        
                    })();
                });
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

app.post("/api/readNotif", [middleware.jsonParser, middleware.authenticateToken], function (req, res) {
    var body = req.body;
    if (req && body) {
        var client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
        try {
            var tokenData = req.decoded
            var adminMode = req.decoded.isAdmin;
            if (req.decoded) {
                client.connect( (err,db) => {
                    if (err) throw err;
                    (async ()=>{
                        let updateop = await notifsCollection.updateOne(
                            {"userId": req.decoded.userId, "notifs.notifId": req.body.readId},
                            {$set: {"notifs.$.seen": true}}, {upsert: true}
                        );
                        req.body.modifiedCount = updateop.modifiedCount;
                        res.json(req.body).end();
                    })();
                });
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

app.post("/api/dismissNotifs", [middleware.jsonParser, middleware.authenticateToken], function (req, res) {
    var body = req.body;
    if (req && body) {
        var client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
        try {
            var tokenData = req.decoded
            var adminMode = req.decoded.isAdmin;
            if (req.decoded) {
                client.connect( (err,db) => {
                    if (err) throw err;
                    (async ()=>{
                        let updateop = await notifsCollection.updateOne(
                            {"userId": req.decoded.userId},
                            {$set: {"notifs": []}}, {upsert: true}
                        );
                        req.body.modifiedCount = updateop.modifiedCount;
                        res.json(req.body).end();
                    })();
                });
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