import { getCoords, create } from "../../utils.ts";
import ToggleButton from "./toggleButton.ts";
import { CustomClassNameTable, CustomClassNameCells } from "./customClassName.ts";
import plus from "../../img/plus.svg";
import trash from "../../img/trash.svg";

type cellCoords = {
  top: number,
  right: number,
  bottom: number,
  left: number
}

interface IContextMenu {
  contextMenuElement: HTMLElement;
  toggleButton: ToggleButton;
  cellCoords: cellCoords;
  isAtFirstPage: boolean;
  show(): void;
  hide(): void;
  saveCellCoords(coords: cellCoords): void;
}

export default class ContextMenu implements IContextMenu {
  public contextMenuElement: HTMLElement;
  public toggleButton: ToggleButton;
  public cellCoords: cellCoords;
  public isAtFirstPage: boolean;
  private customClassNameTable: CustomClassNameTable;
  private customClassNameCells: CustomClassNameCells;

  constructor(private table) {
    this.customClassNameTable = new CustomClassNameTable(this.table);
    this.customClassNameCells = new CustomClassNameCells(this.table);
    this.contextMenuElement = this.render();
    this.toggleButton = new ToggleButton(this);
    this.isAtFirstPage = true;
  }

  public show(): void {
    setTimeout(() => {
      this.contextMenuElement.classList.remove("hidden");
      this.setCoords();
    }, 50);
  }

  public hide(): void {
    this.contextMenuElement.classList.add("hidden");
    if (!this.isAtFirstPage) {
      this.goToFirstPage();
    }
  }

  public saveCellCoords(coords: cellCoords): void {
    this.cellCoords = coords;
  }

  private goToFirstPage(): void {
    const firstPageContent: HTMLElement = this.createFirstPageContent();
    this.togglePage(firstPageContent);
    this.isAtFirstPage = true;
  }

  private togglePage(pageContent: HTMLElement): void {
    const contextMenuContent: HTMLElement = this.contextMenuElement.querySelector(".cm__content");
    contextMenuContent.replaceWith(pageContent);
  }

  private render(): HTMLElement {
    const firstPageContent: HTMLElement = this.createFirstPageContent();
    const contextMenu: HTMLElement = create(
      "div", ["cm", "hidden"], [firstPageContent]
    );
    return contextMenu;
  }

  private setCoords(): void {
    const tableContainer: HTMLElement = this.contextMenuElement.closest(".tbl__container");
    const top: number = this.getTopCoord(tableContainer);
    const left: number = this.getLeftCoord(tableContainer);
    this.contextMenuElement.style.top = `${top}px`;
    this.contextMenuElement.style.left = `${left}px`;
  }

  private getTopCoord(tableContainer: HTMLElement): number {
    const containerTop: number = getCoords(tableContainer).top;
    const menuHeight: number = this.contextMenuElement.clientHeight;
    const menuBottomEdge: number = containerTop + this.cellCoords.top + menuHeight;
    const extraSpace: number = 20;
    if (menuBottomEdge + extraSpace >= window.innerHeight) {
      return this.cellCoords.top - menuHeight / 2;
    }
    return this.cellCoords.top;
  }

  private getLeftCoord(tableContainer: HTMLElement): number {
    const containerLeft: number = getCoords(tableContainer).left;
    const menuWidth: number = this.contextMenuElement.clientWidth;
    const menuRightEdge: number = containerLeft + this.cellCoords.right + menuWidth;
    const extraSpace: number = 20;
    if (menuRightEdge + extraSpace >= window.innerWidth) {
      return this.cellCoords.right - menuWidth - 40;
    }
    return this.cellCoords.right + 5;
  }

  private createFirstPageContent(): HTMLElement {
    const contextMenuItems: HTMLElement[] = this.createItems();
    return create("div", "cm__content", contextMenuItems);
  }

  private createItems(): HTMLElement[] {
    const deleteRowButton: HTMLElement = this.createMenuItem(
      "delete row",
      this.table.deleteRow.bind(this.table),
      trash
    );
    const deleteColButton: HTMLElement = this.createMenuItem(
      "delete column",
      this.table.deleteCol.bind(this.table),
      trash
    );
    const separator: HTMLElement = create("div", "separator");
    const addClassToTableButton: HTMLElement = this.createMenuItem(
      "add class to the table",
      this.customClassNameTable.goToInputPage.bind(this.customClassNameTable),
      plus
    );
    const addClassToCellsButton: HTMLElement = this.createMenuItem(
      "add class to selected cells",
      this.customClassNameCells.goToInputPage.bind(this.customClassNameCells),
      plus
    );
    return [addClassToTableButton, addClassToCellsButton, separator, deleteRowButton, deleteColButton];
  }

  private createMenuItem(
    text: string,
    onClickHandler: () => void,
    icon: string
  ): HTMLElement {
    const item: HTMLElement = create("div", "cm__item");
    item.innerHTML = icon;
    item.innerHTML += text;
    item.addEventListener("click", onClickHandler);
    return item;
  }
}