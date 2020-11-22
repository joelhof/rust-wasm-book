use super::board::{Coordinate, GamePiece, Move, PieceColor};

pub struct GameEngine {
    board: [[Option<GamePiece>; 8]; 8],
    turnOwner: PieceColor,
    moveCount: u32
}

pub struct MoveResult {
    pub mv: Move,
    pub crowned: bool
}

impl GameEngine {
    pub fn new() -> GameEngine {
        let mut engine = GameEngine {
            board: [[None; 8]; 8],
            turnOwner: PieceColor::Black,
            moveCount: 0
        };
        engine.initBoard();
        return engine;
    }

    pub fn initBoard(&mut self) {
        [1, 3, 5, 7, 0, 2, 4, 6, 1, 3, 5, 7]
            .iter()
            .zip([0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2].iter())
            .map(|(a, b)| (*a as usize, *b as usize))
            .for_each(|(x, y)| {
                self.board[x][y] = Some(GamePiece::new(PieceColor::White));
            });

            [0, 2, 4, 6, 1, 3, 5, 7, 0, 2, 4, 6]
            .iter()
            .zip([7, 7, 7, 7, 6, 6, 6, 6, 5, 5, 5, 5].iter())
            .map(|(a, b)| (*a as usize, *b as usize))
            .for_each(|(x, y)| {
                self.board[x][y] = Some(GamePiece::new(PieceColor::Black));
            });
    }

    pub fn movePiece(&mut self, mv: &Move) -> Result<MoveResult, ()> {
        let legalMoves = self.legalMoves();

        if !legalMoves.contains(mv) {
            return Err(());
        }

        let Coordinate(x1, y1) = mv.from;
        let Coordinate(x2, y2) = mv.to;

        let piece = self.board[x1][y1].unwrap();
        let midPieceCoordinate = self.midpieceCoordinate(x1, y1, x2, y2);
        if let Some(Coordinate(x, y)) = midPieceCoordinate {
            self.board[x][y] = None;
        }

        self.board[x1][y1] = None;
        self.board[x2][y2] = Some(piece);

        let crowned = if self.shouldCrown(piece, mv.to) {
            self.crownPieceAt(mv.to);
            true
        } else {
            false
        };

        self.advanceTurn();
        return Ok(MoveResult {
            mv: mv.clone(),
            crowned: crowned
        });
    }

    fn legalMoves(&self) -> Vec<Move> {
        let mut moves: Vec<Move> = Vec::new();
        for col in 0..self.board[0].len() {
            for row in 0..self.board[0].len() {
                if let Some(piece) = self.board[col][row] {
                    if piece.color == self.turnOwner {
                        let pos = Coordinate(col, row);
                        let mut validMoves = self.validMovesFrom(pos);
                        moves.append(&mut validMoves);
                    }
                }
            }
        }
        return moves;
    }

    fn validMovesFrom(&self, pos: Coordinate) -> Vec<Move> {
        let Coordinate(x, y) = pos;
        if let Some(piece) = self.board[x][y] {
            let mut jumps = pos.jumpTargetsFrom()
                .filter(|target| self.validJump(&piece, &pos, &target))
                .map(|ref target| Move {
                    from: pos.clone(),
                    to: target.clone()
                }).collect::<Vec<Move>>();
            let mut moves = pos.moveTargetsFrom()
                .filter(|target| self.validMove(&piece, &pos, &target))
                .map(|ref target| Move {
                    from: pos.clone(),
                    to: target.clone()
                }).collect::<Vec<Move>>();
            jumps.append(&mut moves);
            return jumps;
        } else {
            return Vec::new();
        }
    }

    fn validJump(&self, piece: &GamePiece, pos: &Coordinate, target: &Coordinate) -> bool {
        let Coordinate(x1, y1) = *pos;
        let Coordinate(x2, y2) = *target;
       
        // invalid if target is occupied
        if let Some(_) = self.board[x2][y2] {
            return false;
        } else {
            // Jump is valid if square diagonally before target is occupied by an opponent piece
            let midPieceCoordinate = self.midpieceCoordinate(x1, y1, x2, y2);
            return match midPieceCoordinate {
                None => false,
                Some(_) if piece.crowned => true,
                Some(_) if piece.color == PieceColor::Black => y2 < y1,
                Some(_) if piece.color == PieceColor::White => y2 > y1,
                Some(_) => false
            }
        }
    }

