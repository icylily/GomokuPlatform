const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const port = 7000;
const app = express();

const rooms = {}; // temporary fake database

app.use(express.static(__dirname + '/public/dist/public'));
app.use(bodyParser.json());
const server=app.listen(port, () => console.log(`Start listening on port ${port}`));

const io = require('socket.io').listen(server);

var users={};
user_count = 0;

io.on("connection", socket => {
    console.log('Someone login !');
    let firstuser;
    let seconduser;

    // change channel of socket
    const safeJoin = currentId => {
        socket.leave(previousId);
        socket.join(currentId);
        previousId = currentId;
    };

    socket.on("get_new_user",name=>{
        console.log(name);
        if (user_count==0){
            isBlack = false; 
            users[socket.id] = { name: name, isBlack: isBlack, role: 'player', current: false}
            socket.emit("message", { msg: "Welcome. Please wait until other player join game.", user: users[socket.id]})
            user_count++;
            this.firstuser = socket.id
            console.log("emit")
        }
        else if (user_count == 1){
            isBlack = true;
            users[socket.id] = { name: name, isBlack: isBlack, role: 'player',current:false }
            socket.emit("message", { msg: "Welcome.Game started. Please wait the white side go first.", user: users[socket.id]})
            this.seconduser= socket.id;
            users[this.firstuser].current = true;
            io.sockets.connected[this.firstuser].emit('game',{type:"start",msg:"Game start. Please put piece down",user:users[this.firstuser]});
            user_count++;
        }
        else if (user_count>1){
            isBlack = false;
            users[socket.id] = { name: name, isBlack: isBlack, role: 'visitor', current: false }
            socket.emit("message", { msg: "Welcome. Game already started. you can only watch .", user: users[socket.id]})
            user_count++;
        }
        
    })
    socket.on("draw_chess_man", option => {
        socket.broadcast.emit('game', { type:"draw_chess_man",option:option})
        if (socket.id==this.firstuser){
            users[this.seconduser].current = true;
            io.sockets.connected[this.seconduser].emit('game', { type: "start", msg: "Game start. Please put piece down", user: users[this.seconduser] });
            socket.emit('game',{type:'lock'})
        }
        else if (socket.id == this.seconduser) {
            users[this.firstuser].current = true;
            io.sockets.connected[this.firstuser].emit('game', { type: "start", msg: "Game start. Please put piece down", user: users[this.firstuser] });
            socket.emit('game', { type: 'lock' });
        }
    });

    socket.on("game_over" ,() =>{
        // socket.broadcast.emit('game',{type:"game_over",user:users[socket.id]});
        io.emit('game', { type: "game_over", user: users[socket.id] });
        console.log("emit game over");

        

    })
        
    // socket.on("getRoom", roomId => {
    //     console.log(rooms[roomId]);
    //     safeJoin(roomId); // change socket channel
    //     socket.emit("room", rooms[roomId]);
    // });

    // socket.on("addRoom", room => {
    //     rooms[room.id] = room; // add room to fake database
    //     safeJoin(room.id); // change socket channel to room Id
    //     io.emit("allRooms", Object.keys(rooms)); // emit updated all rooms
    //     socket.emit("room", room); // emit new room created
    // });

    // socket.on("editRoom", room => {
    //     rooms[room.id] = room;
    //     socket.to(room.id).emit("room", room);
    // });

    // io.emit("allRooms", Object.keys(rooms));
});
