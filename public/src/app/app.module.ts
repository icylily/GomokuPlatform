import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { HttpClientModule } from '@angular/common/http';
import { environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { CanvasComponent } from './canvas.component';
import { BoardComponent } from './board.component';
import { HttpService } from './http.service';

// const config: SocketIoConfig = { url: 'http://192.168.1.152:7000', options: {} };
const config: SocketIoConfig = { url: 'localhost:7000', options: {} };
// const config: SocketIoConfig = { url: environment.ws_url, options: {} };
@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    SocketIoModule.forRoot(config)
  ],
  providers: [HttpService],
  declarations: [AppComponent, CanvasComponent,  BoardComponent],
  bootstrap: [AppComponent]
})
export class AppModule { 


}
