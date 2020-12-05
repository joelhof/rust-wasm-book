# Build rust
cargo build --target wasm32-unknown-unknown

# Generate webassembly and js-wrappers
wasm-bindgen target/wasm32-unknown-unknown/debug/rust_rogue.wasm --out-dir webapp/gen