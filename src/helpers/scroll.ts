const NAVBAR_SELECTOR = ".navbar";
const TOOLBAR_SELECTOR = ".toolbar";
const BUFFER_OFFSET = 15;

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
        const mainOffset =  el.getBoundingClientRect().top + window.scrollY;
        const navbarHeight = (document.querySelector(NAVBAR_SELECTOR) as HTMLElement)?.offsetHeight ?? 0;
        const toolbarHeight = (document.querySelector(TOOLBAR_SELECTOR) as HTMLElement)?.offsetHeight ?? 0;
        const additionalOffset = toolbarHeight + navbarHeight + BUFFER_OFFSET;
        return mainOffset - additionalOffset;
    }

    const parent = target as Element;

    const parentRect = parent.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    return elRect.top - parentRect.top + parent.scrollTop;
}

export function scrollToElement(el: HTMLElement) {
    const target = findScrollParent(el);

    const offset = getOffset(el, target);

    if (target === window) {
        window.scrollTo({
            top: offset,
            behavior: "smooth"
        });
    } else {
        (target as Element).scrollTo({
            top: offset,
            behavior: "smooth"
        });
    }
}