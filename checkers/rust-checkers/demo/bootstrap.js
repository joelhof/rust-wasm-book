window.addEventListener('DOMContentLoaded', () => {
    import('./game')
    .then(wasm => {
        console.log("game module loaded");
    })
    .catch(error => {
        console.error(error);
    });
});
