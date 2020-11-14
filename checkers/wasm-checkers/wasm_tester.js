fetch('./checkers-test.wasm')
    .then(response => response.arrayBuffer())
    .then(bytes => WebAssembly.instantiate(bytes))
    .then(results => {
        console.log("Wasm module loaded");
        instance = results.instance;
        console.log('instance', instance);
        
        console.log("Calling offset");
        var pos = [3,4]
        var offset = instance.exports.byteOffsetForPosition(...pos);
        console.log("offset for position " + pos + " is " + offset);

        var white = 2;
        var black = 1;
        var crownedWhite = 6;
        var crownedBlack = 5;

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
    })