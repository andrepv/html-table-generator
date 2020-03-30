import { create, getCoords, getPosition } from "../../utils.ts";
import Colgroup from "./colgroup.ts";

interface IColumnResizer {
  colgroup: Colgroup;
  attachEventHandlers(): void;
  deleteSelectedColsFromColGroup(): void;
  addResizers(): void;
  moveResizerToFirstRow(): void;
  addResizer(index: number): void;
}

interface Coords {
  startingCoord: number,
  finalCoord: number,
  minCoord: number,
  maxCoord: number,
}

export default class ColumnResizer implements IColumnResizer {
  private currentResizer: HTMLElement;
  private targetColNumber: number;
  private coords: Coords;
  private tableLeft: number;
  private shiftX: number;
  private mouseMoveListener: (event: MouseEvent) => void;
  public colgroup: Colgroup;

  constructor(private table) {
    this.mouseMoveListener = this.handleMouseMove.bind(this);
    this.colgroup = new Colgroup();
    this.coords = {
      startingCoord: 0,
      finalCoord: 0,
      minCoord: 0,
      maxCoord: 0,
    };
  }

  public attachEventHandlers(): void {
    this.table.tableUI.tableElement.addEventListener("mousedown", this.handleMouseDown.bind(this));
    document.addEventListener("mouseup", this.handleMouseUp.bind(this));
  }

  public deleteSelectedColsFromColGroup(): void {
    if (this.table.cellsSelection.selectedCols.includes(0)) {
      this.deleteResizer(this.table.tableUI.tableElement.rows[0].cells[0]);
    }
    this.colgroup.deleteSelectedCols(this.table.cellsSelection.selectedCols);
    this.colgroup.adjustColsWidthAfterDeletingCol(this.table.tableUI.colCount)
  }

  public addResizers(): void {
    const firstRow: HTMLTableRowElement = this.table.tableUI.tableElement.rows[0];
    if (!firstRow) return;
    for (let cell of firstRow.cells) {
      if (cell.cellIndex === 0) continue;
      const resizer: HTMLElement = create("div", "tbl__resizer");
      cell.append(resizer);
    }
  }

  public moveResizerToFirstRow(): void {
    const row: HTMLTableRowElement = this.table.tableUI.tableElement.rows[1];
    this.deleteResizers(row);
    this.addResizers();
  }

  public addResizer(index: number): void {
    const colNum: number = index === 0 ? 1 : index;
    const resizer: HTMLElement = create("div", "tbl__resizer");
    const firstRow: HTMLTableRowElement = this.table.tableUI.tableElement.rows[0];
    if (!firstRow) return;
    const cell: HTMLTableCellElement = firstRow.cells[colNum];
    if (cell) {
      cell.append(resizer);
    }
    this.colgroup.addCol(index);
    this.colgroup.adjustColsWidthAfterAddingCol(this.table.tableUI.colCount);
  }

  private handleMouseDown(event: MouseEvent): void {
    const target: HTMLElement = <HTMLElement>event.target;
    if (!target.classList.contains("tbl__resizer")) return;

    this.activateResizer(target);
    this.setInitialData(event)

    document.addEventListener("mousemove", this.mouseMoveListener);
  }

  private handleMouseMove(event: MouseEvent): void {
    this.setFinalCoord(event);
    if (this.coords.finalCoord <= this.coords.minCoord) {
      this.coords.finalCoord = this.coords.minCoord;
    } else if (this.coords.finalCoord >= this.coords.maxCoord) {
      this.coords.finalCoord = this.coords.maxCoord;
    }
    this.moveResizer(this.coords.finalCoord + 4);
  }

  private handleMouseUp(): void {
    if (!this.currentResizer) return;
    this.changeColumnWidth();
    this.removeStyleAttribute(this.currentResizer);
    this.deactivateResizer();

    if (this.table.cellsSelection.currentCell) {
      this.table.showToggleMenuButton();
    }
    this.table.toolbars.horizontalToolBar.updateButtonsPosition(this.table.tableUI.cols);
    document.removeEventListener("mousemove", this.mouseMoveListener);
  }

