export const scrollTargets =  [ null, document, document.body, document.scrollingElement, document.documentElement ]

export function getVerticalScrollPosition(scrollTarget: Element | Window) {
    return scrollTarget === window
        ? window.pageYOffset || window.scrollY || document.body.scrollTop || 0
        : (scrollTarget as Element).scrollTop
}

export function animVerticalScrollTo(el: Element | Window, to: number, duration: number = 0 , prevTime: number = performance.now()) {
    const pos = getVerticalScrollPosition(el);

    if (duration <= 0) {
        if (pos !== to) {
            setScroll(el, to);
        }

        return;
    }

    requestAnimationFrame(nowTime => {
        const frameTime = nowTime - prevTime;
        const newPos = pos + (to - pos) / Math.max(frameTime, duration) * frameTime;
        setScroll(el, newPos);
        if (newPos !== to) {
            animVerticalScrollTo(el, to, duration - frameTime, nowTime);
        }
    });
}

export function setScroll(scrollTarget: Element | Window, offset: number) {
    if (scrollTarget === window) {
        window.scrollTo(window.pageXOffset || window.scrollX || document.body.scrollLeft || 0, offset);
        return;
    }

    (scrollTarget as Element).scrollTop = offset;
}

export function setVerticalScrollPosition(scrollTarget:Element | Window, offset: number, duration: number) {
    if (duration) {
        animVerticalScrollTo(scrollTarget, offset, duration);
        return;
    }

    setScroll(scrollTarget, offset);
}

export function getScrollTarget(el: Element) {
    const target = el.closest('.scroll,.scroll-y,.overflow-auto');

    return scrollTargets.includes(target) ? window : target;
}


export function scrollToElement(el: HTMLElement) {
    const target = getScrollTarget(el);
    if (!target) return;

    const offset = el.getBoundingClientRect().top;
    const duration = 1000;
    setVerticalScrollPosition(target, offset, duration);
}
