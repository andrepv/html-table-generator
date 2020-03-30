import Table from "./table.ts";
import { create } from "./utils.ts";

interface ICellAttributes {
  rowNumber: number;
  colNumber: number;
}

interface ITableGenerator {
  render(): void;
}

export default class TableGenerator implements ITableGenerator {
  private table: Table;
  private rowCount: number;
  private colCount: number;
  private container: HTMLElement;

  constructor(private wrapper: Element) {
    this.table = new Table();
    this.rowCount = 1;
    this.colCount = 1;
    this.container = this.createContainer();
    this.attachEventHandler();
    this.highlightCells();
  }

  public render(): void {
    this.wrapper.append(this.container);
  }

  private createContainer(): HTMLElement {
    const cells: string = this.createCells();
    const container: HTMLElement = create(
      "div", "tg__container",
      [
        create("h3", "tg__title", [], "Select the table size"),
        create("div", "tg__size", [], `<p>${this.rowCount} x ${this.colCount}</p>`),
        create("div", "tg__cells", [], cells)
      ]
    );
    return container;
  }

  private createCells(): string {
    let cells: Array<string> = [];
    for (let i = 0; i < 100; i++) {
      const rowNumber: number = Math.floor(i / 10) + 1;
      const colNumber: number = parseInt(i.toString()[i < 10 ? 0 : 1]) + 1;
      const cell: HTMLElement = create(
        "div", "tg__cell", [], null,
        [
          {name: "row", value: `${rowNumber}`},
          {name: "col", value: `${colNumber}`}
        ]
      );
      cells.push(cell.outerHTML);
    }
    return cells.join(" ");
  }

  private attachEventHandler(): void {
    const cellsWrapper: HTMLElement = this.container.querySelector(".tg__cells");
    cellsWrapper.addEventListener("mouseover", this.handleMouseOver.bind(this));
    cellsWrapper.addEventListener("click", this.handleClick.bind(this));
  }

  private handleMouseOver(event: MouseEvent): void {
    const target: HTMLElement = <HTMLElement>event.target;
    if (target === <HTMLElement>event.currentTarget) return;
    const cellAttrs: ICellAttributes = this.getCellAttributes(target);
    this.updateState(cellAttrs.rowNumber, cellAttrs.colNumber);
  }

  private handleClick(event: MouseEvent): void {
    const target: HTMLElement = <HTMLElement>event.target;
    if (target === <HTMLElement>event.currentTarget) return;
    const cellAttrs: ICellAttributes = this.getCellAttributes(target);
    this.removeContainer();
    this.table.render(cellAttrs.rowNumber, cellAttrs.colNumber, this.wrapper);
  }

  private updateState(rowNumber: number, colNumber: number): void {
    this.rowCount = rowNumber;
    this.colCount = colNumber;
    this.updateSizeIndicator();
    this.highlightCells();
  }

  private updateSizeIndicator(): void {
    const sizeIndicator: HTMLElement = this.container.querySelector(".tg__size p");
    sizeIndicator.innerHTML = `${this.rowCount} x ${this.colCount}`;
  }

  private highlightCells(): void {
    const cells: NodeListOf<HTMLElement> = this.container.querySelectorAll(".tg__cell");
    for (let i = 0; i < cells.length; i++) {
      const cellAttrs: ICellAttributes = this.getCellAttributes(cells[i]);
      const isCellInRange: boolean = (
        cellAttrs.rowNumber <= this.rowCount &&
        cellAttrs.colNumber <= this.colCount
      );
      if (isCellInRange) {
        cells[i].classList.add("tg__cell_selected");
      } else {
        cells[i].classList.remove("tg__cell_selected");
      }
    }
  }

  private getCellAttributes(cell: HTMLElement): ICellAttributes {
    return {
      rowNumber: +cell.getAttribute("row"),
      colNumber: +cell.getAttribute("col"),
    }
  }

  private removeContainer(): void {
    this.container.remove();
  }
}