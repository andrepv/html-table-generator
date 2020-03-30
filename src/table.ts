import TableUI from "./components/tableUI.ts";
import Toolbars from "./components/toolbar/toolBars.ts";
import ContextMenu from "./components/contextMenu/contextMenu.ts";
import CellsSelection from "./components/cellsSelection.ts";
import ColumnResizer from "./components/resizer/columnResizer.ts";
import HtmlGenerator from "./components/htmlGenerator.ts";
import { create, getPosition, IElementPosition } from "./utils.ts";

interface ITable {
  tableUI: TableUI;
  toolbars: Toolbars;
  cellsSelection: CellsSelection;
  columnResizer: ColumnResizer;
  contextMenu: ContextMenu;
  render(rows: number, columns: number, wrapper: Element): void;
  addRow(event: MouseEvent): void;
  addCol(event: MouseEvent): void;
  deleteRow(): void;
  deleteCol(): void;
  selectFirstCell(): void;
  showToggleMenuButton(): void;
}

export default class Table implements ITable {
  public tableUI: TableUI;
  public toolbars: Toolbars;
  public cellsSelection: CellsSelection;
  public columnResizer: ColumnResizer;
  public contextMenu: ContextMenu;
  private htmlGenerator: HtmlGenerator;
  private isTableActive: boolean;

  constructor() {
    this.tableUI = new TableUI();
    this.toolbars = new Toolbars(this);
    this.contextMenu = new ContextMenu(this);
    this.cellsSelection = new CellsSelection(this);
    this.columnResizer = new ColumnResizer(this);
    this.isTableActive = false;
  }

  public render(rows: number, columns: number, wrapper: Element): void {
    const container: HTMLElement = this.createContainer(rows, columns);
    wrapper.append(container);

    this.htmlGenerator = new HtmlGenerator(this.tableUI.tableElement);
    this.htmlGenerator.appendButtonToDocument();
    this.toolbars.appendToolbarsToContainer(container);
    this.columnResizer.addResizers();

    this.attachEventHandlers();
    this.setResizeObserver();
  }

  public addRow(event: MouseEvent): void {
    this.addCells(event, this.addRowToTableElement.bind(this));
  }

  public addCol(event: MouseEvent): void {
    this.addCells(event, this.addColToTableElement.bind(this));
  }

  public deleteRow(): void {
    const selectedRows: number[] = this.cellsSelection.selectedRows;
    this.tableUI.deleteSelectedRows(selectedRows);
    selectedRows.includes(0) && this.columnResizer.addResizers();
    this.toolbars.verticalToolBar.update(this.tableUI.rows);
    this.contextMenu.toggleButton.hide();
    this.deactivateTable();
  }

  public deleteCol(): void {
    this.tableUI.deleteSelectedCols(this.cellsSelection.selectedCols);
    this.columnResizer.deleteSelectedColsFromColGroup();
    this.toolbars.horizontalToolBar.update(this.tableUI.cols);
    this.contextMenu.toggleButton.hide();
    this.deactivateTable();
  }

  public showToggleMenuButton(): void {
    const cellCoords: IElementPosition = getPosition(this.cellsSelection.currentCell);
    this.contextMenu.saveCellCoords(cellCoords);
    this.contextMenu.toggleButton.show();
  }

  public selectFirstCell(): void {
    const firstCell: HTMLTableCellElement = this.tableUI.tableElement.rows[0].cells[0];
    this.focusCell(firstCell);
    this.cellsSelection.handleCellMouseDown(firstCell);
    this.showToggleMenuButton();
  }

  private attachEventHandlers(): void {
    this.columnResizer.attachEventHandlers();
    this.toolbars.attachEventHandlers();
    document.addEventListener("mousedown", this.handleDocumentMouseDown.bind(this));
    document.addEventListener("mouseup", this.handleDocumentMouseUp.bind(this));
  }

  private setResizeObserver(): void {
    const resizeObserver: ResizeObserver = new ResizeObserver(() => {
      this.toolbars.verticalToolBar.updateButtonsPosition(this.tableUI.rows);
    });
    resizeObserver.observe(this.tableUI.tableElement);
  }

