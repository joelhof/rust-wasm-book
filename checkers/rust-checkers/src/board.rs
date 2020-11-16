#[derive(Debug, Copy, Clone, PartialEq)]
pub enum PieceColor {
    White,
    Black
}

#[derive(Debug, Copy, Clone, PartialEq)]
pub struct GamePiece {
    pub color: PieceColor,
    pub crowned: bool
}

impl GamePiece {
    pub fn new(color: PieceColor) -> GamePiece {
        GamePiece {
            color,
            crowned: false
        }
    }

    pub fn crown(piece: GamePiece) -> GamePiece {
        GamePiece {
            color: piece.color,
            crowned: true
        }
    }
}