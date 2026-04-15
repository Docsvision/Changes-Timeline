const TOOLBAR_SELECTOR = ".toolbar";
const NAVBAR_SELECTOR = ".navbar";
const BUFFER_OFFSET = 10;

export function scrollToElement(el: HTMLElement) {
    if (!el) return;

    let target: Element | Window = el.parentElement!;
    while (target && target !== document.body && target !== document.documentElement) {
        const style = getComputedStyle(target as Element);
        const canScrollY =
            /(auto|scroll)/.test(style.overflowY) &&
            (target as Element).scrollHeight > (target as Element).clientHeight;

        if (canScrollY) break;
        target = (target as HTMLElement).parentElement!;
    }

    if (!target || target === document.body || target === document.documentElement) {
        target = window;
    }

    const toolbarEl = document.querySelector<HTMLElement>(TOOLBAR_SELECTOR);
    const navbarEl = document.querySelector<HTMLElement>(NAVBAR_SELECTOR);
    const toolbarHeight = toolbarEl?.offsetHeight ?? 0;
    const navbarHeight = navbarEl?.offsetHeight ?? 0;
    const totalOffset = toolbarHeight + navbarHeight + BUFFER_OFFSET;
    
    if (target === window) {
        el.style.scrollMarginTop = `${totalOffset}px`;
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        setTimeout(() => {
            el.style.scrollMarginTop = "";
        }, 1000);
    } else {
        const parent = target as Element;
        const parentRect = parent.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();

        const offset = elRect.top - parentRect.top + parent.scrollTop - totalOffset;
        parent.scrollTo({ top: offset, behavior: "smooth" });
    }
}