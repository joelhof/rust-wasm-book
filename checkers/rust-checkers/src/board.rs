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

#[derive(Debug, Copy, Clone, PartialEq)]
pub struct Coordinate(pub usize, pub usize);

impl Coordinate {
    pub fn onBoard(self) -> bool {
        let Coordinate(x,y) = self;
        return x <= 7 && y <= 7
    }

    pub fn jumpTargetsFrom(&self) -> impl Iterator<Item = Coordinate> {
        let mut jumps = Vec::new();
        let Coordinate(x, y) = *self;
        if y >= 2 {
            jumps.push(Coordinate(x + 2, y - 2));
        }
        jumps.push(Coordinate(x + 2, y + 2));
        if x >= 2 && y >= 2 {
            jumps.push(Coordinate(x - 2, y - 2));
        }
        if x >= 2 {
            jumps.push(Coordinate(x - 2, y + 2));
        }
        return jumps.into_iter()
    }

    pub fn moveTargetsFrom(&self) -> impl Iterator<Item = Coordinate> {
        let mut moves = Vec::new();
        let Coordinate(x, y) = *self;
        if x >= 1 {
            moves.push(Coordinate(x - 1, y + 1));
        }
        moves.push(Coordinate(x + 1, y + 1));
        if y >= 1 {
            moves.push(Coordinate(x + 1, y - 1));
        }
        if x >= 1 && y >= 1 {
            moves.push(Coordinate(x - 1, y - 1));
        }
        return moves.into_iter()
    }
}

#[derive(Debug, Copy, Clone, PartialEq)]
pub struct Move {
    pub from: Coordinate,
    pub to: Coordinate
}

impl Move {
    pub fn new(from: (usize, usize), to: (usize, usize)) -> Move {
        Move {
            from: Coordinate(from.0, from.1),
            to: Coordinate(to.0, to.1)
        }
    }
}