    fn validMove(&self, piece: &GamePiece, pos: &Coordinate, target: &Coordinate) -> bool {
        let Coordinate(_x1, y1) = *pos;
        let Coordinate(x2, y2) = *target;
        if let Some(_occupant) = self.board[x2][y2] {
            return false;
        } else {
            if piece.crowned {
                return true;
            } else {
                if piece.color == PieceColor::Black {
                    return y2 < y1;
                } else {
                    return y2 > y1;
                }
            }
        };
    }

    fn midpieceCoordinate(&self, x1: usize, y1: usize, x2: usize, y2: usize) -> Option<Coordinate> {
        let x3 = match x2.checked_sub(x1) {
            Some(_) => x2 + 1,
            None => x2 - 1,
        };
        let y3 = match y2.checked_sub(y1) {
            Some(_) => y2 + 1,
            None => y2 - 1,
        };
        let sourcePiece = self.board[x1][y1].unwrap();
        return match self.board[x3][y3] {
            None => None,
            Some(opponent) if opponent.color == sourcePiece.color => None,
            Some(opponent) if opponent.color != sourcePiece.color => Some(Coordinate(x3,y3)),
            Some(_) => None
        };
    }

    fn shouldCrown(&self, piece: GamePiece, destination: Coordinate) -> bool {
        return match piece.color {
            PieceColor::Black => destination.1 == 0,
            PieceColor::White => destination.1 == 7
        };
    }

    fn crownPieceAt(&mut self, pos: Coordinate) {
        let Coordinate(x, y) = pos;
        let piece = self.board[x][y].unwrap();
        let crowned = GamePiece::crown(piece);
        self.board[x][y] = Some(crowned);
    }

    fn advanceTurn(&mut self) {
        let nextTurnOwner = match self.turnOwner {
            PieceColor::Black => PieceColor::White,
            PieceColor::White => PieceColor::Black
        };
        self.turnOwner = nextTurnOwner;
        self.moveCount = self.moveCount + 1;
    }
}


#[cfg(test)]
mod test {
    use super::super::board::{Coordinate, GamePiece, Move, PieceColor};
    use super::GameEngine;

