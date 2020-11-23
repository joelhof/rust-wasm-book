# Build rust
cargo build --target wasm32-unknown-unknown

# Generate webassembly and js-wrappers
rm -r webapp/gen/
wasm-bindgen target/wasm32-unknown-unknown/debug/rust_rogue.wasm --out-dir webapp/gen