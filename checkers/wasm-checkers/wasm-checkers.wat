(module
    (memory $mem 1)
    (global $BLACK i32 (i32.const 1))
    (global $WHITE i32 (i32.const 2))
    (global $DE_CROWN i32 (i32.const 3))
    (global $CROWN i32 (i32.const 4))
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
    ;; Piece functions
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
    ;;--------------Board movement-----------------
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
    (export "byteOffsetForPosition" (func $byteOffsetForPosition))
    (export "isCrowned" (func $isCrowned))
    (export "isWhite" (func $isWhite))
    (export "isBlack" (func $isBlack))
    (export "addCrown" (func $addCrown))
    (export "removeCrown" (func $removeCrown))
    (export "setPiece" (func $setPiece))
    (export "getPiece" (func $getPiece))
)