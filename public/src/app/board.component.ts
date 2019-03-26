import {
    Component, Input, ElementRef, AfterViewInit, ViewChild
} from '@angular/core';
import { fromEvent } from 'rxjs';
import { switchMap, takeUntil, pairwise } from 'rxjs/operators'

@Component({
    selector: 'app-board',
    template: '<canvas #board></canvas>',
    styles: ['canvas { border: 1px solid #000;background-color:#d4b00fbd; }']
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
    };

    checkerboard:any=[];
    history:any = [];
    role:number = 2;
    currentStep:number = 0 ;
    win = false;


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

        // this.drawChessboard();
        this.drawChessboard()
        this.listenDownChessman()
        this.initChessboardMatrix()

        // this.captureEvents(canvasEl);
    }

    // recovery the chessboard to the matrix.
    initChessboardMatrix() {
        const checkerboard = []
        for (let x = 0; x < this.gobangStyle.count + 1; x++) {
            checkerboard[x] = []
            for (let y = 0; y < this.gobangStyle.count + 1; y++) {
                checkerboard[x][y] = 0
            }
        }
        this.checkerboard = checkerboard;
    }

    drawChessboard() {
      
        // Draw the checkerboard grid
        for (let i = 0; i <=this.gobangStyle.count; i++) {
            this.cx.moveTo(this.gobangStyle.padding + i * this.lattice.width, this.gobangStyle.padding)
            this.cx.lineTo(this.gobangStyle.padding + i * this.lattice.width, this.width - this.gobangStyle.padding)
            this.cx.stroke()
            this.cx.moveTo(this.gobangStyle.padding, this.gobangStyle.padding + i * this.lattice.height)
            this.cx.lineTo(this.height - this.gobangStyle.padding, this.gobangStyle.padding + i * this.lattice.height)
            this.cx.stroke()
        }
        // Draw the checkerboard markers
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

    listenDownChessman(isBlack = false) {
        this.canvas.nativeElement.onclick = event => {
            let { offsetX: x, offsetY: y } = event
            x = Math.floor((x - this.gobangStyle.padding / 2) / this.lattice.width)
            y = Math.floor((y - this.gobangStyle.padding / 2) / this.lattice.height)
          this.canvas.nativeElement  // only empty position could put the stone on 
            const effectiveBoard = !!this.checkerboard[x]
            if (effectiveBoard &&
                this.checkerboard[x][y] !== undefined &&
                Object.is(this.checkerboard[x][y], 0)) {
                // after put a stone. need to change role .record the posion
                this.checkerboard[x][y] = this.role
                this.drawChessman(x, y, Object.is(this.role, 1))
                // 落子完毕后，有可能是悔棋之后落子的，这种情况下就该重置历史记录
                this.history.length = this.currentStep
                this.history.push({
                    x, y,
                    role: this.role,
                    snap: this.cx.getImageData(0, 0, this.width, this.height)
                })
                // save current envoriment
                this.currentStep++
                this.role = Object.is(this.role, 1) ? 2 : 1
            }
        }
    }

    // draw a stone
    drawChessman(x, y, isBlack) {
        // const { gobangStyle, context, lattice, gobang } = this
        this.cx.fillStyle = isBlack ? '#000' : '#fff'
        this.cx.beginPath()
        this.cx.arc(
            this.gobangStyle.padding + x * this.lattice.width,
            this.gobangStyle.padding + y * this.lattice.height,
            this.lattice.width * 0.4, 0, 2 * Math.PI
        )
        this.cx.closePath()
        this.cx.fill()
        // when drawed a stone . check referee
        setTimeout(() => {
            this.checkReferee(x, y, isBlack ? 1 : 2)
        }, 0)
    }

    //check Referee
    checkReferee(x, y, role) {
        if ((x == undefined) || (y == undefined) || (role == undefined)) return
        // extention .record continous won times
        let countContinuous = 0
        // checkboard 
        const XContinuous = this.checkerboard.map(x => x[y])
        const YContinuous = this.checkerboard[x]
        const S1Continuous = []
        const S2Continuous = []
        this.checkerboard.forEach((_y, i) => {

            // Left slash
            const S1Item = _y[y - (x - i)]
            if (S1Item !== undefined) {
                S1Continuous.push(S1Item)
            }
            // Right slash
            const S2Item = _y[y + (x - i)]
            if (S2Item !== undefined) {
                S2Continuous.push(S2Item)
            }
        });
            // The X-axis/Y-axis/cross diagonal axis where the current chess point is located, as long as there are 5 children that can be connected, there will be a winner
            [XContinuous, YContinuous, S1Continuous, S2Continuous].forEach(axis => {
                if (axis.some((x, i) => axis[i] !== 0 &&
                    axis[i - 2] === axis[i - 1] &&
                    axis[i - 1] === axis[i] &&
                    axis[i] === axis[i + 1] &&
                    axis[i + 1] === axis[i + 2])) {
                    countContinuous++
                }
            })
        // while any side won, call listen event
        if (countContinuous) {
            this.canvas.nativeElement.onclick = null
            this.win = true
            // alert((role == 1 ? 'Black ' : 'White ') + 'side won' + countContinuous + 'times!')
            alert((role == 1 ? 'Black ' : 'White ') + 'Won')
        }
    }

    // regret
    regretChess() {
        // find the latest record
        if (this.history.length && !this.win) {
            const prev = this.history[this.currentStep - 2]
            const _prev = this.history[this.currentStep - 1]
            // Roll back the UI and update the matrix
            if (prev && prev.snap) {
                this.cx.putImageData(prev.snap, 0, 0)
                this.checkerboard[_prev.x][_prev.y] = 0
                this.currentStep--
            }
        }
    }
    // revoke regret
    revokedRegretChess() {
        const next = this.history[this.currentStep]
        if (next && next.snap) {
            this.cx.putImageData(next.snap, 0, 0)
            this.checkerboard[next.x][next.y] = next.role
            this.currentStep++
        }
    }
}

    // private captureEvents(canvasEl: HTMLCanvasElement) {
    //     // this will capture all mousedown events from the canvas element
    //     fromEvent(canvasEl, 'mousedown')
    //         .pipe(
    //             switchMap((e) => {
    //                 // after a mouse down, we'll record all mouse moves
    //                 return fromEvent(canvasEl, 'mousemove')
    //                     .pipe(
    //                         // we'll stop (and unsubscribe) once the user releases the mouse
    //                         // this will trigger a 'mouseup' event    
    //                         takeUntil(fromEvent(canvasEl, 'mouseup')),
    //                         // we'll also stop (and unsubscribe) once the mouse leaves the canvas (mouseleave event)
    //                         takeUntil(fromEvent(canvasEl, 'mouseleave')),
    //                         // pairwise lets us get the previous value to draw a line from
    //                         // the previous point to the current point    
    //                         pairwise()
    //                     )
    //             })
    //         )
    //         .subscribe((res: [MouseEvent, MouseEvent]) => {
    //             const rect = canvasEl.getBoundingClientRect();

    //             // previous and current position with the offset
    //             const prevPos = {
    //                 x: res[0].clientX - rect.left,
    //                 y: res[0].clientY - rect.top
    //             };

    //             const currentPos = {
    //                 x: res[1].clientX - rect.left,
    //                 y: res[1].clientY - rect.top
    //             };

    //             // this method we'll implement soon to do the actual drawing
    //             this.drawOnCanvas(prevPos, currentPos);
    //         });
    // }

//     private drawOnCanvas(prevPos: { x: number, y: number }, currentPos: { x: number, y: number }) {
//         if (!this.cx) { return; }

//         this.cx.beginPath();

//         if (prevPos) {
//             this.cx.moveTo(prevPos.x, prevPos.y); // from
//             this.cx.lineTo(currentPos.x, currentPos.y);
//             this.cx.stroke();
//         }
//     }

// }
