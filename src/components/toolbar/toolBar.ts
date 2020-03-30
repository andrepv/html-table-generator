import {
  VerticalButton,
  HorizontalButton,
  IToolbarButton,
} from "./toolBarButton.ts";
import { create } from "../../utils.ts";

type row = { rowHeight: number }
type col = { colWidth: number }
type rowsOrCols = row[] | col[];

export interface IToolbar {
  toolbarElement: HTMLElement;
  render(rowsOrCols: rowsOrCols): HTMLElement;
  update(rowsOrCols: rowsOrCols): void;
  show(): void;
  hide(): void;
  updateButtonsPosition(rowsOrCols: rowsOrCols): void;
  getButtonRow?(buttonElement: HTMLElement): number;
  getButtonCol?(buttonElement: HTMLElement): number;
}

abstract class Toolbar implements IToolbar {
  public toolbarElement: HTMLElement;
  protected buttons: IToolbarButton[];
  protected buttonPosition: number;
  protected toolbarClasses: string[];

  constructor() {
    this.buttons = [];
    this.buttonPosition = 0;
    this.toolbarClasses = [];
  }

  public render(rowsOrCols: rowsOrCols): HTMLElement {
    this.buttons = this.getButtons(rowsOrCols);

    const buttonElements: HTMLElement[] = this.getButtonElements();
    const toolbar: HTMLElement = create(
      "div", this.toolbarClasses,
      [create("div", "toolbar__content", buttonElements)]
    );
    this.toolbarElement = toolbar;
    return toolbar;
  }

  public update(rowsOrCols: rowsOrCols): void {
    this.buttons = this.getButtons(rowsOrCols);

    const buttonElements: HTMLElement[] = this.getButtonElements();
    const content: HTMLElement = create(
      "div", "toolbar__content", buttonElements
    );
    this.toolbarElement.querySelector(".toolbar__content").replaceWith(content);
  }

  public show(): void {
    this.toolbarElement.classList.remove("hidden");
  }

  public hide(): void {
    this.toolbarElement.classList.add("hidden");
  }

  public updateButtonsPosition(rowsOrCols: rowsOrCols): void {
    for (let i = 0; i < rowsOrCols.length + 1; i++) {
      this.buttons[i].updatePosition(this.buttonPosition);
      this.increaseButtonIndent(rowsOrCols[i]);
    }
    this.buttonPosition = 0;
  }

  protected getButtonElements(): HTMLElement[] {
    return this.buttons.map(button => {
      return button.buttonElement;
    })
  }

  protected findButton(element: HTMLElement): IToolbarButton {
    return this.buttons.find(button => {
      return button.buttonElement === element;
    });
  }

  protected getButtons(rowsOrCols: rowsOrCols): IToolbarButton[] {
    const buttons: IToolbarButton[] = [];
    for (let i = 0; i < rowsOrCols.length + 1; i++) {
      buttons.push(this.createButton(i));
      this.increaseButtonIndent(rowsOrCols[i]);
    }
    this.buttonPosition = 0;
    return buttons;
  }

  protected abstract increaseButtonIndent(rowOrCol: row | col): void;
  protected abstract createButton(rowOrColNumber: number): IToolbarButton;
}


export class VerticalToolbar extends Toolbar {
  constructor() {
    super();
    this.toolbarClasses = ["toolbar", "toolbar_v", "hidden"];
  }

  public getButtonRow(buttonElement: HTMLElement): number {
    const button: IToolbarButton = this.findButton(buttonElement);
    return button ? button.rowNumber : -1;
  }

  protected createButton(rowNumber: number): IToolbarButton {
    const button: VerticalButton = new VerticalButton(this.buttonPosition, rowNumber);
    return button;
  }

  protected increaseButtonIndent(row: row): void {
    this.buttonPosition += row ? row.rowHeight : 0;
  }
}


export class HorizontalToolBar extends Toolbar {
  constructor() {
    super();
    this.toolbarClasses = ["toolbar", "toolbar_h", "hidden"];
  }

  public getButtonCol(buttonElement: HTMLElement): number {
    const button: IToolbarButton = this.findButton(buttonElement);
    return button ? button.colNumber : -1;
  }

  protected createButton(colNumber: number): IToolbarButton {
    const button: HorizontalButton = new HorizontalButton(this.buttonPosition, colNumber);
    return button;
  }

  protected increaseButtonIndent(col: col): void {
    this.buttonPosition += col ? col.colWidth : 0;
  }
}