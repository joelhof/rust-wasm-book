#![allow(non_snake_case)]
#[macro_use]
extern crate lazy_static;
extern crate mut_static;
use board::{Coordinate, GamePiece, Move, PieceColor};
use game::GameEngine;
use mut_static::MutStatic;

lazy_static! {
    pub static ref GAME_ENGINE: MutStatic<GameEngine> = {
        MutStatic::from(GameEngine::new())
    };
}

#[no_mangle]
pub extern "C" fn get_piece(x: i32, y: i32) -> i32 {
    let engine = GAME_ENGINE.read().unwrap();

    let piece = engine.getPiece(Coordinate(x as usize, y as usize));
    return match piece {
        Ok(Some(p)) => p.into(),
        Ok(None) => -1,
        Err(_) => -1
    };
}

#[no_mangle]
pub extern "C" fn get_current_turn() -> i32 {
    let engine = GAME_ENGINE.read().unwrap();

    return GamePiece::new(engine.currentTurn()).into();
}

const PIECEFLAG_BLACK: u8 = 1;
const PIECEFLAG_WHITE: u8 = 2;
const PIECEFLAG_CROWN: u8 = 4;

impl Into<i32> for GamePiece {
    
fn into(self) -> i32 { 
    let mut val: u8 = 0;
    if self.color == PieceColor::Black {
        val += PIECEFLAG_BLACK;
    } else if self.color == PieceColor::White {
        val += PIECEFLAG_WHITE;
    }
    if self.crowned {
        val += PIECEFLAG_CROWN;
    }

    return val as i32;
 }
}
#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }
}

mod board;
mod game;