const rows: number[] = [0,1,2,3,4,5,6,7];
const cols: number[] = [0,1,2,3,4,5,6,7];

const BLACK = 1;
const WHITE = 2;
const CROWN = 4;

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

function pieceElement(pieceCore: number, x: number, y: number): Element {
    let div = document.createElement("div");
    div.classList.add("piece");
    div.classList.add(pieceCore === BLACK ? "black" : "white"); // TODO use bitwise logic
    
    if ((pieceCore & CROWN) == CROWN) {
        div.classList.add("crowned");
    }
    
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
    let result = move_piece(from[1], from[0], to[1], to[0]);
    if (result > 0) {
        movedPiece.id = event.target.id;
        event.target.appendChild(movedPiece);
        removeCapturedPieces();
        setTurnOwner();
    }
}

function pieceMoveDragOverHandler(event: PieceMoveEvent): void {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
}

fetch('./rust_checkers.wasm')
    .then(response => response.arrayBuffer())
    .then(bytes => WebAssembly.instantiate(bytes, {
        env: {
            notify_piececrowned: (x: number, y: number) => {
                console.log("A piece was crowned at ", [x, y]);
                //document.getElementById(`${x},${y}`).lastElementChild.classList.add("crowned");
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
        console.log("Starting player is:", get_current_turn()  === BLACK ? "BLACK" : "WHITE");

        const board = document.getElementById("board");
        rows.forEach(x => {
            cols.forEach(y => {
                const square = document.createElement(`div`);
                square.id = `${7 - x},${y}`;
                square.classList.add("box");
                square.classList.add(x % 2 == 0 ? "even" : "odd");
                square.addEventListener("drop", pieceMoveDropHandler, false);
                square.addEventListener("dragover", pieceMoveDragOverHandler, false);
                board.appendChild(square);
            })
        });
        renderPieces();
        setTurnOwner();
    })
    .catch(error => {
        console.log(error);
    });

function removeCapturedPieces() {
    rows.forEach(x => {
        cols.forEach(y => {
            const pieceCore = get_piece(y, x);
            const square = document.getElementById(`${x},${y}`);
            if (pieceCore <= 0 && square.hasChildNodes()) {
                console.log("piece captured! @", y, x);
                square.removeChild(square.lastElementChild);
            }
        });
    });
}

function renderPieces() {
    rows.forEach(x => {
        cols.forEach(y => {
            const square = document.getElementById(`${x},${y}`);
            const pieceCore = get_piece(y, x);
            if (pieceCore > 0 && !square.hasChildNodes()) {
                const piece: Element = pieceElement(pieceCore, x, y);
                square.appendChild(piece);
            } // TODO: remove captured
              // TODO: render crowned
        });
    });
}

function setTurnOwner() {
    const color = get_current_turn();
    const element = document.getElementById(`turnOwner`);
    if ((color & BLACK) === BLACK) {
        element.classList.remove("white");
        element.classList.add("black");
    } else {
        element.classList.remove("black");
        element.classList.add("white");
    }
}
