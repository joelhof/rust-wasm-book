const rows: number[] = [0,1,2,3,4,5,6,7];
const cols: number[] = [0,1,2,3,4,5,6,7];

const BLACK = 1;
const WHITE = 0;

interface PieceMoveEvent extends DragEvent {
    target: HTMLElement,
    srcElement: HTMLElement
}

let movedPiece: HTMLElement;

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
    console.log("Drop", event);
    event.preventDefault();
    const data = event.dataTransfer.getData("text/plain");
    event.target.appendChild(movedPiece);
}

function pieceMoveDragOverHandler(event: PieceMoveEvent): void {
    console.log("drag over", event);
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
        const get_current_turn = (wasmInstance.instance.exports.get_current_turn) as Function;
        const get_piece = (wasmInstance.instance.exports.get_piece) as Function;

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

