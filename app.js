const express = require("express");
const path = require("path");
const sqlite3 = require('better-sqlite3')
const db = sqlite3('./buekorps.db', {verbose: console.log})
const session = require('express-session')
const dotenv = require('dotenv');
const bcrypt = require('bcrypt')
dotenv.config()



const app = express();
const staticPath = path.join(__dirname, 'public')

app.use(express.urlencoded({ extended: true }));


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

app.post('/login', (req, res) => {
    console.log(req.body)
    let user = checkUserPassword(req.body.username, req.body.password) 
    if (user != null) {
        req.session.loggedIn = true
        req.session.username = req.body.username
        req.session.userrole = user.role
        req.session.name = user.firstName + ' ' + user.lastName
        req.session.userid = user.ID
        //res.redirect('/');
        // Pseudocode - Adjust according to your actual frontend framework or vanilla JS
        if (req.session.userrole === 'Soldier') {
            res.sendFile(path.join(__dirname, "public/peletonMembers.html"));
        } else if (req.session.userrole === 'Leader') {
            displayLeaderForm();
        } else if (req.session.userrole === 'Administrator') {
            displayAdministratorForm();
        }

    } else {
        req.session.loggedIn = false;
        res.sendFile(path.join(__dirname, "public/loginForm.html"));
    }

})


function checkUserPassword(username, password){

    const getOldHash = db.prepare('SELECT password FROM user WHERE username = ?');

    const oldHash = getOldHash.get(username);
    console.log("oldHash: ", oldHash.password)

    const result = bcrypt.compareSync(password, oldHash.password);
    console.log("Result of comparing passwords: " + result)


    if (result) {
        const sql = db.prepare('SELECT user.id, user.firstname, user.lastname, roles.name as roles FROM user INNER JOIN roles where user.role_id = roles.id AND username = ?');
        let rows = sql.all(username);
        return rows.length > 0 ? rows[0]:null
    }
}

//Denne henger sammen med i loginformen -- Jeg var lat og har både login og register i loginform.html
//  <form action='/register' method="POST">
app.post('/register', (req, res) => {
    console.log(req.body)
    addUser(req.body.username, req.body.firstname, req.body.lastname, req.body.mobile, req.body.email, req.body.password, req.body.peleton_id)
    res.sendFile(path.join(__dirname, "public/loginForm.html"));
     
});
 
 
 app.get('/createUser.html', (req, res) => {
    console.log("redirect to create user")
    res.sendFile(path.join(__dirname, 'public', 'createUser.html'));
});

app.post('/create-user', (req, res) => {
    console.log("createUser", req.body);
    const user = req.body;
    addUser(user.username, user.firstname, user.lastname, user.mobile, user.email, user.password);
    // Redirect to user list or confirmation page after adding user
    res.redirect('/loginForm.html');
});

//Middleware 
//I alle app.get() app.post og app.put blir denne funksjonen kjørt før app.() blir kjørt. 
//Her sjekkes om bruker er logget inn, hvis ikke blir du rutet til loginformen
//login og register ligger foran deklarasjonen av middleware, så denne slår
//derfor ikke inn der
/*
app.use((req, res, next)=>{
    console.log(req.session)
    if (req.session.loggedIn != undefined && req.session.loggedIn){
        console.log("Bruker innlogget")
        
        next()
    }
    else {
        console.log("Bruker not logged in - redirect i middleware")
        res.sendFile(path.join(__dirname, "public/loginForm.html"));

    }
})
*/
function checkLoggedIn(req, res, next) {
    if (!req.session.loggedIn) {
        res.redirect('/loginForm.html');
    } else {
        next();
    }
}

function checkRole(role) {
    return (req, res, next) => {
        if (req.session.userrole === role) {
            next();
        } else {
            res.status(403).send('Access Denied');
        }
    };
}

async function getUsers(request, response) {

    const sql=db.prepare('SELECT username, firstname, lastname, mobile, roles.name as role, peleton.name as peleton, kompani.name as kompani FROM user '+
    ' inner join roles on roles.id = user.role_id' +
    ' inner join peleton on peleton.id = user.peleton_id' +
    ' inner join kompani on kompani.id = peleton.kompani_id')
    let rows = sql.all()   
    console.log("rows.length",rows.length)

    response.send(rows);

}

// Example usage of middleware 
//i stdet for å bruke app.use() som først vist, kaller vi middlewaren direkte
//Og det fine er at vi først kan sjekke at bruker er logget inn, og deretter
//sjekke riktig rolle 
app.post('/add-member', checkLoggedIn, checkRole('Leader'), (req, res) => {
    // Code to add a member to a peleton
});

app.get('/leader.html', checkLoggedIn, checkRole('Leader'), (req, res) => {
    
})


app.get('/api/peletonMember', checkLoggedIn,  (req, res) => {
    // Code to return name of peleton and 
    //members of the peleton which user is member of
    
    const sql=db.prepare('SELECT peleton.name as peleton, user.id, user.firstname, user.lastname, user.mobile, roles.name as role, peleton.name as peleton, kompani.name as kompani FROM user ' + 
    ' inner join peleton on peleton.id = user.peleton_id ' +
    ' inner join roles on user.role_id = roles.id ' +
    ' inner join kompani on peleton.kompani_id = kompani.id' +
    ' where peleton_id in (select peleton_id from user where id = ?)')
    let rows = sql.all(req.session.userid)   
    console.log("rows.length",rows.length)

    res.send(rows);
});

const saltRounds = 10

function addUser(username, firstName, lastName, mobile, email, password) {
    // Generate a salt
    const salt = bcrypt.genSaltSync(saltRounds);
    // Hash the password with the generated salt
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Insert the user into the database with the hashed password
    const sql = db.prepare("INSERT INTO user (username, firstName, lastName, mobile, role_id, peleton_id, email, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    const info = sql.run(username, firstName, lastName, mobile, 1, peleton_id, email, hashedPassword);
    return info;
}



function updateUserDB(username, firstName, lastName, mobile) {
    const sql = db.prepare("update user set firstName=(?), lastName =(?), mobile=(?)  where username=(?)")
    const info = sql.run(firstName, lastName, mobile, username)
}

//Denne henger sammen med i html: Se sammenheng Method = POST og app.post
// <form id="userForm" action='/user' method="POST">
app.post("/user", checkLoggedIn, (req, res) => {
    console.log(req.body)
    const user = req.body
    updateUserDB(user.username, user.firstname, user.lastname, user.cell)
    res.sendFile(path.join(__dirname, "public/index.html"));
})

 

//denne må defineres etter middleware. 
//Jeg prøvde å flytte den opp, for å rydde i koden og da fungerte det ikke
app.use(express.static(staticPath));

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});