import { create } from "../../utils.ts";
import plusIcon from "../../img/plus.svg";

export interface IToolbarButton {
  updatePosition(coord: number): void;
  buttonElement: HTMLElement;
  rowNumber?: number;
  colNumber?: number;
}

abstract class ToolbarButton implements IToolbarButton {
  public buttonElement: HTMLElement;

  constructor(protected coord: number) {
    this.buttonElement = this.createButton();
    this.setPosition();
  }

  public updatePosition(coord: number): void {
    this.coord = coord;
    this.setPosition();
  }

  protected createButton(): HTMLElement {
    const plusButton = this.createPlusButton();
    return create(
      "div", "toolbar__insertion-button",
      [create("span", null, [], "●"), plusButton]
    );
  }

  protected createPlusButton() : HTMLElement {
    const button = create("div", "toolbar__plus-btn")
    button.innerHTML = plusIcon;
    return button;
  }

  protected abstract setPosition(): void;
}


export class VerticalButton extends ToolbarButton {
  public rowNumber: number

  constructor(coord: number, rowNumber: number) {
    super(coord);
    this.rowNumber = rowNumber;
  }

  protected setPosition(): void {
    this.buttonElement.style.top = `${this.coord - 12.5}px`;
  }
}


export class HorizontalButton extends ToolbarButton {
  public colNumber: number;

  constructor(coord: number, colNumber: number) {
    super(coord);
    this.colNumber = colNumber;
  }

  protected setPosition(): void {
    this.buttonElement.style.left = `${this.coord - 12.5}px`;
  }
}