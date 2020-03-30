import { create } from "../../utils.ts";

interface IColgroup {
  colgroupElement: HTMLElement;
  createColGroup(colCount: number): HTMLElement;
  deleteSelectedCols(colNumbers: number[]): void;
  addCol(colNum: number): void;
  setColWidth(col: Element, width: number): void;
  adjustColsWidthAfterDeletingCol(colCount: number): void;
  adjustColsWidthAfterAddingCol(colCount: number): void;
}

export default class Colgroup implements IColgroup {
  public colgroupElement: HTMLElement

  public createColGroup(colCount: number): HTMLElement {
    const colgroup: HTMLElement = create("colgroup");
    for (let i = 0; i < colCount; i++) {
      const col: HTMLElement = create("col");
      colgroup.append(col);
    }
    this.colgroupElement = colgroup;
    return colgroup;
  }

  public deleteSelectedCols(colsNumbers: number[]): void {
    const cols: HTMLCollectionOf<Element> = this.colgroupElement.children;
    const selectedCols: Element[] = [];

    for (let colNum of colsNumbers) {
      selectedCols.push(cols[colNum]);
    }
    for (let col of selectedCols) {
      col.remove();
    }
  }

  public addCol(colNum: number): void {
    const cols: HTMLCollectionOf<Element> = this.colgroupElement.children;
    const col: HTMLElement = create("col");
    if (cols[colNum]) {
      cols[colNum].before(col);
    } else {
      this.colgroupElement.append(col);
    }
  }

  public setColWidth(col: Element, width: number): void {
    (<HTMLElement>col).style.width = `${width}%`;
  }

  public adjustColsWidthAfterDeletingCol(colCount: number): void {
    const cols: HTMLCollectionOf<Element> = this.colgroupElement.children;
    const allColsWidth: number = this.getAllColumnsWidth(colCount);
    const deletedColsWidth: number = 100 - allColsWidth;
    const extraSpace: number = deletedColsWidth / colCount;

    for (let col of cols) {
      let colWidth: number = this.getColWidth(col)
      if (!colWidth) {
        colWidth = 100 / (colCount + 1)
      }
      this.setColWidth(col, colWidth + extraSpace);
    }
  }

  public adjustColsWidthAfterAddingCol(colCount: number): void {
    const cols: HTMLCollectionOf<Element> = this.colgroupElement.children;
    for (let i = 0; i < colCount; i++) {
      const normalWidth: number = 100 / colCount;
      const normalWidthDeviation: number = this.getColWidthDeviation(cols[i], colCount);
      const colWidth: number = normalWidth * normalWidthDeviation;
      this.setColWidth(cols[i], colWidth);
    }
  }

  private getColWidth(col: Element): number {
    const colWidth: number = +(<HTMLElement>col).style.width.split("%")[0];
    return colWidth;
  }

  private getAllColumnsWidth(colCount: number): number {
    const cols: HTMLCollectionOf<Element> = this.colgroupElement.children;
    let allColsWidth: number = 0;
    for (let col of cols) {
      let colWidth: number = this.getColWidth(col);
      if (!colWidth) {
        colWidth = 100 / (colCount + 1)
      }
      allColsWidth += colWidth
    }
    return allColsWidth;
  }

  private getColWidthDeviation(col: Element, colCount: number): number {
    const prevColCount: number = colCount - 1;
    const colNormalWidth: number = 100 / prevColCount;
    const colActualWidth: number = this.getColWidth(col);
    let ratio: number;
    if (!colActualWidth) {
      ratio = 1
    } else {
      ratio = colActualWidth / colNormalWidth;
    }
    return ratio;
  }
}