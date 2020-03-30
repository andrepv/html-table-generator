import { create } from "../../utils.ts";
import * as alertify from "alertifyjs";
import arrowLeft from "../../img/arrow-left.svg";
import x from "../../img/x.svg";

interface ICustomClassName {
  goToInputPage(): void;
}

abstract class CustomClassName implements ICustomClassName {
  protected classNames: string[];
  protected inputField: HTMLInputElement;
  protected container: HTMLElement;
  protected inputFieldShouldBeEmpty: boolean;

  constructor(protected table) {
    this.classNames = [];
    this.inputFieldShouldBeEmpty = false;
  }

  public goToInputPage(): void {
    const inputPageContent: HTMLElement = this.createInputPageContent();
    this.table.contextMenu.togglePage(inputPageContent);

    this.table.contextMenu.show();
    this.inputField.focus();
    this.table.contextMenu.isAtFirstPage = false;
  }

  protected createInputPageContent(): HTMLElement {
    this.createContainer();
    const backButton: HTMLElement = this.createBackButton();
    const pageContent: HTMLElement = create(
      "div", ["cm__content", "cm__content_input"],
      [backButton, this.container]
    );
    return pageContent;
  }

  protected createBackButton(): HTMLElement {
    const backButton: HTMLElement = create("div", "cm__item");
    backButton.innerHTML = `${arrowLeft} Enter the Class Names`;
    backButton.addEventListener("click", () => {
      this.table.contextMenu.goToFirstPage();
      this.table.contextMenu.show();
    });
    return backButton;
  }

  protected createContainer(): void {
    const inputField: string = `
      <input
        type="text"
        placeholder="Use a Comma to Separate Values"
      >
    `;
    this.container = create("div", "cm__input", [], inputField);
    this.inputField = this.container.querySelector("input");
    this.fillContainer();
    this.attachEventHandlers();
  }

  protected attachEventHandlers(): void {
    this.inputField.addEventListener("keydown", this.handleKeyDown.bind(this));
    this.inputField.addEventListener("keyup", this.handleKeyUp.bind(this));
  }

  protected handleKeyDown(event: KeyboardEvent): void {
    if ((event.code === "Comma" || event.code === "Space") && this.inputField.value.length) {
      this.addClass(this.inputField.value.toString())
      this.inputFieldShouldBeEmpty = true;
    }
  }

  protected handleKeyUp(): void {
    if (this.inputFieldShouldBeEmpty) {
      this.clearInputField();
    }
  }

  protected clearInputField(): void {
    this.inputField.value = "";
    this.inputField.focus();
    this.inputFieldShouldBeEmpty = false;
  }

  protected addClass(className: string): void {
    const correctClassName: RegExp = /^-?[_a-zA-Z]+[_a-zA-Z0-9-]*$/gi;
    if (!correctClassName.test(className)) {
      alertify.set('notifier','position', 'top-left');
      alertify.message('Incorrect Class Name');
      return;
    }
    this.classNames.push(className);
    this.addLabel(className);
    this.addClassToElement(className)
  }

  protected addLabel(text: string): void {
    const label: HTMLElement = create("span", "cm__label");
    label.innerHTML = text;

    const deleteButton: HTMLElement = create("span", "cm__delete-label-btn");
    deleteButton.innerHTML = x;
    deleteButton.addEventListener("click", this.deleteLabel.bind(this));

    label.append(deleteButton);
    this.container.insertBefore(label, this.inputField);
  }

  protected deleteLabel(event: MouseEvent): void {
    const target: HTMLElement = <HTMLElement>event.target;
    const label: HTMLElement = target.closest(".cm__label");
    const labelText: string = label.textContent;
    this.classNames = this.classNames.filter(className => {
      return className !== labelText;
    });
    this.removeClassFromElement(labelText);
    label.remove();
    this.inputField.focus();
  }

  protected abstract fillContainer(): void;
  protected abstract addClassToElement(className: string): void;
  protected abstract removeClassFromElement(className: string): void
}

export class CustomClassNameTable extends CustomClassName {
  constructor(table) {
    super(table);
  }

  protected fillContainer(): void {
    if (this.classNames.length) {
      for (let className of this.classNames) {
        this.addLabel(className);
      }
    }
  }

  protected addClassToElement(className: string): void {
    this.table.tableUI.tableElement.classList.add(className);
  }

  protected removeClassFromElement(className: string): void {
    this.table.tableUI.tableElement.classList.remove(className);
  }
}

export class CustomClassNameCells extends CustomClassName {
  constructor(table) {
    super(table);
  }

  protected fillContainer(): void {
    const commonClassNames: string[] = this.getCommonClassNames();
    if (commonClassNames.length) {
      for (let className of commonClassNames) {
        this.addLabel(className);
      }
    }
  }

  private getCommonClassNames(): string[] {
    const classNames: string[] = this.getClassNamesOfSelectedCells();
    const commonClassNames: string[] = [];
    if (!classNames[0].length) {
      return commonClassNames;
    }
    if (classNames.length === 1) {
      return [...classNames[0]];
    }
    for (let className of classNames[0]) {
      if (this.isClassNameCommon(className, classNames)) {
        commonClassNames.push(className)
      }
    }
    return commonClassNames;
  }

  private getClassNamesOfSelectedCells(): string[] {
    return this.table.cellsSelection.selectedCells.map(cell => {
      return [...cell.classList]
    })
  }

  private isClassNameCommon(className: string, classNames: string[]): boolean {
    for(let i = 1; i < classNames.length; i++) {
      if (!(classNames[i].includes(className) && classNames[i].length)) {
        return false;
      }
    }
    return true;
  }

  protected addClassToElement(className: string): void {
    for (let selectedCell of this.table.cellsSelection.selectedCells) {
      selectedCell.classList.add(className);
    }
  }

  protected removeClassFromElement(className: string): void {
    for (let selectedCell of this.table.cellsSelection.selectedCells) {
      selectedCell.classList.remove(className);
      if (!selectedCell.classList.length) {
        selectedCell.removeAttribute("class");
      }
    }
  }
}