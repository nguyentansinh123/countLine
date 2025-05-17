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
  position: { x: number; y: number };
}

const ExtractImages = async (
  pdfBlob: Blob,
  pageNum: number = 1
): Promise<{ images: ProcessedImage[]; pdfUrl: string }> => {
  try {
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const pdfBytes = new Uint8Array(arrayBuffer);

    // Initialize PDF.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    const pdfJsDoc = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
    const page = await pdfJsDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });

    const opList = await page.getOperatorList();
    const images: ProcessedImage[] = [];

    for (let i = 0; i < opList.fnArray.length; i++) {
      if (opList.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
        try {
          const imgName = opList.argsArray[i][0];
          const img = await page.objs.get(imgName);

          if (img?.data && img.width && img.height) {
            // Draw to canvas
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas context not available');

            const imageData = new ImageData(
              new Uint8ClampedArray(img.data),
              img.width,
              img.height
            );
            ctx.putImageData(imageData, 0, 0);

            // Convert canvas to PNG blob
            const imgBlob: Blob = await new Promise((resolve) =>
              canvas.toBlob((blob) => resolve(blob!), 'image/png')
            );
            const originalUrl = URL.createObjectURL(imgBlob);

            // Get transformation values
            const [x, y, width, height] = opList.argsArray[i].slice(1);
            const transformedX = x * viewport.scale;
            const transformedY = (viewport.height - y - height) * viewport.scale;
            const transformedWidth = width * viewport.scale;
            const transformedHeight = height * viewport.scale;

            images.push({
              originalUrl,
              width: transformedWidth,
              height: transformedHeight,
              x: transformedX,
              y: transformedY,
              scaleX: width / img.width,
              scaleY: height / img.height,
              position: { x: transformedX, y: transformedY }
            });
          }
        } catch (error) {
          console.error('Error processing image:', error);
        }
      }
    }

    if (images.length === 0) {
      console.warn('No images found on page', pageNum);
      return { images: [], pdfUrl: '' };
    }

    // Create new PDF with embedded images
    const newPdfDoc = await PDFDocument.create();
    for (const image of images) {
      try {
        const imgData = await fetch(image.originalUrl).then((res) =>
          res.arrayBuffer()
        );
        const imgBytes = await newPdfDoc.embedPng(imgData);
        const page = newPdfDoc.addPage([image.width, image.height]);
        page.drawImage(imgBytes, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height
        });
      } catch (error) {
        console.error('Error embedding image:', error);
      }
    }

    const pdfBytesWithImages = await newPdfDoc.save();
    const pdfUrl = URL.createObjectURL(
      new Blob([pdfBytesWithImages], { type: 'application/pdf' })
    );

    return { images, pdfUrl };
  } catch (error) {
    console.error('PDF processing failed:', error);
    throw new Error(
      `Failed to extract images: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
};

export default ExtractImages;