  private changeColumnWidth(): void {
    const diff: number = this.coords.startingCoord - this.coords.finalCoord;
    const cols: HTMLCollectionOf<Element> = this.colgroup.colgroupElement.children;
    const colsWidth: {colWidth: number}[] = [...this.table.tableUI.cols];

    this.setTargetColWidth(cols, colsWidth, diff);
    this.setNextColWidth(cols, colsWidth, diff);
    this.setOtherColsWidth(cols, colsWidth);
  }

  private setTargetColWidth(
    cols: HTMLCollectionOf<Element>,
    colsWidth: {colWidth: number}[],
    diff: number
  ): void {
    const targetCol: Element = cols[this.targetColNumber];
    const targetColOldWidth: number = colsWidth[this.targetColNumber].colWidth;
    const targetColNewWidth: number = this.convertToPercent(targetColOldWidth - diff);

    this.colgroup.setColWidth(targetCol, targetColNewWidth);
  }

  private setNextColWidth(
    cols: HTMLCollectionOf<Element>,
    colsWidth: {colWidth: number}[],
    diff: number
  ): void {
    const nextCol: Element = cols[this.targetColNumber + 1];
    const nextColOldWidth: number = colsWidth[this.targetColNumber + 1].colWidth;
    const nextColNewWidth: number = this.convertToPercent(nextColOldWidth + diff);

    this.colgroup.setColWidth(nextCol, nextColNewWidth);
  }

  private setOtherColsWidth(
    cols: HTMLCollectionOf<Element>,
    colsWidth: {colWidth: number}[]
  ): void {
    for (let colNum = 0; colNum < cols.length; colNum++) {
      if (colNum !== this.targetColNumber && colNum !== this.targetColNumber + 1) {
        this.colgroup.setColWidth(
          cols[colNum],
          this.convertToPercent(colsWidth[colNum].colWidth)
        );
      }
    }
  }

  private deleteResizers(row: HTMLTableRowElement): void {
    if (!row) return;
    for (let cell of row.cells) {
      this.deleteResizer(cell);
    }
  }

  private deleteResizer(cell: HTMLTableCellElement): void {
    if (!cell) return;
    const resizer: HTMLElement = cell.querySelector(".tbl__resizer");
    resizer && resizer.remove();
  }

  private activateResizer(resizer: HTMLElement): void {
    this.currentResizer = resizer;
    this.currentResizer.classList.add("tbl__resizer_active")
  }

  private deactivateResizer(): void {
    this.currentResizer.classList.remove("tbl__resizer_active");
    this.currentResizer = null;
  }

  private setInitialData(event: MouseEvent): void {
    const closestCell: HTMLTableCellElement = (<HTMLElement>event.target).closest("td");
    const firstRow: HTMLTableRowElement = this.table.tableUI.tableElement.rows[0];
    const targetCell: HTMLTableCellElement = firstRow.cells[closestCell.cellIndex - 1];
    const resizerLeft: number = getCoords(this.currentResizer).left;

    this.targetColNumber = targetCell.cellIndex;
    this.shiftX = event.pageX - resizerLeft;
    this.setMinMaxCoords(targetCell, closestCell);
    this.tableLeft = getCoords(this.table.tableUI.tableElement).left;
    this.coords.startingCoord = resizerLeft - this.tableLeft;
    this.setFinalCoord(event);
  }

  private setMinMaxCoords(
    targetCell: HTMLTableCellElement,
    closestCell: HTMLTableCellElement
  ): void {
    const minColumnWidth: number = 80;
    this.coords.minCoord = getPosition(targetCell).left + minColumnWidth;
    this.coords.maxCoord = getPosition(closestCell).right - minColumnWidth;
  }

  private setFinalCoord(event: MouseEvent): void {
    this.coords.finalCoord = event.pageX - this.tableLeft - this.shiftX;
  }

  private convertToPercent(value: number): number {
    const tableWidth: number = this.table.tableUI.tableElement.offsetWidth;
    return value / tableWidth * 100
  }

  private moveResizer(value: number): void {
    this.currentResizer.style.left = `${value}px`;
  }

  private removeStyleAttribute(element: HTMLElement): void {
    if (element.hasAttribute("style")) {
      element.removeAttribute("style");
    }
  }
}