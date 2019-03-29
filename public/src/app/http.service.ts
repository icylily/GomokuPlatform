import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Room } from './common/room';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class HttpService {
  // currentRoom = this.socket.fromEvent<Room>('room');
  // allRooms = this.socket.fromEvent<string[]>('allRooms');
  // id = 0;

  constructor(private socket: Socket) { }
  message = this.socket.fromEvent<any>('message');
  game = this.socket.fromEvent<any>('game');
  allRooms = this.socket.fromEvent<string[]>('allRooms');
  id = 0;

  private createId(): string {
    this.id++;
    return `${this.id}`;
  }

  createRoom(id:any) {
    console.log("create room ,id is ",id);
    return this.socket.emit('addRoom', { id: id, chat: '' });

  }
  enterRoom(id:any){
    console.log("enter room",id);
    return this.socket.emit('enterRoom',{id:id});
  }
  
  get_new_user(name: string) {
    return this.socket.emit('get_new_user', name);
  }

  draw_chess_man(option:{}){
    console.log("emit draw_chess_man",option);
    return this.socket.emit('draw_chess_man',option);

  }

  game_over(){
    console.log("emit game over");
    return this.socket.emit('game_over');
  }

 observable = new Observable(observer => {
  this.socket.on('message', (data) => {
    console.log("Received message from Websocket Server")
    observer.next(data);
  })
  return () => {
    this.socket.disconnect();
  }
});

  // private createId(): string {
  //   this.id++;
  //   return `${this.id}`;
  }

//   getRoom(id: string) {
//     return this.socket.emit('getRoom', id);
//   }

//   createRoom() {
//     return this.socket.emit('addRoom', { id: this.createId(), chat: '' });
//   }

//   editRoom(room: Room) {
//     return this.socket.emit('editRoom', room);
//   }
// }
