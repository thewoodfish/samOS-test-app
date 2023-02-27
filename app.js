// imports
import { createRequire } from "module";
import path from 'path';
import { fileURLToPath } from 'url';
import { SamaritanSDK } from 'samaritan-js-sdk';
import * as util from "./utility.js";
import e from "express";
import { read } from "fs";

// imports
const require = createRequire(import.meta.url);
const express = require('express');
const app = express();
const port = 2000;
const bodyParser = require('body-parser');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// static files
app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'));
app.use('/js', express.static(__dirname + 'public/js'));
app.use('/img', express.static(__dirname + 'public/img'));

// set views
app.set('views', './views');
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

class SessionCache {
    cache = {}

    get = (key) => {
        return this.cache[key];
    }

    set = (key, value) => {
        this.cache[key] = value;
        return value;
    }

    del = (key) => {
        const val = cache[key];
        delete this.cache[key];
        return val;
    }

    has = (key) => {
        return key in this.cache;
    }
}

let silverCache = new SessionCache();

// initialize Samaritan SDK
const sam = new SamaritanSDK("ws://127.0.0.1:1509");
let testApp = undefined;
await sam.init();

// wait 5 seconds for initialization
setTimeout(async () => {
    testApp = await sam.did.auth("species some staff bring plant england long third m your heart family");
}, 5000);


app.get('', (req, res) => {
    res.render('index', { text: 'This is sparta' });
});

app.get('/about', (req, res) => {
    res.render('about', { text: 'Eragon and the dragon' });
});

app.post('/signup', (req, res) => {
    signUpUser(req.body, res);
});

app.post('/signin', (req, res) => {
    signInUser(req.body, res);
});

app.post('/update-profile', (req, res) => {
    updateProfile(req.body, res);
});

app.post('/submit-story', (req, res) => {
    submitStory(req.body, res);
});

// get data of current session user
app.post('/init', (req, res) => {
    let user = isAuth(req.body.nonce);
    if (user) {
        res.send({
            data: {
                email: user.email,
                name: user.name,
                about: user.about,
                msg: "initialization complete"
            },
            error: false
        })
    } else {
        res.send({
            data: {
                msg: "could not sign you in"
            },
            error: true
        })
    }
});

// signup user
async function signUpUser(req, res) {
    let dataFields = ["email", "name"];
    let result = await sam.did.getAuthData(req.addr, req.appAccessKey, dataFields);

    // if email is not return, return error
    if (!result.data[0]) {
        res.send({
            data: {
                msg: "could not retrieve your data from the network"
            },
            error: true
        })
    } else {
        // save password to table
        let authData = {
            did: req.addr,
            name: result.data[1],
            password: req.password
        };

        // check if auth structure has been setup
        let authTable = await sam.db.get(null, "authTable");
        authTable = authTable.status != "Not found" ? authTable : {};
        authTable[result.data[0]] = authData;

        // save login data
        let rslt = await sam.db.insert(null, "authTable", authTable);

        // generate 
        const nonce = util.randomStr(12);

        // save session
        silverCache.set(nonce, {
            did: req.addr,
            email: result.data[0],
            name: result.data[1]
        });

        if (rslt) {
            res.send({
                data: {
                    email: result.data[0],
                    name: result.data[1],
                    nonce,
                    msg: "signup successful"
                },
                error: false
            })
        }
    }

}

async function signInUser(req, res) {
    try {
        // check if email and password correlates
        let authTable = await sam.db.get(null, "authTable");
        if (authTable.status == "Not Found") {
            throw new Error("o");
        } else {
            // compare the password
            if (!authTable.hasOwnProperty(req.email)) {
                throw new Error("o");
            }

            let user = authTable[req.email];

            // check user
            if (user.password != req.password) {
                throw new Error("o");
            }

            // generate 
            const nonce = util.randomStr(12);

            // save session
            silverCache.set(nonce, {
                did: user.did,
                email: req.email,
                name: user.name
            });

            res.send({
                data: {
                    email: req.email,
                    name: user.name,
                    about: user.about,
                    nonce,
                    msg: "login successful"
                },
                error: false
            });
        }
    } catch (e) {
        res.send({
            data: {
                msg: "invalid login details given"
            },
            error: true
        })
    }
}

async function updateProfile(req, res) {
    try {
        // make sure the user is authenticated
        let user = isAuth(req.nonce);

        if (user) {
            // get profile data
            let authTable = await sam.db.get(null, "authTable");
            if (authTable.status == "Not Found") {
                throw new Error("o");
            } else {
                // compare the password
                if (!authTable.hasOwnProperty(user.email)) {
                    throw new Error("o");
                }

                let userData = authTable[user.email];
                
                // update user data
                userData["email"] = req.email;
                userData["name"] = req.name;
                userData["about"] = req.about;

                // insert into tab;e
                authTable[user.email] = userData;

                let result = await sam.db.insert(null, "authTable", authTable);

                if (result) {
                    res.send({
                        data: {
                            email: req.email,
                            name: req.name,
                            about: req.about,
                            msg: "profile updated succesfully!"
                        },
                        error: false
                    })
                }
            }
        } else throw new Error("dos");

    } catch (e) {
        res.send({
            data: {
                msg: "please login to continue"
            },
            error: true
        })
    }
}

async function submitStory(req, res) {
    try {
        // make sure the user is authenticated
        let user = isAuth(req.nonce);
        if (user) {
            let result = await sam.db.insert(user.did, req.title, req.body);
            if (result) {
                res.send({
                    data: {
                        msg: "Story added to catalogue!"
                    },
                    error: false
                })
            }
        } else throw new Error("dos");

    } catch (e) {
        res.send({
            data: {
                msg: "please login to continue"
            },
            error: true
        })
    }
}

function isAuth(nonce) {
    let data = silverCache.get(nonce);
    if (data) {
        return data;
    } else {
        return false;
    }
}

// listen on port 3000
app.listen(port, () => console.info(`listening on port ${port}`));
