import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { CanvasComponent } from './canvas.component';
import { BoardComponent } from './board.component';
import { ChessBoardComponent } from './chess-board/chess-board.component';

@NgModule({
  imports: [BrowserModule, FormsModule],
  declarations: [AppComponent, CanvasComponent, ChessBoardComponent, BoardComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
