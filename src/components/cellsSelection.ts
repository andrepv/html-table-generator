import { range, enableAutoScroll, clearTextSelection } from "../utils.ts";

interface ISelected {
  cells: HTMLTableCellElement[];
  rows: number[];
  cols: number[];
}

interface ICellsSelection {
  currentCell: HTMLTableCellElement;
  mouseMoveListener: (event: MouseEvent) => void;
  isMouseMove: boolean;
  handleCellMouseDown(cell: HTMLTableCellElement): void;
  resetAllSelectedData(): void;
  readonly selectedRows: number[];
  readonly selectedCols: number[];
  readonly selectedCells: HTMLTableCellElement[]
}

export default class CellsSelection implements ICellsSelection {
  public currentCell: HTMLTableCellElement;
  public mouseMoveListener: (event: MouseEvent) => void;
  public isMouseMove: boolean;
  private firstSelectedCell: HTMLTableCellElement;
  private selected: ISelected;

  constructor(private table) {
    this.mouseMoveListener = this.handleMouseMove.bind(this);
    this.isMouseMove = false;
    this.selected = {
      cells: [],
      rows: [],
      cols: [],
    }
  }

  public handleCellMouseDown(cell: HTMLTableCellElement): void {
    this.resetAllSelectedData();
    this.selectRow(cell.closest("tr").rowIndex);
    this.selectCol(cell.cellIndex);
    this.selectCell(cell);
    this.firstSelectedCell = cell;
  }

  public resetAllSelectedData(): void {
    this.selected.rows = [];
    this.selected.cols = [];
    this.deselectAllCells();
  }

  get selectedRows(): number[] {
    return range(this.selected.rows);
  }

  get selectedCols(): number[] {
    return range(this.selected.cols);
  }

  get selectedCells(): HTMLTableCellElement[] {
    return this.selected.cells;
  }

  private handleMouseMove(event: MouseEvent): void {
    const target: HTMLElement = <HTMLElement>event.target;
    const cell: HTMLTableCellElement = target.closest("td");
    const isResizer: boolean = target.classList.contains("tbl__resizer");

    if (!cell || (this.currentCell && this.currentCell === cell) || isResizer) return;
    enableAutoScroll(event);
    this.currentCell = cell;
    this.table.showToggleMenuButton();
    this.firstSelectedCell && this.prepareFirstSelectedCell();
    if (!this.isMouseMove) {
      this.isMouseMove = true;
    }
    this.selectRow(cell.closest("tr").rowIndex);
    this.selectCol(cell.cellIndex);
    this.selectCells();
  }

  private prepareFirstSelectedCell(): void {
    const input: HTMLElement = this.firstSelectedCell.querySelector(".tbl__area");
    input.blur();
    clearTextSelection();
    this.firstSelectedCell = null;
  }

  private selectRow(rowIndex: number): void {
    if (!this.selected.rows.length) {
      this.selected.rows = [rowIndex];
      return;
    }
    this.selected.rows = [...this.selected.rows.slice(0,1), rowIndex];
  }

  private selectCol(colIndex: number): void {
    if (!this.selected.cols.length) {
      this.selected.cols = [colIndex];
      return;
    }
    this.selected.cols = [...this.selected.cols.slice(0,1), colIndex];
  }

  private selectCells(): void {
    const cells: NodeListOf<HTMLTableDataCellElement> = this.table.tableUI.tableElement.querySelectorAll("td");
    const selectedRows: number[] = range(this.selected.rows);
    const selectedCols: number[] = range(this.selected.cols);

    for (let cell of cells) {
      const row: number = cell.closest("tr").rowIndex;
      const col: number = cell.cellIndex;
      if (selectedRows.includes(row) && selectedCols.includes(col)) {
        this.selectCell(cell);
      } else {
        this.deselectCell(cell);
      }
    }
  }

  private selectCell(cell: HTMLTableCellElement): void {
    if (this.selected.cells.includes(cell)) return;
    this.currentCell = cell;
    this.selected.cells = [...this.selected.cells, cell];
    this.table.tableUI.setCellOutline(cell);
  }

  private deselectCell(cell: HTMLTableCellElement): void {
    if (!this.table.tableUI.hasCellOutline(cell)) return;
    this.table.tableUI.removeCellOutline(cell);
    this.selected.cells = this.selected.cells.filter(
      selectedCell => {
        return selectedCell !== cell;
      }
    );
  }

  private deselectAllCells(): void {
    if (!this.selected.cells.length) return;
    for (let cell of this.selected.cells) {
      this.table.tableUI.removeCellOutline(cell);
    }
    this.selected.cells = [];
  }
}