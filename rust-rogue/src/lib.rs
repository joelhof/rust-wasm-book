#![allow(non_snake_case)]
#[macro_use]
extern crate serde_derive;

extern crate wasm_bindgen;
use std::collections::HashMap;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
    
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);

    #[wasm_bindgen(module = "./index.js")]
    fn starts_update(stats: JsValue);

    pub type Display;

    #[wasm_bindgen(method, structural, js_namespace = ROT)]
    fn draw(this: &Display, x: i32, y: i32, ch: &str);

    #[wasm_bindgen(method, structural, js_name = draw, js_namespace = ROT)]
    fn draw_color(this: &Display, x: i32, y: i32, ch: &str, color: &str);

}

#[derive(Debug, Copy, Clone, PartialEq, Eq, Hash)]
struct GridPoint {
    x: i32,
    y: i32
}

#[wasm_bindgen]
pub struct Engine {
    display: Display,
    points: HashMap<GridPoint, String>,
    prizeLocation: Option<GridPoint>
}

#[wasm_bindgen]
impl Engine {
    #[wasm_bindgen(constructor)]
    pub fn new(display: Display) -> Engine {
        Engine {
            display,
            points: HashMap::new(),
            prizeLocation: None
        }
    }

    pub fn onDig(&mut self, x: i32, y: i32, val: i32) {
        if val == 0 {
            let pt = GridPoint { x, y };
            self.points.insert(pt, ".".to_owned());
        }
    }
    
    pub fn drawMap(&self) {
        for (k, v) in &self.points {
            self.display.draw(k.x, k.y, &v);
        }
    }
}
