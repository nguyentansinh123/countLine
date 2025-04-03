import determineHtmlElementType from "./determineHtmlElementsType";
import * as pdfjsLib from 'pdfjs-dist';


import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?worker';

// Process a single PDF item (could be text, image, etc.)
export const processPdfItem = async (fn: any, args: any[], page: any): Promise<string> => {
    let result = "";
  
    // Filter out irrelevant operations
    const relevantFns = [pdfjsLib.OPS.showText, pdfjsLib.OPS.paintImageXObject];
  
    if (!relevantFns.includes(fn)) {
      return ""; // Ignore non-relevant operations
    }
  
    for (let i = 0; i < args.length; i++) {
      const blob = args[i];
      const elementType = determineHtmlElementType(blob); 
  
      switch (elementType) {
        case "img":
          result += await processImage(blob); 
          break;
        case "text":
          result += processText(blob); 
          break;
        case "span":
          result += processSpan(blob); 
          break;
        case "ul":
          result += processList(blob); 
          break;
        case "div":
          result += processObject(blob); 
          break;
        case "new line":
          result += "<br>"; 
          break;
        default:
          result += `<div>Unsupported content: ${JSON.stringify(blob)}</div>`;
          break;
      }
    }
  
    return result;
  };
  

// Process image data into HTML <img> tag
const processImage = async (imageData: Uint8Array): Promise<string> => {
  const blob = new Blob([imageData], { type: "image/png" }); // Assuming PNG format
  const url = URL.createObjectURL(blob);
  return `<img src="${url}" alt="Embedded Image" />`; // Return image as <img> tag
};

// Process text into HTML <p> tag
const processText = (text: string): string => {
  return `<p>${text}</p>`; // Wrap text in paragraph tag
};

// Process span (inline content)
const processSpan = (data: string): string => {
  return `<span>${data}</span>`; // Wrap inline content in <span> tag
};

// Process unordered list
const processList = (items: any[]): string => {
  let listItems = items.map((item) => `<li>${item}</li>`).join('');
  return `<ul>${listItems}</ul>`; // Wrap items in unordered list
};

// Process complex object (fallback for unknown content)
const processObject = (object: any): string => {
  return `<div>${JSON.stringify(object, null, 2)}</div>`; // General fallback for objects
};

export { processImage, processText, processSpan, processList, processObject };
