import { create } from "../../utils.ts";
import chevronDown from "../../img/chevron-down.svg";

interface IToggleButton {
  render(): HTMLElement;
  show(): void;
  hide(): void;
}

export default class ToggleButton implements IToggleButton {
  private toggleButtonElement: HTMLElement;

  constructor(private contextMenu) {}

  public render(): HTMLElement {
    const button: HTMLElement = create("div", ["cm__open-btn", "hidden"]);
    button.innerHTML = chevronDown;
    this.toggleButtonElement = button;
    this.toggleButtonElement.addEventListener("click", this.toggleContextMenu.bind(this));
    return button;
  }

  public show(): void {
    this.contextMenu.hide();
    this.setCoords();
    this.toggleButtonElement.classList.remove("hidden");
  }

  public hide(): void {
    this.contextMenu.hide();
    this.toggleButtonElement.classList.add("hidden");
  }

  private setCoords(): void {
    const top: number = this.contextMenu.cellCoords.top + 10;
    const left: number = this.contextMenu.cellCoords.right - 30;
    this.toggleButtonElement.style.top = `${top}px`;
    this.toggleButtonElement.style.left = `${left}px`;
  }

  private toggleContextMenu(): void {
    if (this.isContextMenuOpen()) {
      this.contextMenu.hide();
      return;
    }
    this.contextMenu.show();
  }

  private isContextMenuOpen(): boolean {
    return !this.contextMenu.contextMenuElement.classList.contains("hidden");
  }
}