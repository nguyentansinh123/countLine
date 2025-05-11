export interface PdfPage {
    canvas: HTMLCanvasElement;
    pageNum: number;
    viewport: any;
  }

  export interface InputBoxType {
    id: string;
    pageNum: number;
    type: 'text' | 'number' | 'date'| 'signature' ;
    x: number;
    y: number;
    width: number;
    height: number;
    value: string | undefined;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    textAlign?: 'left' | 'center' | 'right';
    placeholder?: string;
    isConfirmed?: boolean;

    image?: string | null
  }
