/************************ IMPORT *************************/
var express = require("express");
var { createServer } = require("node:http");
const path = require("path");
const cookieParser = require("cookie-parser");
var app = express();
var server = createServer(app);
var crypto = require("crypto")

/************************ SETUP EXPRESS *************************/
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/************************ SETUP SOCKET.IO *************************/
const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:8080",
        methods: ["GET", "POST"],
        transports: ["websocket", "polling"],
        credentials: true
    },
    allowEIO3: true
});

/************************ PAGES HANDLING *************************/
app.get("/", (req, res) => {
    if (req.cookies.uuid){
        res.clearCookie("uuid")
    }
    return res.render("pages/login", {});
});

app.get("/jeu", (req, res) => {
    if (req.cookies.uuid && Object.keys(utilisateurs).includes(req.cookies.uuid)) {
        return res.render("pages/jeu", {});
    } else {
        res.redirect("/")
    }
});

/* Dictionnaire des utilisateurs */
var utilisateurs = {}

/* Gère les noms d'utilisateurs */
app.post("/login", (req, res) => {
    isValid = (username) => {
        if (username.length <= 30) {
            return true
        } else {
            return false
        }
    } 
    var username = req.body.username;

    if (username && !Object.values(utilisateurs).includes(username) && isValid(username)) {
        const uuid = crypto.randomUUID()
        utilisateurs[uuid] = {"username": username}
        res.cookie("uuid", uuid)
        res.redirect("/jeu");
    } else {
        res.status(400).send("Veuillez saisir un nom d'utilisateur correct!");
    }
})


/* PAGE 404 */
app.all('*', (req, res) => { 
    console.log("/404\n" + JSON.stringify(req.headers, null, 2));
    console.log("/404\n" + JSON.stringify(req.body, null, 2));
    res.status(404).render("pages/404", {});
})

/************************ SOCKET.IO LOGIQUE *************************/

io.on("connection", (utilisateur) => {

    utilisateur.on("join", (uuid) => {
        var username = utilisateurs[uuid]["username"]
        utilisateurs[uuid]["socket.id"] = utilisateur.id
        console.log(`${username} s'est connecté`);
        utilisateur.emit("redirect", "/jeu");
    });

    utilisateur.on("chat message", (object) => {
        var uuid = object["sender"]
        var msg = object["msg"]
        var username = utilisateurs[uuid]["username"]
        console.log(`message: ${username}> ${msg}`);
        io.emit("chat message", `${username}> ${msg}`);
    });

    utilisateur.on('disconnect', () => {
        var username = null
        for (const key in utilisateurs) {
            if (utilisateurs[key]["socket.id"] == utilisateur.id) {
                var username = utilisateurs[key]["username"]
            }
        }
        console.log(`${username} s'est deconnecté`);
        delete utilisateurs[utilisateur.id]
    })
});

/************************ LISTENING *************************/
server.listen(8080);
console.log('8080 is the magic port');