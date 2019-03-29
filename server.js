const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const port = 7000;
const app = express();

const rooms = {}; // temporary fake database
var room_num=0;

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
    // const safeJoin = currentId => {
    //     socket.leave(previousId);
    //     socket.join(currentId);
    //     previousId = currentId;
    // };

    socket.on("get_new_user", name => {
        console.log(name);
        users[socket.id]={name:name};
        socket.emit("allRooms", Object.keys(rooms));
        socket.emit("message", { type: "room_list", msg: "Crate a new room or enter an existed room.", user: { name: name, socket_id: socket.id }, room_num:room_num})
    })

    socket.on("addRoom", room => {
        rooms[room.id] = room;   // add room to fake database
        rooms[room.id].user_num =1;
        rooms[room.id].status = "watting";
        users[socket.id].room = room.id;
        console.log("room is ",room)
        socket.join(room.id); // change socket channel to room Id
        console.log("user is ", users[socket.id]);
        users[socket.id].role = "player";
        users[socket.id].isBlack = false;
        rooms[room.id].white =socket.id;
        console.log("user is ", users[socket.id]);
        room_num++;
        console.log("rooms is ",rooms);
        console.log("room num is ",room_num);
        io.emit("allRooms", Object.keys(rooms)); // emit updated all rooms
        socket.emit("message", { type: "enter_room", msg: "Welcome, Please wait until other player join.", room: rooms[room.id], user: users[socket.id]})
        // socket.emit("room", room); // emit new room created
    });

    socket.on("enterRoom", room => {
        console.log("enter room ",room);
        users[socket.id].room = room.id;
        socket.join(room.id); 
        users[socket.id].role = "player";
        users[socket.id].isBlack = true;
        users[socket.id].current = false;
        rooms[room.id].status = "battle";
        rooms[room.id].user_num = 2;
        rooms[room.id].black = socket.id;
        rooms[room.id].current = rooms[room.id].white;
        users[rooms[room.id].current].current=true;
        console.log("room", rooms[room.id]);
        console.log("user", users[socket.id]);
        socket.emit("message", { type: "enter_room", msg: "Welcome, let's play.", room: rooms[room.id], user: users[socket.id] })
        // socket.to(room.id).emit("game", { type: "start", room: rooms[room.id], user: users[socket.id]});
        socket.emit('game', { type: "start", msg: "Game start. Please put piece down", room: rooms[room.id], user: users[rooms[room.id].current] })
        io.sockets.connected[rooms[room.id].current].emit('game', { type: "start", msg: "Game start. Please put piece down",room:rooms[room.id], user: users[rooms[room.id].current] });

    });
    // socket.on("get_new_user",name=>{
    //     console.log(name);
    //     if (user_count==0){
    //         isBlack = false; 
    //         users[socket.id] = { name: name, isBlack: isBlack, role: 'player', current: false}
    //         socket.emit("message", { msg: "Welcome. Please wait until other player join game.", user: users[socket.id]})
    //         user_count++;
    //         this.firstuser = socket.id
    //         console.log("emit")
    //     }
    //     else if (user_count == 1){
    //         isBlack = true;
    //         users[socket.id] = { name: name, isBlack: isBlack, role: 'player',current:false }
    //         socket.emit("message", { msg: "Welcome.Game started. Please wait the white side go first.", user: users[socket.id]})
    //         this.seconduser= socket.id;
    //         users[this.firstuser].current = true;
    //         io.sockets.connected[this.firstuser].emit('game',{type:"start",msg:"Game start. Please put piece down",user:users[this.firstuser]});
    //         user_count++;
    //     }
    //     else if (user_count>1){
    //         isBlack = false;
    //         users[socket.id] = { name: name, isBlack: isBlack, role: 'visitor', current: false }
    //         socket.emit("message", { msg: "Welcome. Game already started. you can only watch .", user: users[socket.id]})
    //         user_count++;
    //     }
        
    // })
    socket.on("draw_chess_man", option => {
        socket.broadcast.emit('game', { type:"draw_chess_man",option:option})
        console.log("draw_chess_man",users[socket.id]);
        let room_id = users[socket.id].room;
        if (rooms[room_id].current == rooms[room_id].white){
            rooms[room_id].current = rooms[room_id].black;
        }
        else{
            rooms[room_id].current = rooms[room_id].white;
        }
        users[rooms[room_id].current].current= true;
        socket.emit('game', { type: 'lock' });
        io.sockets.connected[rooms[room_id].current].emit('game', { type: "start", msg: "Game start. Please put piece down", room: rooms[room_id], user: users[rooms[room_id].current] });
        // socket.to(room_id).emit("game", { type: "start", room: rooms[room.id], user: users[socket.id] });
        // if (socket.id==this.firstuser){
        //     users[this.seconduser].current = true;
        //     io.sockets.connected[this.seconduser].emit('game', { type: "start", msg: "Game start. Please put piece down", user: users[this.seconduser] });
        //     socket.emit('game',{type:'lock'})
        // }
        // else if (socket.id == this.seconduser) {
        //     users[this.firstuser].current = true;
        //     io.sockets.connected[this.firstuser].emit('game', { type: "start", msg: "Game start. Please put piece down", user: users[this.firstuser] });
        //     socket.emit('game', { type: 'lock' });
        // }
    });

    socket.on("game_over" ,() =>{
        // socket.broadcast.emit('game',{type:"game_over",user:users[socket.id]});
        io.emit('game', { type: "game_over", user: users[socket.id] });
        console.log("emit game over");

        

    })
        
    
});
