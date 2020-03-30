import { create } from "../utils.ts";

interface ITableUI {
  rowCount: number;
  colCount: number;
  tableElement: HTMLTableElement;
  render(rowCount: number, columnCount: number): HTMLElement;
  addCol(index: number): void;
  addRow(index: number): void;
  deleteSelectedRows(rows: number[]): void;
  deleteSelectedCols(cols: number[]): void;
  setCellOutline(cell: HTMLTableCellElement): void;
  removeCellOutline(cell: HTMLTableCellElement): void;
  hasCellOutline(cell: HTMLTableCellElement): boolean;
  readonly rows: {rowHeight: number}[];
  readonly cols: {colWidth: number}[];
}

export default class TableUI implements ITableUI {
  public rowCount: number;
  public colCount: number;
  public tableElement: HTMLTableElement;

  public render(rowCount: number, columnCount: number): HTMLElement {
    this.rowCount = rowCount;
    this.colCount = columnCount;

    const table: HTMLTableElement = this.createTableElement();
    this.tableElement = table;
    this.tableElement.ondragstart = function() {
      return false;
    };
    return table;
  }

  public addCol(index: number = -1): void {
    this.colCount++;
    const rows: HTMLCollectionOf<HTMLTableRowElement> = this.tableElement.rows;
    for (let row of rows) {
      const insertedCell: HTMLTableCellElement = row.insertCell(index);
      this.fillCell(insertedCell);
    }
  }

  public addRow(index: number = -1): void {
    this.rowCount++;
    const insertedRow: HTMLTableRowElement = this.tableElement.insertRow(index);
    this.fillRow(insertedRow);
  }

  public deleteSelectedRows(rowsNumbers: number[]): void {
    const selectedRows: HTMLTableRowElement[] = rowsNumbers.map(rowNumber => {
      return this.tableElement.rows[rowNumber];
    });
    for (let row of selectedRows) {
      row.parentNode.removeChild(row);
      this.rowCount--;
    }
  }

  public deleteSelectedCols(colsNumbers: number[]): void {
    const selectedCells: HTMLTableCellElement[] = this.getSelectedCells(colsNumbers);
    for (let cell of selectedCells) {
      cell.remove();
    }
    this.colCount -= colsNumbers.length;
  }

  public setCellOutline(cell: HTMLTableCellElement): void {
    cell.querySelector(".tbl__area").classList.add("tbl__area_selected");
  }

  public removeCellOutline(cell: HTMLTableCellElement): void {
    cell.querySelector(".tbl__area").classList.remove("tbl__area_selected");
  }

  public hasCellOutline(cell: HTMLTableCellElement): boolean {
    return cell.querySelector(".tbl__area").classList.contains("tbl__area_selected");
  }

  get rows(): {rowHeight: number}[] {
    const rows: HTMLCollection = this.tableElement.rows;
    return [].map.call(rows, row => {
      return {
        rowHeight: row.offsetHeight
      }
    });
  }

  get cols(): {colWidth: number}[] {
    const row: HTMLTableRowElement = this.tableElement.rows[0];
    return [].map.call(row.cells, col => {
      return {
        colWidth: col.offsetWidth
      }
    });
  }

  private createTableElement(): HTMLTableElement {
    const rows: HTMLTableRowElement[] = this.createRows();
    const tbody: HTMLElement = create("tbody", null, rows);
    const table: HTMLTableElement = create("table", "tbl", [tbody]);
    return table;
  }

  private createRows(): HTMLTableRowElement[] {
    const rows: HTMLTableRowElement[] = [];
    for (let i = 0; i < this.rowCount; i++) {
      const row: HTMLTableRowElement = create("tr");
      this.fillRow(row);
      rows.push(row);
    }
    return rows;
  }

  private fillCell(cell: HTMLTableCellElement): void {
    const area: HTMLElement = create(
      "div", "tbl__area", [], null,
      [{
        name: "contenteditable",
        value: "true",
      }]
    );
    cell.append(area);
  }

  private fillRow(row: HTMLTableRowElement): void {
    for (let i = 0; i < this.colCount; i++) {
      const cell: HTMLTableCellElement = row.insertCell();
      this.fillCell(cell);
    }
  }

  private getSelectedCells(colsNumbers: number[]): HTMLTableCellElement[] {
    const rows: HTMLCollectionOf<HTMLTableRowElement> = this.tableElement.rows;
    const selectedCells: HTMLTableCellElement[] = [];
    for (let row of rows) {
      for (let cell of row.cells) {
        if (colsNumbers.includes(cell.cellIndex)) {
          selectedCells.push(cell);
        }
      }
    }
    return selectedCells;
  }
}