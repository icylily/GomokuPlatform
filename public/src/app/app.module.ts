import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { CanvasComponent } from './canvas.component';
import { BoardComponent } from './board.component';
import { HttpService } from './http.service';

const config: SocketIoConfig = { url: 'http://localhost:7000', options: {} };

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