  private createContainer(rows: number, columns: number): HTMLElement {
    const table: HTMLElement = this.createTable(rows, columns);
    const menuToggleButton: HTMLElement = this.contextMenu.toggleButton.render();
    const highlightingLines: HTMLElement[] = this.toolbars.renderHighlightingLines();
    const contextMenu: HTMLElement = this.contextMenu.contextMenuElement;
    const containerContent: HTMLElement[] = [
      table, contextMenu, ...highlightingLines, menuToggleButton,
    ];
    const container: HTMLElement = create("div", "tbl__container", containerContent);
    return container;
  }

  private createTable(rows: number, columns: number): HTMLElement {
    const table: HTMLElement = this.tableUI.render(rows, columns);
    const colgroup: HTMLElement = this.columnResizer.colgroup.createColGroup(this.tableUI.colCount);
    table.append(colgroup);
    return table;
  }

  private handleDocumentMouseDown(event: MouseEvent): void {
    const target: HTMLElement = <HTMLElement>event.target;
    const isInCell: boolean = Boolean(target.closest(".tbl__area"));

    if (this.cellsSelection.isMouseMove) {
      this.cellsSelection.isMouseMove = false;
    }
    if (this.shouldActivateTable(target)) {
      this.activateTable();
    }
    if (isInCell) {
      const cell: HTMLTableCellElement = target.closest("td");
      this.selectCell(cell);
    }
  }

  private handleDocumentMouseUp(event: MouseEvent): void {
    const target: HTMLElement = <HTMLElement>event.target;
    const isInContainer: boolean = Boolean(target.closest(".tbl__container"));
    this.tableUI.tableElement.removeEventListener(
      "mousemove",
      this.cellsSelection.mouseMoveListener
    );
    if (!isInContainer) {
      this.deactivateTable();
    }
  }

  private selectCell(cell: HTMLTableCellElement): void {
    this.cellsSelection.handleCellMouseDown(cell);
    this.tableUI.tableElement.addEventListener("mousemove", this.cellsSelection.mouseMoveListener);
    this.showToggleMenuButton();
  }

  private addCells(event: MouseEvent, addCells: (pressedButton: HTMLElement) => void): void {
    const target: HTMLElement = <HTMLElement>event.target;
    const pressedToolbarButton: HTMLElement = target.closest(".toolbar__insertion-button");
    if (!pressedToolbarButton) return;
    setTimeout(() => {
      addCells(pressedToolbarButton);
    }, 50); 
  }

  private addRowToTableElement(pressedButton: HTMLElement): void {
    if (!this.tableUI.colCount) return;
    const rowIndex: number = this.toolbars.verticalToolBar.getButtonRow(pressedButton);

    this.tableUI.addRow(rowIndex);
    (rowIndex === 0) && this.columnResizer.moveResizerToFirstRow();
    this.toolbars.verticalToolBar.update(this.tableUI.rows);
    this.focusCell(this.cellsSelection.currentCell);
    this.showToggleMenuButton();
  }

  private addColToTableElement(pressedButton: HTMLElement): void {
    this.toolbars.verticalLine.hide();
    if (!this.tableUI.rowCount) return;
    const colIndex: number = this.toolbars.horizontalToolBar.getButtonCol(pressedButton);

    this.tableUI.addCol(colIndex);
    this.columnResizer.addResizer(colIndex);
    this.toolbars.horizontalToolBar.update(this.tableUI.cols);
    this.focusCell(this.cellsSelection.currentCell);
    this.showToggleMenuButton();
  }

  private shouldActivateTable(target: HTMLElement): boolean {
    const isInContainer: boolean = Boolean(target.closest(".tbl__container"));
    const isResizer: boolean = target.classList.contains("tbl__resizer");
    const isTableBorder: boolean = Boolean(target.tagName === "TD");
    return !this.isTableActive && isInContainer && !isResizer && !isTableBorder;
  }

  private activateTable(): void {
    this.isTableActive = true;
    this.toolbars.showToolbars();
  }

  private deactivateTable(): void {
    if (!this.cellsSelection.isMouseMove) {
      this.isTableActive = false;
      this.toolbars.hideToolbars();
      this.contextMenu.toggleButton.hide();
      this.cellsSelection.resetAllSelectedData();
      this.cellsSelection.currentCell = null;
    }
  }

  private focusCell(cell: any): void {
    (<HTMLTableCellElement>cell?.querySelector(".tbl__area")).focus();
  }
}