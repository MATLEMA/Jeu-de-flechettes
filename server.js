
var express = require('express');
var { createServer } = require("node:http");
const path = require('path');
var app = express();
var server = createServer(app);


const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:8080",
        methods: ["GET", "POST"],
        transports: ['websocket', 'polling'],
        credentials: true
    },
    allowEIO3: true
});

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', function (req, res) {
    console.log("/\n" + JSON.stringify(req.body, null, 2));
    res.render("pages/login", {});
});

app.get('/jeu', function (req, res) {
    console.log("/jeu\n" + JSON.stringify(req.body, null, 2));
    res.render("pages/jeu", {});
});

// Envoi d'une page 404 si la page n'est pas trouvée
// app.all('*', (req, res) => { 
//     console.log("/404\n" + JSON.stringify(req.headers, null, 2));
//     console.log("/404\n" + JSON.stringify(req.body, null, 2));
//     res.status(404).render("pages/404", {});
// })

app.post("/login", function (req, res) {
    console.log("/login\n" + JSON.stringify(req.body, null, 2));
    let username = req.body.username;

    if (username) {
        res.redirect("/jeu");
        res.end();
    } else {
        res.send("Veuillez entrer un nom correct!");
		res.end();
    }
})

// SOCKET CONNEXION
var utilisateurs = {}

io.on("connection", (utilisateur) => {

    utilisateur.on("join", function(name){
        var usernameExiste = Object.values(utilisateurs).includes(name);
        if (usernameExiste) {
            if (usernameExiste) {
                utilisateur.emit("reponse", "AlreadyExist");
            } else {
                utilisateur.emit("reponse", "NonCorrect");
            }
        } else {
            utilisateurs[utilisateur.id] = name;
            console.log(`${name} s'est connecté`);
            console.log(`${utilisateur.id} s'est connecté`);
            utilisateur.emit("redirect", "/jeu");
        }
    });

    utilisateur.on("chat message", (msg) => {
        console.log(`message: ${utilisateurs[utilisateur.id]}> ${msg}`);
        io.emit("chat message", `${utilisateurs[utilisateur.id]}> ${msg}`);
    });

    utilisateur.on('disconnect', () => {
        delete utilisateurs[utilisateur.id]
        console.log(`${utilisateur.id} s'est deconnecté`);
    })
});

server.listen(8080);
console.log('8080 is the magic port');