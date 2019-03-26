import {
    Component, Input, ElementRef, AfterViewInit, ViewChild
} from '@angular/core';
import { fromEvent } from 'rxjs';
import { switchMap, takeUntil, pairwise } from 'rxjs/operators'

@Component({
    selector: 'app-board',
    template: '<canvas #board></canvas>',
    styles: ['canvas { border: 1px solid #000; }']
})
export class BoardComponent implements AfterViewInit {

    @ViewChild('board') public canvas: ElementRef;

    @Input() public width = 600;
    @Input() public height = 600;

    private cx: CanvasRenderingContext2D;
    gobangStyle = {
        padding: 30,
        count: 16
    };
    
    lattice = {
    width: (this.width - this.gobangStyle.padding * 2) / this.gobangStyle.count,
    height: (this.height - this.gobangStyle.padding * 2) / this.gobangStyle.count
    }

    public ngAfterViewInit() {
        const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
        this.cx = canvasEl.getContext('2d');
        // this.cx.strokeStyle = '#aaa'
        // this.cx.lineWidth = 1

        canvasEl.width = this.width;
        canvasEl.height = this.height;

        this.cx.lineWidth = 3;
        this.cx.lineCap = 'round';
        this.cx.strokeStyle = '#111';

        this.drawChessboard();

        this.captureEvents(canvasEl);
    }
    drawChessboard() {
      
        // 棋盘网格
        for (let i = 0; i <=this.gobangStyle.count; i++) {
            this.cx.moveTo(this.gobangStyle.padding + i * this.lattice.width, this.gobangStyle.padding)
            this.cx.lineTo(this.gobangStyle.padding + i * this.lattice.width, this.width - this.gobangStyle.padding)
            this.cx.stroke()
            this.cx.moveTo(this.gobangStyle.padding, this.gobangStyle.padding + i * this.lattice.height)
            this.cx.lineTo(this.height - this.gobangStyle.padding, this.gobangStyle.padding + i * this.lattice.height)
            this.cx.stroke()
        }
        // 刻画标记点
        this.cx.fillStyle = '#000'
            ;[{
                x: this.width / 2,
                y: this.height / 2
            }, {
                x: this.gobangStyle.padding + 4 * this.lattice.width,
                y: this.gobangStyle.padding + 4 * this.lattice.height
            }, {
                    x: this.gobangStyle.padding + (this.gobangStyle.count - 4) * this.lattice.width,
                    y: this.gobangStyle.padding + 4 * this.lattice.height
            }, {
                    x: this.gobangStyle.padding + 4 * this.lattice.width,
                    y: this.gobangStyle.padding + (this.gobangStyle.count - 4) * this.lattice.height
            }, {
                    x: this.gobangStyle.padding + (this.gobangStyle.count - 4) * this.lattice.width,
                    y: this.gobangStyle.padding + (this.gobangStyle.count - 4) * this.lattice.height
            }].forEach(sign => {
                this.cx.beginPath()
                this.cx.arc(sign.x, sign.y, this.lattice.width * 0.1, 0, 2 * Math.PI)
                this.cx.closePath()
                this.cx.fill()
            })
    }

    private captureEvents(canvasEl: HTMLCanvasElement) {
        // this will capture all mousedown events from the canvas element
        fromEvent(canvasEl, 'mousedown')
            .pipe(
                switchMap((e) => {
                    // after a mouse down, we'll record all mouse moves
                    return fromEvent(canvasEl, 'mousemove')
                        .pipe(
                            // we'll stop (and unsubscribe) once the user releases the mouse
                            // this will trigger a 'mouseup' event    
                            takeUntil(fromEvent(canvasEl, 'mouseup')),
                            // we'll also stop (and unsubscribe) once the mouse leaves the canvas (mouseleave event)
                            takeUntil(fromEvent(canvasEl, 'mouseleave')),
                            // pairwise lets us get the previous value to draw a line from
                            // the previous point to the current point    
                            pairwise()
                        )
                })
            )
            .subscribe((res: [MouseEvent, MouseEvent]) => {
                const rect = canvasEl.getBoundingClientRect();

                // previous and current position with the offset
                const prevPos = {
                    x: res[0].clientX - rect.left,
                    y: res[0].clientY - rect.top
                };

                const currentPos = {
                    x: res[1].clientX - rect.left,
                    y: res[1].clientY - rect.top
                };

                // this method we'll implement soon to do the actual drawing
                this.drawOnCanvas(prevPos, currentPos);
            });
    }

    private drawOnCanvas(prevPos: { x: number, y: number }, currentPos: { x: number, y: number }) {
        if (!this.cx) { return; }

        this.cx.beginPath();

        if (prevPos) {
            this.cx.moveTo(prevPos.x, prevPos.y); // from
            this.cx.lineTo(currentPos.x, currentPos.y);
            this.cx.stroke();
        }
    }

}
