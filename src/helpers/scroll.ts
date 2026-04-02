export function findScrollParent(el: HTMLElement): Element | Window {
    let parent: HTMLElement | null = el.parentElement;

    while (parent) {
        const style = getComputedStyle(parent);

        const overflowY = style.overflowY;

        if (overflowY === "auto" || overflowY === "scroll") {
            return parent;
        }

        parent = parent.parentElement;
    }

    return window;
}

function getOffset(el: HTMLElement, target: Element | Window): number {
    if (target === window) {
        return el.getBoundingClientRect().top + window.scrollY;
    }

    const parent = target as Element;

    const parentRect = parent.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    return elRect.top - parentRect.top + parent.scrollTop;
}

export function scrollToElement(el: HTMLElement) {
    const target = findScrollParent(el);

    const offset = getOffset(el, target);

    window.scrollTo({
        top: offset,
        behavior: "smooth"
    });
}