import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpService } from 'src/app/http.service';
import { Room } from 'src/app/common/room';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = ' Welcome to Gomoku Dojo. Let\'s play' ;
  name = prompt('What is your name?');
  private _roomSub: Subscription;
  private _gameSub: Subscription;
  user:any = {};
  constructor(private httpService: HttpService) { 
    this.httpService.get_new_user(this.name);
    this.httpService.observable
    .subscribe(data=>{

      console.log(data)
    })
  }
  ngOnInit() {
    this._roomSub = this.httpService.message
    .subscribe(data => {
      console.log("get message from server");
      console.log(data)
      this.title = data.msg;
      this.user = data.user;
    });
    this._gameSub = this.httpService.game
      .subscribe(data => {
        console.log("get game message");
        console.log(data)
        this.title = data.msg;
        this.user = data.user;
      });
  }

  ngOnDestroy() {
    this._roomSub.unsubscribe();
  }

 
}
