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

#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }
}

mod board;
mod game;