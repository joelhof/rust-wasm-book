const wasm = import('./gen/rust_rogue.js');

wasm.then(module => console.log("rust-rogue wasm module loaded"))
    .catch(console.error);