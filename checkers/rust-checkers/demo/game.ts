fetch('./rust_checkers.wasm')
    .then(response => response.arrayBuffer())
    .then(bytes => WebAssembly.instantiate(bytes, {
        env: {
            notify_piececrowned: (x: number, y: number) => {
                console.log("A piece was crowned at ", [x, y]);
            },
            notify_piecemoved: (fromX: number, fromY: number, toX: number, toY: number) => {
                console.log("A piece moved from ", [fromX,fromY], "to", [toX,toY]);
            }
        }
    }))
    .then(result => {
        console.log("imported wasm");
    })
    .catch(error => {
        console.log(error);
    });

