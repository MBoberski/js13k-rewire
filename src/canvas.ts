//const editor = false;
const editor = (): boolean => {
    var url = new URL(window.location.href);
    if (url.searchParams.get("editor")) {
        return true;
    }
    return false;
};
const createCanvas = (width: number, height: number): [Canvas, Context] => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d') as Context;
    return [canvas, context];
};
