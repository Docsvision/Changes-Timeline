export function useHasHover() {
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}
