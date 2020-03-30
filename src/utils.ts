export interface IElementPosition {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

interface IElementCoords {
  left: number;
  bottom: number;
  top: number;
}

export function create(
  tagName: string,
  cssClassName: string | string[] = null,
  children: Array<HTMLElement> = [],
  html: string = null,
  attrs: {
    name: string;
    value: string;
  }[] = [],
): any {
  const el: HTMLElement = document.createElement(tagName);
  if (cssClassName) {
    if (typeof cssClassName === "object") {
      cssClassName.map(className => {
        el.classList.add(className);
      })
    } else {
      el.classList.add(cssClassName);
    }
  }
  if (html) {
    el.insertAdjacentHTML("beforeend", html);
  }
  if (children.length) {
    children.map(child => {
      el.append(child);
    })
  }
  if (attrs.length) {
    attrs.map(attr => {
      el.setAttribute(attr.name, attr.value);
    })
  }
  return el;
}

export function getCoords(el: HTMLElement): IElementCoords {
  const elCoords = el.getBoundingClientRect();
  return {
    left: elCoords.left + window.pageXOffset,
    bottom: elCoords.bottom + window.pageYOffset,
    top: elCoords.top,
  }
}

export function getPosition(el: HTMLElement): IElementPosition {
  const elWidth: number = el.offsetWidth;
  const elHeight: number = el.offsetHeight;
  return {
    left: el.offsetLeft,
    right: el.offsetLeft + elWidth,
    top: el.offsetTop,
    bottom: el.offsetTop + elHeight,
  }
}

export function range(arr: number[]): number[] {
  const start: number = Math.min(...arr);
  const end: number = Math.max(...arr);
  const res: number[] = [];
  for (let i = start; i <= end; i++) {
    res.push(i);
  }
  return res;
}

export function clearTextSelection(): void {
  if (window.getSelection) {
    if (window.getSelection().empty) {
      window.getSelection().empty();
    } else if (window.getSelection().removeAllRanges) {
      window.getSelection().removeAllRanges();
    }
  }
}

let timer = null;

function getDocumentHeight(): number {
  return Math.max(
    document.body.scrollHeight, document.body.offsetHeight,
    document.body.clientHeight, document.documentElement.scrollHeight,
    document.documentElement.offsetHeight, document.documentElement.clientHeight
  );
}

export function enableAutoScroll(e) {
  const edgeSize: number = 20;
  const viewportY: number = e.clientY;
  const viewportHeight: number = document.documentElement.clientHeight;

  const edgeTop: number = edgeSize;
  const edgeBottom: number = viewportHeight - edgeSize;

  const isInTopEdge: boolean = viewportY < edgeTop;
  const isInBottomEdge: boolean = viewportY > edgeBottom;

  if (!(isInTopEdge || isInBottomEdge)) {
    clearTimeout(timer);
    return;
  }

  (function checkForWindowScroll(): void {
    clearTimeout(timer);
    if (adjustWindowScroll()) {
      timer = setTimeout(checkForWindowScroll, 40);
    }
  })();

  function adjustWindowScroll(): boolean {
    const documentHeight: number = getDocumentHeight();
    const maxScrollY: number = documentHeight - viewportHeight;

    const currentScrollY: number = window.pageYOffset;
    const canScrollUp: boolean = currentScrollY > 0;
    const canScrollDown: boolean = currentScrollY < maxScrollY;

    let nextScrollY: number = currentScrollY;
    let intensity;

    if (isInTopEdge && canScrollUp) {
      intensity = (edgeTop - viewportY) / edgeSize;
      nextScrollY = nextScrollY - (50 * intensity);
    } else if (isInBottomEdge && canScrollDown) {
      intensity = (viewportY - edgeBottom) / edgeSize;
      nextScrollY = nextScrollY + (50 * intensity);
    }

    nextScrollY = Math.max(0, Math.min(maxScrollY, nextScrollY));

    if (nextScrollY !== currentScrollY) {
      window.scrollTo(0, nextScrollY);
      return true;
    } else {
      return false;
    }
  }
}