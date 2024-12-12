/************************ IMPORT *************************/
var express = require("express");
var { createServer } = require("node:http");
const path = require("path");
const cookieParser = require("cookie-parser");
var app = express();
var server = createServer(app);
var crypto = require("crypto");
const { error } = require("node:console");

const { Partie } = require('./private/js/partie');

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
        credentials: true,
    },
    allowEIO3: true,
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
        if (username.length <= 15) {
            return true
        } else {
            return false
        }
    } 
    var username = req.body.username;

    if (username && !Object.values(utilisateurs).includes(username) && isValid(username)) {
        const uuid = crypto.randomUUID()
        utilisateurs[uuid] = {
            "username": username,
            "score": -1
        }
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
            "joueurs": ["cbf87ed0-977d-407d-8078-d4291ffbcc1e", 64ccbedc-47b7-4b95-9c6b-bf965fcfaaa6],
            "status": "attente" | "enJeu" | "fin"
        },
        "room-1": {
            "joueurs" : ["7069a2b1-4a85-4507-9ccd-5cfe773084c0", 14c6156edc-47e7-4bg5-9c1b-bf961651aaa6],
            "status": "attente" | "enJeu" | "fin"
        },
    }
 */
var maxPlayerPerRoom = 4
var rooms = {}
var roomNumber = 0
const status = {
    Attente: 0,
    EnJeu: 1,
    Fin: 2
}

roomsManager = (uuid) => {
    for (let i in rooms) {
        if (rooms[i]["joueurs"].length < maxPlayerPerRoom) {
            rooms[i]["joueurs"].push(uuid)
            return i
        }

    }
    // Si aucune room n'est disponible
    rooms[`room-${roomNumber}`] = {
        "joueurs": [uuid],
        "status": status.Attente
    }
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

getListeJoueursRooms = (room) => {
    var listeJoueurs = []
    for (let uuidJoueur in rooms[room]["joueurs"]) {
        listeJoueurs.push(utilisateurs[rooms[room]["joueurs"][uuidJoueur]]["username"])
    }
    return listeJoueurs
}

getListeJoueurUuidRoom = (room) => {
    var listeJoueursUUID = {}
    for (let uuidJoueur in rooms[room]["joueurs"]) {
        listeJoueursUUID[rooms[room]["joueurs"][uuidJoueur]] = utilisateurs[rooms[room]["joueurs"][uuidJoueur]]["username"]
    }
    return listeJoueursUUID
}
startJeu = () => {

}
io.on("connection", (utilisateur) => {

    utilisateur.on("join", (uuid) => {

       try {
            if (utilisateurs[uuid]["socket.id"]) {
                throw error
            }
            var username = utilisateurs[uuid]["username"]
            utilisateurs[uuid]["socket.id"] = utilisateur.id
            console.log(`${username} s'est connecté`);
            utilisateur.join(roomsManager(uuid));
            var room = locateJoueursRooms(uuid)
            io.in(room).emit("liste-joueurs", getListeJoueursRooms(room))
        }
        catch(err) {
            // utilisateur est deconnecté
            utilisateur.emit("redirect", "/")
        }
    });

    utilisateur.on("chat message", (object) => {
        try {
            var uuid = object["sender"]
            var msg = object["msg"]
            var username = utilisateurs[uuid]["username"]
            console.log(`message dans (${locateJoueursRooms(uuid)}): ${username}> ${msg}`);
            io.in(locateJoueursRooms(uuid)).emit("chat message", `${username}> ${msg}`);
        }
        catch(err) {
            // utilisateur est deconnecté
            utilisateur.emit("redirect", "/")
        }
    });
    
    utilisateur.on("start", (uuid) => {
        console.log("serverside")
        var room = locateJoueursRooms(uuid)
        console.log(room)
        io.in(room).emit("start", {})
        rooms[room]["status"] = status.EnJeu
        new Partie("301", io, getListeJoueurUuidRoom(room), room)
    })

    // Il se peut que l'utilisateur se déconnecte un bref instant (reload de la page) 
    // Après reload il y a une chance que l'utilisateur perde sa session
    // TODO attendre quelques secondes avant de détruire la session
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