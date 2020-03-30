import { create } from "../../utils.ts";

export interface IHighlightingLine {
  render(): HTMLElement;
  showAt(coord: number): void;
  hide(): void
}

abstract class HighlightingLine implements IHighlightingLine {
  protected highlightingLine: HTMLElement;
  protected highlightingLineClasses: string[];

  constructor() {
    this.highlightingLineClasses = [];
  }

  public render(): HTMLElement {
    const line: HTMLElement = create("div", this.highlightingLineClasses);
    this.highlightingLine = line;
    return line;
  }

  abstract showAt(coord: number): void;

  public hide(): void {
    this.highlightingLine.classList.add("hidden");
  }
}

export class VerticalLine extends HighlightingLine {
  constructor() {
    super();
    this.highlightingLineClasses = ["toolbar__vertical-line", "hidden"];
  }

  public showAt(coord: number): void {
    this.highlightingLine.style.left = `${coord}px`;
    this.highlightingLine.classList.remove("hidden");
  }
}

export class HorizontalLine extends HighlightingLine {
  constructor() {
    super();
    this.highlightingLineClasses = ["toolbar__horizontal-line", "hidden"];
  }

  public showAt(coord: number): void {
    this.highlightingLine.style.top = `${coord}px`;
    this.highlightingLine.classList.remove("hidden");
  }
}