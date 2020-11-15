(module
    (import "events" "pieceCrowned" 
        (func $notify_piececrowned (param $x i32) (param $y i32))
    )
    (import "events" "pieceMoved" 
        (func $notify_piecemoved (param $fromX i32) (param $fromY i32)
            (param $toX i32) (param $toY i32))
    )
    (memory $mem 1)

    (global $currentTurn (mut i32) (i32.const 0))
    (global $BLACK i32 (i32.const 1))
    (global $WHITE i32 (i32.const 2))
    (global $DE_CROWN i32 (i32.const 3))
    (global $CROWN i32 (i32.const 4))
    ;;-------------- Linear Memory mapping functions ------------------
    (func $indexForPosition (param $x i32) (param $y i32) (result i32)
        (i32.add
            (i32.mul 
                (i32.const 8)
                (get_local $y) 
            )
            (get_local $x)
        )
    )
    (func $byteOffsetForPosition (param $x i32) (param $y i32) (result i32)
        (i32.mul
            (call $indexForPosition (get_local $x) (get_local $y))
            (i32.const 4)
        )
    )
    ;; ------------- Piece functions ----------------------
    ;; Bitmask mapping:
    ;;  0   Unoccupied square
    ;;  1   Black
    ;;  2   White
    ;;  4   Crowned
    (func $isCrowned (param $piece i32) (result i32)
        (i32.eq
            (i32.and (get_local $piece) (get_global $CROWN))
            (get_global $CROWN)
        )
    )
    (func $isWhite (param $piece i32) (result i32)
        (i32.eq
            (i32.and (get_local $piece) (get_global $WHITE))
            (get_global $WHITE)
        )
    )
     (func $isBlack (param $piece i32) (result i32)
        (i32.eq
            (i32.and (get_local $piece) (get_global $BLACK))
            (get_global $BLACK)
        )
    )
    (func $addCrown (param $piece i32) (result i32)
        (i32.or (get_local $piece) (get_global $CROWN))
    )
    (func $removeCrown (param $piece i32) (result i32)
        (i32.and (get_local $piece) (get_global $DE_CROWN))
    )
    ;;---------------------- Board movement ----------------------------------
    ;; Set a piece on the Board. Obs, not result type, a "void" method
    (func $setPiece (param $x i32) (param $y i32) (param $piece i32)
        (i32.store
            (call $byteOffsetForPosition
                (get_local $x)
                (get_local $y)
            )
            (get_local $piece)
        )
    )
    ;; Get a piece from the board. Out of range causes a trap
    (func $getPiece (param $x i32) (param $y i32) (result i32)
        (if (result i32)
            (block (result i32) 
                (i32.and 
                    (call $inRange (i32.const 0) (i32.const 7) (get_local $x))
                    (call $inRange (i32.const 0) (i32.const 7) (get_local $y))
                )
            )
            (then
                (i32.load 
                    (call $byteOffsetForPosition (get_local $x) (get_local $y))
                )   
            )
            (else
                (unreachable)
            )
        )
    )
    ;; Detect if values are within specified range, inclusive high and low.
    (func $inRange (param $low i32) (param $high i32) (param $value i32) (result i32)
        (i32.and 
            (i32.ge_s (get_local $value) (get_local $low))
            (i32.le_s (get_local $value) (get_local $high))
        )
    )
    ;;------------------ Game state -----------------------------------------------
    ;;get current turn owner
    (func $getTurnOwner (result i32)
        (get_global $currentTurn)
    )
    ;; Check if it's players turn
    (func $isPlayersTurn (param $player i32) (result i32)
        (i32.gt_s
            (i32.and (get_local $player) (get_global $currentTurn))
            (i32.const 0)
        )
    )
    ;; At the end of a turn, switch the turn owner
    (func $toggleTurnOwner
        (if (i32.eq (call $getTurnOwner) (i32.const 1))
            (then (call $setTurnOwner (i32.const 2)))
            (else (call $setTurnOwner (i32.const 1)))
        )
    )
    ;; Sets the turn owner
    (func $setTurnOwner (param $player i32)
        (set_global $currentTurn (get_local $player))
    )
    ;;----------------- Game Rules --------------------------------------
    ;; Should this piece be crowned?
    ;; We crown black pieces in row 0 and white pieces in row 7
    (func $shouldCrown (param $pieceRow i32) (param $piece i32) (result i32)
        (i32.or
            (i32.and
                (i32.eq
                    (get_local $pieceRow)
                    (i32.const 0)
                )
                (call $isBlack (get_local $piece))
            )
            (i32.and
                (i32.eq
                    (get_local $pieceRow)
                    (i32.const 7)
                )
                (call $isWhite (get_local $piece))
            )
        )
    )
    ;; Convert a piece into a crowned piece and notify wasm host
    (func $crownPiece (param $x i32) (param $y i32)
        (local $piece i32)
        (set_local $piece (call $getPiece (get_local $x) (get_local $y)))
        (call $setPiece (get_local $x) (get_local $y)
            (call $addCrown (get_local $piece))
        )
        (call $notify_piececrowned (get_local $x) (get_local $y))
    )
    (func $distance (param $x i32) (param $y i32) (result i32)
        (i32.sub (get_local $x) (get_local $y))
    )

    ;;----------------- Piece Movement ----------------------------------
    ;; Determine if move is valid. A move is valid if target is unoccupied,
    ;; it's the piece's owners turn and the distance is valid.
    (func $isValidMove (param $fromX i32) (param $fromY i32) (param $toX i32) (param $toY i32)
        (result i32)
        (local $player i32)
        (local $target i32)

        (set_local $player (call $getPiece (get_local $fromX) (get_local $fromY)))
        (set_local $target (call $getPiece (get_local $toX) (get_local $toY)))
        (if (result i32)
            (block (result i32)
                (i32.and
                    (call $validJumpDistance (get_local $fromY) (get_local $toY))
                    (i32.and
                        (call $isPlayersTurn (get_local $player))
                        ;; target is unoccupied
                        (i32.eq (get_local $target) (i32.const 0))
                    )
                )
            )
            (then (i32.const 1))
            (else (i32.const 0))
        )
    )
    ;; Check if a move is valid, only moves less than 2 are valid.
    (func $validJumpDistance (param $from i32) (param $to i32) (result i32)
        (local $d i32)
        (set_local $d 
            (if (result i32)
            (i32.gt_s (get_local $to) (get_local $from))
            (then 
                (call $distance (get_local $to) (get_local $from))
            )
            (else 
                (call $distance (get_local $from) (get_local $to))
            ))
        )
        (i32.le_u
            (get_local $d)
            (i32.const 2)
        )
    )
    ;; Exposed 'Move'-function.
    ;; Move a piece from one square to another.
    ;; Validates that move is legal. Delegates move implementation
    (func $move (param $fromX i32) (param $fromY i32)
            (param $toX i32) (param $toY i32) (result i32)
        (if (result i32) 
            (call $isValidMove (get_local $fromX) (get_local $fromY)
                    (get_local $toX) (get_local $toY))
            (then
                (call $executeMove (get_local $fromX) (get_local $fromY)
                    (get_local $toX) (get_local $toY))
            )
            (else
                (i32.const 0)
            )
        )
    )
    ;; Executes a valid move.
    ;; TODO: Remove opponent piece during move. Check victory condition
    (func $executeMove (param $fromX i32) (param $fromY i32)
            (param $toX i32) (param $toY i32) (result i32)
        (local $currentPiece i32)
        (set_local $currentPiece (call $getPiece (get_local $fromX) (get_local $fromY)))
        ;; set piece at destination
        (call $setPiece (get_local $toX) (get_local $toY) (get_local $currentPiece))
        ;; remove piece from origin
        (call $setPiece (get_local $fromX) (get_local $fromY) (i32.const 0))
        ;; toggle turn owner
        (call $toggleTurnOwner)
        ;; If target is in kings row, crown piece
        (if (call $shouldCrown (get_local $toY) (get_local $currentPiece))
            (then (call $crownPiece (get_local $toX) (get_local $toY)) 
            )
        )
        ;; Notify host piece has moved
        (call $notify_piecemoved (get_local $fromX) (get_local $fromY)
            (get_local $toX) (get_local $toY))
        (i32.const 1)
    )
    ;; --------------------- Init Game Board -----------------------------
    ;; Set 12 Black pieces, 12 White pieces and set turn owner to Black
    ;; OBS! This does NOT reset the board!
    (func $initBoard
        (call $setPiece (i32.const 0) (i32.const 0) (get_global $WHITE))
        (call $setPiece (i32.const 2) (i32.const 0) (get_global $WHITE))
        (call $setPiece (i32.const 4) (i32.const 0) (get_global $WHITE))
        (call $setPiece (i32.const 6) (i32.const 0) (get_global $WHITE))
        (call $setPiece (i32.const 1) (i32.const 1) (get_global $WHITE))
        (call $setPiece (i32.const 3) (i32.const 1) (get_global $WHITE))
        (call $setPiece (i32.const 5) (i32.const 1) (get_global $WHITE))
        (call $setPiece (i32.const 7) (i32.const 1) (get_global $WHITE))
        (call $setPiece (i32.const 0) (i32.const 2) (get_global $WHITE))
        (call $setPiece (i32.const 2) (i32.const 2) (get_global $WHITE))
        (call $setPiece (i32.const 4) (i32.const 2) (get_global $WHITE))
        (call $setPiece (i32.const 6) (i32.const 2) (get_global $WHITE))

        (call $setPiece (i32.const 0) (i32.const 7) (get_global $BLACK))
        (call $setPiece (i32.const 2) (i32.const 7) (get_global $BLACK))
        (call $setPiece (i32.const 4) (i32.const 7) (get_global $BLACK))
        (call $setPiece (i32.const 6) (i32.const 7) (get_global $BLACK))
        (call $setPiece (i32.const 1) (i32.const 6) (get_global $BLACK))
        (call $setPiece (i32.const 3) (i32.const 6) (get_global $BLACK))
        (call $setPiece (i32.const 5) (i32.const 6) (get_global $BLACK))
        (call $setPiece (i32.const 7) (i32.const 6) (get_global $BLACK))
        (call $setPiece (i32.const 0) (i32.const 5) (get_global $BLACK))
        (call $setPiece (i32.const 2) (i32.const 5) (get_global $BLACK))
        (call $setPiece (i32.const 4) (i32.const 5) (get_global $BLACK))
        (call $setPiece (i32.const 6) (i32.const 5) (get_global $BLACK))

        (call $setTurnOwner (get_global $BLACK))
    )
    (export "byteOffsetForPosition" (func $byteOffsetForPosition))
    (export "isCrowned" (func $isCrowned))
    (export "isWhite" (func $isWhite))
    (export "isBlack" (func $isBlack))
    (export "addCrown" (func $addCrown))
    (export "removeCrown" (func $removeCrown))
    (export "setPiece" (func $setPiece))
    (export "getPiece" (func $getPiece))
    (export "getTurnOwner" (func $getTurnOwner))
    (export "isPlayersTurn" (func $isPlayersTurn))
    (export "toggleTurnOwner" (func $toggleTurnOwner))
    (export "setTurnOwner" (func $setTurnOwner))
    (export "shouldCrown" (func $shouldCrown))
    (export "crownPiece" (func $crownPiece))
    (export "move" (func $move))
    (export "initBoard" (func $initBoard))
)