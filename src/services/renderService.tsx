export enum windowLevelBounds {
  MIN_CONTRAST = 20,
  MAX_CONTRAST = 1000,
  MIN_BRIGHTNESS = 5,
  MAX_BRIGHTNESS = 400
}

const hasPositionChanged = ({ pos, prevPos }: any) => pos !== prevPos;

const valueInRange = ({ minScale, maxScale, scale }: any) => scale <= maxScale && scale >= minScale;

const getTranslate = ({ minScale, maxScale, scale }: any) => ({ pos, prevPos, translate }: any) =>
    valueInRange({ minScale, maxScale, scale }) && hasPositionChanged({ pos, prevPos })
        ? translate + (pos - prevPos * scale) * (1 - 1 / scale)
        : translate;

const getScale = ({ scale, minScale, maxScale, scaleSensitivity, deltaScale }: any) => {
    let newScale = scale + (deltaScale / (scaleSensitivity / scale));
    newScale = Math.max(minScale, Math.min(newScale, maxScale));
    return [scale, newScale];
};

const getMatrix = ({ scale, translateX, translateY }: any) => `matrix(${scale}, 0, 0, ${scale}, ${translateX}, ${translateY})`;

const pan = ({ state, originX, originY }: any) => {
    state.transformation.translateX += originX;
    state.transformation.translateY += originY;
    state.element.style.transform =
        getMatrix({ scale: state.transformation.scale, translateX: state.transformation.translateX, translateY: state.transformation.translateY });
};

const canPan = (state: any) => ({
    panBy: ({ originX, originY }: any) => pan({ state, originX, originY }),
    panTo: ({ originX, originY, scale }: any) => {
        state.transformation.scale = scale;
        pan({ state, originX: originX - state.transformation.translateX, originY: originY - state.transformation.translateY });
    },
});

const canZoom = (state: any) => ({
    zoom: ({ x, y, deltaScale }: any) => {
        const { left, top } = state.element.getBoundingClientRect();
        const { minScale, maxScale, scaleSensitivity } = state;
        const [scale, newScale] = getScale({ scale: state.transformation.scale, deltaScale, minScale, maxScale, scaleSensitivity });
        const originX = x - left;
        const originY = y - top;
        const newOriginX = originX / scale;
        const newOriginY = originY / scale;
        const translate = getTranslate({ scale, minScale, maxScale });
        const translateX = translate({ pos: originX, prevPos: state.transformation.originX, translate: state.transformation.translateX });
        const translateY = translate({ pos: originY, prevPos: state.transformation.originY, translate: state.transformation.translateY });

        state.element.style.transformOrigin = `${newOriginX}px ${newOriginY}px`;
        state.element.style.transform = getMatrix({ scale: newScale, translateX, translateY });
        state.transformation = { originX: newOriginX, originY: newOriginY, translateX, translateY, scale: newScale };
    }
});

const renderer = ({ minScale, maxScale, element, scaleSensitivity = 10 }: any) => {
    const state = {
        element,
        minScale,
        maxScale,
        scaleSensitivity,
        transformation: {
            originX: 0,
            originY: 0,
            translateX: 0,
            translateY: 0,
            scale: 1
        },
    };
    return Object.assign({}, canZoom(state), canPan(state));
};

export default renderer;