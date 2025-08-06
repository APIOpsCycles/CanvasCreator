declare module "canvascreator" {
  export interface DefaultStyles {
    width: number;
    height: number;
    headerHeight: number;
    footerHeight: number;
    fontSize: number;
    fontFamily: string;
    backgroundColor: string;
    borderColor: string;
    fontColor: string;
    contentFontColor: string;
    highlightColor: string;
    sectionColor: string;
    padding: number;
    cornerRadius: number;
    circleRadius: number;
    lineSize: number;
    shadowColor: string;
    stickyNoteSize: number;
    stickyNoteSpacing: number;
    stickyNoteCornerRadius: number;
    maxLineWidth: number;
    stickyNoteColor: string;
    stickyNoteBorderColor: string;
    defaultLocale: string;
  }

  export function createCanvas(
    locale: string,
    canvasId: string,
    preserveContentData?: boolean
  ): void;

  export function loadCanvas(
    locale: string,
    canvasId: string,
    preserveContentData?: boolean
  ): void;

  export interface InitOptions {
    localeElement?: HTMLElement | null;
    canvasElement?: HTMLElement | null;
    canvasSelectorElement?: HTMLElement | null;
    canvasCreatorElement?: HTMLElement | null;
    toolsSelector?: string;
    assetBase?: string;
  }

  export function initCanvasCreator(options?: InitOptions): void;

  export function sanitizeInput(text: string): string;
  export function validateInput(text: string): string;
  export function distributeMissingPositions(
    content: any,
    canvasDef: any,
    styles?: DefaultStyles
  ): any;

  export const defaultStyles: DefaultStyles;

  const _default: {
    createCanvas: typeof createCanvas;
    loadCanvas: typeof loadCanvas;
    initCanvasCreator: typeof initCanvasCreator;
    sanitizeInput: typeof sanitizeInput;
    validateInput: typeof validateInput;
    distributeMissingPositions: typeof distributeMissingPositions;
    defaultStyles: DefaultStyles;
    ApiOpsCyclesMethodDataCanvasData: typeof import("/apiops-cycles-method-data/canvasData.json");
    ApiOpsCyclesMethodDataLocalizedData: typeof import("/apiops-cycles-method-data/localizedData.json");
  };
  export default _default;
}
