fetch('./checkers-test.wasm')
    .then(response => response.arrayBuffer())
    .then(bytes => WebAssembly.instantiate(bytes, {
        events: {
            pieceCrowned: 
                (x, y) => {
                    console.log("A piece was crowned at ", [x, y]);
                },
            pieceMoved: 
                (fromX, fromY, toX, toY) => {
                    console.log("A piece moved from ", [fromX,fromY], "to", [toX,toY]);
                }
        }
    }))
    .then(results => {
        console.log("Wasm module loaded");
        instance = results.instance;
        console.log('instance', instance);
        
/*         console.log("Calling offset");
        var pos = [3,4]
        var offset = instance.exports.byteOffsetForPosition(...pos);
        console.log("offset for position " + pos + " is " + offset);
 */
        var white = 2;
        var black = 1;
        var crownedWhite = 6;
        var crownedBlack = 5;

/*
        console.debug("White is white?", instance.exports.isWhite(white));
        console.debug("Black is black?", instance.exports.isBlack(black));
        console.debug("Black is white?", instance.exports.isWhite(black));
        console.debug("Crowned white keeps color", instance.exports.isWhite(crownedWhite));
        console.debug("White crowned is crowned?", instance.exports.isCrowned(crownedWhite));
        console.debug("Black crowned is crowned?", instance.exports.isCrowned(crownedBlack));
        console.debug("De-crowned white is still white", instance.exports.isWhite(
            instance.exports.removeCrown(crownedWhite)));
        console.debug("De-crowned black is still black", instance.exports.isBlack(
                instance.exports.removeCrown(crownedBlack)));
        console.debug("White can be crowned", instance.exports.isCrowned(instance.exports.addCrown(white)));        
        console.debug("Black can be crowned", instance.exports.isCrowned(instance.exports.addCrown(black)));

        console.debug("given a piece at 3,4: ", instance.exports.setPiece(3, 4, white));
        console.debug("then piece " + white + " is at 3,4: ", instance.exports.getPiece(3,4));
        console.debug("white piece is not at 4,3", instance.exports.getPiece(4,3));
        try {
            instance.exports.getPiece(0, 8);
            console.log("This should not happen");            
        } catch (error) {
            console.log("Requesting a piece outside the board is an error");
        }
        try {
            instance.exports.getPiece(-1, 4);
            console.log("This should not happen");            
        } catch (error) {
            console.log("Requesting a piece outside the board is an error");
        }

        console.log("The initial turn owner is 0: ", instance.exports.getTurnOwner());
        instance.exports.setTurnOwner(black);
        console.log("The first turn is black ", instance.exports.isPlayersTurn(black));
        console.log("given that the current owner is black", instance.exports.getTurnOwner() == black);
        console.log("when turn is over ", instance.exports.toggleTurnOwner());
        console.log("then white is the turn owner ",
            instance.exports.isPlayersTurn(white) && instance.exports.getTurnOwner() == white);
        
        console.log("white is crowned in row 7", instance.exports.shouldCrown(7, white) 
            + " but not 6 " + instance.exports.shouldCrown(6, white));
        
        console.log("given a white piece at row 7");
        instance.exports.setPiece(1, 7, white);
        console.log("when white piece is crowned, webassembly host is notified");
        instance.exports.crownPiece(1, 7);
*/
        console.log("init game boards");
        instance.exports.initBoard();
        console.log("intial player is black", instance.exports.isPlayersTurn(black) == 1);
        printBoard(instance);

        whiteMoves = [[0,2,1,3],[0,0,0,1],[1,1,1,0],[1,0,1,1]];
        blackMoves = [[0,5,0,4],[0,4,0,3],[0,3,0,2],[0,2,0,0]];
        for (i = 0; i < blackMoves.length; i++) {
            console.log("current player is", instance.exports.getTurnOwner());
            console.log(...blackMoves[i], instance.exports.move(...blackMoves[i]));
            console.log("piece at ", blackMoves[i].slice(2), instance.exports.getPiece(...blackMoves[i].slice(2)));
            console.log("current player is", instance.exports.getTurnOwner());
            console.log(...whiteMoves[i], instance.exports.move(...whiteMoves[i]));
            printBoard(instance);
        }
       
        console.log("turn owner is black", instance.exports.getTurnOwner() == black);
    }).catch(console.error);

function printBoard(instance) {
    var x = [0, 1, 2, 3, 4, 5, 6, 7];
    var y = [0, 1, 2, 3, 4, 5, 6, 7];
    var board = [];
    x.map(i => {
        var row = y.map(j => instance.exports.getPiece(j, i)
        ).reduce((pV, cV) => [...pV, cV], []);
        board.push(row);
    });
    console.table(board);
    return board;
}