    #[test]
    fn should_crown() {
        let engine = GameEngine::new();
        let black = GamePiece::new(PieceColor::Black);
        let res = engine.shouldCrown(black, Coordinate(3, 0));
        assert!(res);
        let res_nocrown = engine.shouldCrown(black, Coordinate(5, 2));
        assert_eq!(res_nocrown, false);
    }

/*     #[test]
    fn mut_crown() {
        let mut engine = GameEngine::new();
        engine.initialize_pieces();
        let crowned = engine.crown_piece(Coordinate(1, 0));
        assert!(crowned);
        assert!(engine.is_crowned(Coordinate(1, 0)));
    }

    #[test]
    fn advance_turn() {
        let mut engine = GameEngine::new();
        engine.advance_turn();
        assert_eq!(engine.current_turn(), PieceColor::White);
        engine.advance_turn();
        assert_eq!(engine.current_turn(), PieceColor::Black);
        assert_eq!(engine.move_count(), 2);
    }

    #[test]
    fn move_targets() {
        let c1 = Coordinate(0, 5);
        let targets = c1.move_targets_from().collect::<Vec<Coordinate>>();
        assert_eq!(targets, [Coordinate(1, 6), Coordinate(1, 4)]);

        let c2 = Coordinate(1, 6);
        let targets2 = c2.move_targets_from().collect::<Vec<Coordinate>>();
        assert_eq!(
            targets2,
            [
                Coordinate(0, 7),
                Coordinate(2, 7),
                Coordinate(2, 5),
                Coordinate(0, 5)
            ]
        );

        let c3 = Coordinate(2, 5);
        let targets3 = c3.move_targets_from().collect::<Vec<Coordinate>>();
        assert_eq!(
            targets3,
            [
                Coordinate(1, 6),
                Coordinate(3, 6),
                Coordinate(3, 4),
                Coordinate(1, 4)
            ]
        );
    }

    #[test]
    fn valid_from() {
        let c1 = Coordinate(0, 5);
        let c2 = Coordinate(2, 5);

        let mut engine = GameEngine::new();
        engine.initialize_pieces();
        let m1 = engine.valid_moves_from(c1);
        let m2 = engine.valid_moves_from(c2);
        assert_eq!(
            m1,
            [Move {
                from: Coordinate(0, 5),
                to: Coordinate(1, 4),
            }]
        );
        assert_eq!(
            m2,
            [
                Move {
                    from: Coordinate(2, 5),
                    to: Coordinate(3, 4),
                },
                Move {
                    from: Coordinate(2, 5),
                    to: Coordinate(1, 4),
                }
            ]
        );
    }

    #[test]
    fn legal_moves_black() {
        let mut engine = GameEngine::new();
        engine.initialize_pieces();
        let moves = engine.legal_moves();
        assert_eq!(
            moves,
            [
                Move {
                    from: Coordinate(0, 5),
                    to: Coordinate(1, 4),
                },
                Move {
                    from: Coordinate(2, 5),
                    to: Coordinate(3, 4),
                },
                Move {
                    from: Coordinate(2, 5),
                    to: Coordinate(1, 4),
                },
                Move {
                    from: Coordinate(4, 5),
                    to: Coordinate(5, 4),
                },
                Move {
                    from: Coordinate(4, 5),
                    to: Coordinate(3, 4),
                },
                Move {
                    from: Coordinate(6, 5),
                    to: Coordinate(7, 4),
                },
                Move {
                    from: Coordinate(6, 5),
                    to: Coordinate(5, 4),
                }
            ]
        );
    }

    #[test]
    fn legal_moves_white() {
        let mut engine = GameEngine::new();
        engine.initialize_pieces();
        engine.advance_turn();
        let moves = engine.legal_moves();
        assert_eq!(
            moves,
            [
                Move {
                    from: Coordinate(1, 2),
                    to: Coordinate(0, 3),
                },
                Move {
                    from: Coordinate(1, 2),
                    to: Coordinate(2, 3),
                },
                Move {
                    from: Coordinate(3, 2),
                    to: Coordinate(2, 3),
                },
                Move {
                    from: Coordinate(3, 2),
                    to: Coordinate(4, 3),
                },
                Move {
                    from: Coordinate(5, 2),
                    to: Coordinate(4, 3),
                },
                Move {
                    from: Coordinate(5, 2),
                    to: Coordinate(6, 3),
                },
                Move {
                    from: Coordinate(7, 2),
                    to: Coordinate(6, 3),
                }
            ]
        );
    }

    #[test]
    fn jump_targets() {
        let c1 = Coordinate(3, 3);
        let targets = c1.jump_targets_from().collect::<Vec<Coordinate>>();
        assert_eq!(
            targets,
            [
                Coordinate(5, 1),
                Coordinate(5, 5),
                Coordinate(1, 1),
                Coordinate(1, 5)
            ]
        );
    }

    #[test]
    fn jump_moves_validation() {
        let mut engine = GameEngine::new();
        engine.initialize_pieces();
        engine.board[1][4] = Some(GamePiece::new(PieceColor::White)); // this should be jumpable from 0,5 to 2,3
        let moves = engine.legal_moves();
        assert_eq!(
            moves,
            [
                Move {
                    from: Coordinate(0, 5),
                    to: Coordinate(2, 3),
                },
                Move {
                    from: Coordinate(2, 5),
                    to: Coordinate(0, 3)
                },
                Move {
                    from: Coordinate(2, 5),
                    to: Coordinate(3, 4)
                },
                Move {
                    from: Coordinate(4, 5),
                    to: Coordinate(5, 4)
                },
                Move {
                    from: Coordinate(4, 5),
                    to: Coordinate(3, 4)
                },
                Move {
                    from: Coordinate(6, 5),
                    to: Coordinate(7, 4)
                },
                Move {
                    from: Coordinate(6, 5),
                    to: Coordinate(5, 4)
                }
            ]
        );
    }

    #[test]
    fn test_basic_move() {
        let mut engine = GameEngine::new();
        engine.initialize_pieces();
        let res = engine.move_piece(&Move::new((0, 5), (1, 4)));
        assert!(res.is_ok());

        let old = engine.board[0][5];
        let new = engine.board[1][4];
        assert_eq!(old, None);
        assert_eq!(
            new,
            Some(GamePiece {
                color: PieceColor::Black,
                crowned: false
            })
        );

        // fail to perform illegal move
        let res = engine.move_piece(&Move::new((1, 4), (2, 4))); // can't move horiz
        assert!(!res.is_ok());
        assert_eq!(engine.board[2][4], None);
    }
 */
}