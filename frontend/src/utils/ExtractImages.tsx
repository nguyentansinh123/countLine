import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';

export interface ProcessedImage {
  originalUrl: string;
  width: number;
  height: number;
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
}

const ExtractImages = async (pdfBlob: Blob, pageNum: number = 1): Promise<ProcessedImage[]> => {
  const arrayBuffer = await pdfBlob.arrayBuffer();
  const pdfBytes = new Uint8Array(arrayBuffer);
  console.log(pdfBytes.slice(0, 100)); // Log first 100 bytes to check the PDF structure
  
  const images: ProcessedImage[] = [];
  
  // Configure PDF.js worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  
  // Load PDF using pdfjs-lib
  const pdfJsDoc = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
  const pdfLibDoc = await PDFDocument.load(pdfBytes);

  // Get the specific page
  const page = await pdfJsDoc.getPage(pageNum);
  const opList = await page.getOperatorList(); // Get the content operations (e.g., text, image, drawing)
  
  // Check for image operations in the operator list
  for (let i = 0; i < opList.fnArray.length; i++) {
    if (opList.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
      // Image found in the operator list
      const imgName = opList.argsArray[i][0]; // Image name (XObject reference)
      const img = await page.objs.get(imgName); // Get the image data
      
      if (img && img.data) {
        console.log(`Image found: ${imgName}`);
        
        // Create the image URL (for original image)
        const imgData = new Uint8Array(img.data);
        const isPng = imgData[0] === 0x89 && imgData[1] === 0x50 && imgData[2] === 0x4E && imgData[3] === 0x47; // PNG signature
        const mimeType = isPng ? 'image/png' : 'image/jpeg'; // Guess mime type
        const imgBlob = new Blob([imgData], { type: mimeType });
        const originalUrl = URL.createObjectURL(imgBlob);
        
        // Image positioning and scaling (from the operator list)
        const x = opList.argsArray[i][1];  // X position
        const y = opList.argsArray[i][2];  // Y position
        const width = opList.argsArray[i][3];  // Width
        const height = opList.argsArray[i][4];  // Height
        const scaleX = width / img.width;  // X scaling factor
        const scaleY = height / img.height;  // Y scaling factor
        
        // Create a ProcessedImage object
        images.push({
          originalUrl,
          width,
          height,
          x,
          y,
          scaleX,
          scaleY,
        });
      }
    }
  }

  if (images.length === 0) {
    console.log('No images found on this page.');
  }

  return images;
};

export default ExtractImages;
