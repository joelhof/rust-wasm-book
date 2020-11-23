import {Engine, PlayerCore} from './gen/rust_rogue'

const wasm = import('./gen/rust_rogue.js');

wasm.then(module => {
    console.log("wasm module");
    this.display = new ROT.Display({
        width: 125, heigth: 40
    });
    document.getElementById("rogueCanvas").appendChild(this.display.getContainer());

    this.engine = new Engine(this.display);
})
.catch(console.error);