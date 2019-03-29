import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpService } from 'src/app/http.service';
import { Observable, Subscription } from 'rxjs';
import { Room } from 'src/app/common/room';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = ' Welcome to Gomoku Dojo. Let\'s play' ;
  page:string = "index";
  user:any={
    name:'',
    socket_id:'',
    role:'',
    current:'',
    isBlack:false
  }
  allRooms: any;
  room_num:0;
  room:any;
  // name = prompt('What is your name?');
  private _roomSub: Subscription;
  private _roomListSub: Subscription;

  constructor(private httpService: HttpService) { 
    
    // this.httpService.observable
    // .subscribe(data=>{

    //   console.log(data)
    // })
  }
  ngOnInit() {
    this._roomListSub = this.httpService.allRooms
    .subscribe(data=>{ this.allRooms = data})

    this._roomSub = this.httpService.message
    .subscribe(data => {
      console.log("get message from server");
      console.log(data)
      this.title = data.msg;
      this.user = data.user;
      if (data.type == "room_list"){
        this.page = "room_list";
        this.room_num = data.room_num;
        console.log("receive room_list message ,data is ",data);
      }
      if (data.type == "enter_room") {
        this.page = "room";
        // this.room_num = data.room_num;
        console.log("receive enter_room message ,data is ", data);
        this.room = data.room;
        this.user = data.user;
      }
    });
   
  }

  ngOnDestroy() {
    this._roomSub.unsubscribe();
  }

  get_new_user(){
    this.httpService.get_new_user(this.user.name);
  }

  newRoom() {
    console.log("app.ts newRoom", this.room_num);
    return this.httpService.createRoom(this.room_num+1);
  }

  loadRoom(id:any){
    console.log("load room",id);
    return this.httpService.enterRoom(id);
  }
}
