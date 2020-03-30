import {
  VerticalToolbar,
  HorizontalToolBar,
  IToolbar
} from "./toolBar.ts";
import {
  VerticalLine,
  HorizontalLine,
  IHighlightingLine
} from "./highlightingLine.ts";
import { getPosition } from "../../utils.ts";

interface IToolbars {
  verticalToolBar: IToolbar;
  horizontalToolBar: IToolbar;
  verticalLine: IHighlightingLine;
  horizontalLine: IHighlightingLine;
  appendToolbarsToContainer(container: HTMLElement): void;
  renderHighlightingLines(): HTMLElement[];
  showToolbars(): void;
  hideToolbars(): void;
  attachEventHandlers(): void;
}

export default class Toolbars implements IToolbars {
  public verticalToolBar: IToolbar;
  public horizontalToolBar: IToolbar;
  public verticalLine: IHighlightingLine;
  public horizontalLine: IHighlightingLine;
  private currentToolbarButton: HTMLElement;

  constructor(private table) {
    this.verticalToolBar = new VerticalToolbar();
    this.horizontalToolBar = new HorizontalToolBar();
    this.verticalLine = new VerticalLine();
    this.horizontalLine = new HorizontalLine();
  }

  public appendToolbarsToContainer(container: HTMLElement): void {
    const verticalToolBar: HTMLElement = this.verticalToolBar.render(
      this.table.tableUI.rows
    );
    const horizontalToolBar: HTMLElement = this.horizontalToolBar.render(
      this.table.tableUI.cols
    );
    container.append(verticalToolBar);
    container.append(horizontalToolBar);
  }

  public renderHighlightingLines(): HTMLElement[] {
    const horizontalLine: HTMLElement = this.horizontalLine.render();
    const verticalLine: HTMLElement = this.verticalLine.render();
    return [horizontalLine, verticalLine];
  }

  public showToolbars(): void {
    this.verticalToolBar.show();
    this.horizontalToolBar.show();
  }

  public hideToolbars(): void {
    this.verticalToolBar.hide();
    this.horizontalToolBar.hide();
  }

  public attachEventHandlers(): void {
    this.attachEventHandlersToVerticalToolBar();
    this.attachEventHandlersToHorizontalToolBar();
  }

  private attachEventHandlersToVerticalToolBar(): void {
    this.verticalToolBar.toolbarElement.addEventListener("mouseover", event => {
      this.showHorizontalLine(event);
    });
    this.verticalToolBar.toolbarElement.addEventListener("mouseout", event => {
      this.hideHorizontalLine(event);
    });
    this.verticalToolBar.toolbarElement.addEventListener("click", event => {
      this.handleToolbarClick(event);
      this.table.addRow(event);
    });
  }

  private attachEventHandlersToHorizontalToolBar(): void {
    this.horizontalToolBar.toolbarElement.addEventListener("mouseover", event => {
      this.showVerticalLine(event);
    });
    this.horizontalToolBar.toolbarElement.addEventListener("mouseout", event => {
      this.hideVerticalLine(event);
    });
    this.horizontalToolBar.toolbarElement.addEventListener("click", event => {
      this.handleToolbarClick(event);
      this.table.addCol(event);
    });
  }

  private showHorizontalLine(event): void {
    this.showLine(event, this.horizontalLine, "top");
  }

  private showVerticalLine(event): void {
    this.showLine(event, this.verticalLine, "left");
  }

  private hideHorizontalLine(event): void {
    this.hideLine(event, this.horizontalLine);
  }

  private hideVerticalLine(event): void {
    this.hideLine(event, this.verticalLine);
  }

  private showLine(event: MouseEvent, line: IHighlightingLine, side: string): void {
    if (this.currentToolbarButton) return;
    const toolbarButton: HTMLElement = (<HTMLElement>event.target).closest(".toolbar__insertion-button");
    if (!toolbarButton) return;
    this.currentToolbarButton = toolbarButton;
    const toolbarButtonCoord: number = getPosition(this.currentToolbarButton)[side];
    line.showAt(toolbarButtonCoord + 11.5);
  }

  private hideLine(event: MouseEvent, line: IHighlightingLine): void {
    if (!this.currentToolbarButton) return;
    let relatedTarget: Node = <Node>event.relatedTarget;
    while (relatedTarget) {
      if (relatedTarget == this.currentToolbarButton) return;
      relatedTarget = relatedTarget.parentNode;
    }
    this.currentToolbarButton = null;
    line.hide();
  }

  private handleToolbarClick(event: MouseEvent): void {
    const target: HTMLElement = <HTMLElement>event.target;
    if (!target.classList.contains("toolbar")) return;
    this.table.selectFirstCell();
  }
}