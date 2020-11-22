fetch('./rust_checkers.wasm')
    .then(response => response.arrayBuffer())
    .then(bytes => WebAssembly.instantiate(bytes, {
        env: {
            notify_piececrowned: 
                (x, y) => {
                    console.log("A piece was crowned at ", [x, y]);
                },
            notify_piecemoved: 
                (fromX, fromY, toX, toY) => {
                    console.log("A piece moved from ", [fromX,fromY], "to", [toX,toY]);
                }
        }
    })).then(results => {
        var white = 2;
        var black = 1;
        var crownedWhite = 6;
        var crownedBlack = 5;

        var instance = results.instance;

        console.log("At start current turn is", instance.exports.get_current_turn());
        console.log("init game boards");

        whiteMoves = [[0,2,1,3],[0,0,0,1],[1,1,1,0],[1,0,1,1]];
        blackMoves = [[0,5,0,4],[0,4,0,3],[0,3,0,2],[0,2,0,0]];
        for (i = 0; i < blackMoves.length; i++) {
            console.log("current player is", instance.exports.get_current_turn());
            console.log(...blackMoves[i], instance.exports.move_piece(...blackMoves[i]));
            console.log("piece at ", blackMoves[i].slice(2), instance.exports.get_piece(...blackMoves[i].slice(2)));
            console.log("current player is", instance.exports.get_current_turn());
        console.log(...whiteMoves[i], instance.exports.move_piece(...whiteMoves[i]));
            printBoard(instance);
        }
       
        console.log("turn owner is black", instance.exports.get_current_turn() == black);
    }).catch(console.error);

function printBoard(instance) {
    var x = [0, 1, 2, 3, 4, 5, 6, 7];
    var y = [0, 1, 2, 3, 4, 5, 6, 7];
    var board = [];
    x.map(i => {
        var row = y.map(j => instance.exports.get_piece(j, i))
            .reduce((pV, cV) => [...pV, cV], []);
        board.push(row);
    });
    console.table(board);
    return board;
}