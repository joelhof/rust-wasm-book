const rows: number[] = [0,1,2,3,4,5,6,7];
const cols: number[] = [0,1,2,3,4,5,6,7];

const BLACK = 1;
const WHITE = 0;

function pieceElement(color: number): Node {
    let div = document.createElement("div");
    div.classList.add("piece");
    div.classList.add(color === BLACK ? "black" : "white");
    return div;
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
                const piece = get_piece(y, x);
                if (piece > 0) {
                    const square = document.getElementById(`${x},${y}`);
                    square.appendChild(pieceElement(piece));
                }
                
                //
                // Add the ondragstart event listener
                //element.addEventListener("dragstart", dragstart_handler);
            })
        });

    })
    .catch(error => {
        console.log(error);
    });

