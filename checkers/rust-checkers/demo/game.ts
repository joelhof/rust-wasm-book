const rows: number[] = [0,1,2,3,4,5,6,7];
const cols: number[] = [0,1,2,3,4,5,6,7];

const BLACK = 1;
const WHITE = 0;

interface PieceMoveEvent extends DragEvent {
    target: HTMLElement,
    srcElement: HTMLElement
}

type GetCurrentTurn = () => number;
type GetPiece = (x: number, y: number) => number;
type MovePiece = (fromX: number, fromY: number, toX: number, toY: number) => number;

let movedPiece: HTMLElement;

let get_current_turn: GetCurrentTurn;
let get_piece: GetPiece;
let move_piece: MovePiece;

function pieceElement(color: number, x: number, y: number): Element {
    let div = document.createElement("div");
    div.classList.add("piece");
    div.classList.add(color === BLACK ? "black" : "white");
    div.setAttribute("id", `${x},${y}`);
    div.setAttribute("draggable", "true");
    div.addEventListener("dragstart", pieceMoveStartHandler);
    div.addEventListener("dragend", pieceMoveDragEndHandler);
    return div;
}

function pieceMoveStartHandler(event: PieceMoveEvent): void {
    console.debug("Dragstart", event.srcElement);
    event.dataTransfer.dropEffect = "move";
    event.dataTransfer.setData("text/html", event.srcElement.toString());
    movedPiece = event.srcElement;
}

function pieceMoveDragEndHandler(event: PieceMoveEvent): void {
    console.debug("drag ended");
    movedPiece = null;
}

function pieceMoveDropHandler(event: PieceMoveEvent): void {
    console.log("drop", event);
    event.preventDefault();
    let from: number[] = movedPiece.id.split(",").map(coord => parseInt(coord));
    let to: number[] = event.target.id.split(",").map(coord => parseInt(coord));
    let result = move_piece(from[0], from[1], to[0], to[1]);
    if (result > 0) {
        event.target.appendChild(movedPiece);
    }
    console.log("piece at target",get_piece(to[0], to[1]), "piece at source", get_piece(from[0], from[1]),
         "next move by", get_current_turn()  === BLACK ? "BLACK" : "WHITE");
}

function pieceMoveDragOverHandler(event: PieceMoveEvent): void {
    //console.log("drag over", event);
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
}

fetch('./rust_checkers.wasm')
    .then(response => response.arrayBuffer())
    .then(bytes => WebAssembly.instantiate(bytes, {
        env: {
            notify_piececrowned: (x: number, y: number) => {
                console.log("A piece was crowned at ", [x, y]);
            },
            notify_piecemoved: (fromX: number, fromY: number, toX: number, toY: number) => {
                console.log("A piece moved from ", [fromX,fromY], "to", [toX,toY]);
            }
        }
    }))
    .then(wasmInstance => {
        get_current_turn = (wasmInstance.instance.exports.get_current_turn) as GetCurrentTurn;
        get_piece = (wasmInstance.instance.exports.get_piece) as GetPiece;
        move_piece = (wasmInstance.instance.exports.move_piece) as MovePiece;

        console.log("imported wasm");
        console.log("current turn is:", get_current_turn()  === BLACK ? "BLACK" : "WHITE");
        rows.forEach(x => {
            cols.forEach(y => {
                const square = document.getElementById(`${x},${y}`);
                document.addEventListener("drop", pieceMoveDropHandler, false);
                document.addEventListener("dragover", pieceMoveDragOverHandler, false);
                const pieceCore = get_piece(y, x);
                if (pieceCore > 0) {
                    const piece: Element = pieceElement(pieceCore, x, y);
                    square.appendChild(piece);
                }
            })
        });

    })
    .catch(error => {
        console.log(error);
    });

