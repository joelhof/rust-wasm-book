const wasm = import('./bindgenhello_bg.wasm');

wasm.then(module => module.hello('World, sponsored by wasm-bindgen'))
    .catch(console.error);