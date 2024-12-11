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

/* Dictionnaire des utilisateurs 
    ex: 
        utilisateurs = {
            "cbf87ed0-977d-407d-8078-d4291ffbcc1e": {
                "username": "mathéo",
                "socket.id": "Y5Pg7qO3oRMXJ9BXAAAB"
            },
            "64ccbedc-47b7-4b95-9c6b-bf965fcfaaa6": {
                "username": "toto",
                "socket.id": "kGqLN1Rn1T3EFYPcAAAC"
            }
        }

*/
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

/* Listes des rooms
    ex :
    rooms = {
        "room-0": {
            "joueurs" : ["cbf87ed0-977d-407d-8078-d4291ffbcc1e", 64ccbedc-47b7-4b95-9c6b-bf965fcfaaa6],
        },
        "room-1": {
            "joueurs" : ["7069a2b1-4a85-4507-9ccd-5cfe773084c0", 14c6156edc-47e7-4bg5-9c1b-bf961651aaa6],
        },
    }
 */
var maxPlayerPerRoom = 4
var rooms = {}
var roomNumber = 0

roomsManager = (uuid) => {
    for (let i in rooms) {
        if (rooms[i]["joueurs"].length < maxPlayerPerRoom) {
            rooms[i]["joueurs"].push(uuid)
            return i
        }
    }
    // Si aucune room n'est disponible
    rooms[`room-${roomNumber}`] = {joueurs: [uuid]}
    roomNumber++
    return `room-${roomNumber - 1}`
}

locateJoueursRooms = (uuid) => {
    for (let key in rooms) {
        if (rooms[key]["joueurs"].includes(uuid)) {
            return key
        }
    }
    return null
}
io.on("connection", (utilisateur) => {

    utilisateur.on("join", (uuid) => {
        var username = utilisateurs[uuid]["username"]
        utilisateurs[uuid]["socket.id"] = utilisateur.id
        console.log(`${username} s'est connecté`);
        utilisateur.emit("redirect", "/jeu");
        utilisateur.join(roomsManager(uuid));
    });

    utilisateur.on("chat message", (object) => {
        var uuid = object["sender"]
        var msg = object["msg"]
        var username = utilisateurs[uuid]["username"]
        console.log(`message dans (${locateJoueursRooms(uuid)}): ${username}> ${msg}`);
        io.in(locateJoueursRooms(uuid)).emit("chat message", `${username}> ${msg}`);
    });

    utilisateur.on('disconnect', () => {
        for (const key in utilisateurs) {
            if (utilisateurs[key]["socket.id"] == utilisateur.id) {
                var uuid = key
                break
            }
        }
        if (!utilisateurs[uuid]) {
            return
        }
        console.log(`${utilisateurs[uuid]["username"]} s'est deconnecté`);
        var roomJoueur = locateJoueursRooms(uuid)
        var positionJoueurRoom = rooms[roomJoueur]["joueurs"].indexOf(uuid)
        if (positionJoueurRoom > -1) {
            rooms[roomJoueur]["joueurs"].splice(positionJoueurRoom, 1);
        }
        delete utilisateurs[uuid]

        if (rooms[roomJoueur]["joueurs"].length == 0) {
            delete rooms[roomJoueur]
        }
    })
});

/************************ ROOM HANDLING *************************/


/************************ LISTENING *************************/
server.listen(8080);
console.log('8080 is the magic port');