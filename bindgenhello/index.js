const wasm = import('./bindgenhello.js');

wasm.then(module => module.hello('World, sponsored by wasm-bindgen'))
    .catch(console.error);