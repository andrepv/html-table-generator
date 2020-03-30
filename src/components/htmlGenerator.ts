import * as pretty from "pretty";
import * as alertify from "alertifyjs";
import code from "../img/code.svg";
import { create } from "../utils.ts";

interface IHtmlGenerator {
  appendButtonToDocument(): void
}

export default class HtmlGenerator implements IHtmlGenerator {
  private tableElementClone: Node

  constructor(private tableElement: HTMLElement) {}

  public appendButtonToDocument(): void {
    const button: HTMLElement = create("button", "generate-html-btn");
    button.innerHTML = code;
    button.addEventListener("click", this.generateHtml.bind(this));
    document.body.append(button);
  }

  private generateHtml(): void {
    this.prepareTableHTML();
    this.copyHTMLToClipboard();
    this.notifySuccess();
  }

  private prepareTableHTML(): void {
    this.tableElementClone = this.tableElement.cloneNode(true);
    this.deleteDefaultClasses();
    this.deleteCellsChildNodes();
  }

  private deleteCellsChildNodes(): void {
    const cellsTextContainers: NodeListOf<Element> = (<HTMLElement>this.tableElementClone)
      .querySelectorAll(".tbl__area");
    for(let textContainer of cellsTextContainers) {
      const cell: HTMLTableCellElement = textContainer.closest("td");
      this.moveCellTextToParentNode(textContainer, cell);
      textContainer.remove();
      this.deleteResizer(cell);
    }
  }

  private deleteDefaultClasses(): void {
    const tableElement: HTMLElement = (<HTMLElement>this.tableElementClone);
    if (tableElement.classList.contains("tbl")) {
      tableElement.classList.remove("tbl");
      if (!tableElement.classList.length) {
        (<HTMLElement>tableElement).removeAttribute("class");
      }
    }
  }

  private moveCellTextToParentNode(textContainer: Element, parentNode: HTMLTableCellElement): void {
    for (let child of textContainer.childNodes) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const br: HTMLElement = create("br");
        parentNode.append(br);
      }
      parentNode.append(child.textContent);
    }
  }

  private deleteResizer(cell: HTMLTableCellElement): void {
    const resizer: HTMLElement = cell.querySelector(".tbl__resizer");
    resizer?.remove();
  }

  private copyHTMLToClipboard(): void {
    const tableHTML: string = (<HTMLElement>this.tableElementClone).outerHTML;
    const textarea: HTMLTextAreaElement = document.createElement('textarea');
    textarea.value = pretty(tableHTML);
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  private notifySuccess(): void {
    alertify.set('notifier','position', 'top-left');
    alertify.message('HTML code copied to clipboard');
  }
}