(module
    (memory $mem 1)
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
)