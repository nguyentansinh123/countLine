// src/utils/extractTextAndImagesFromPDF.ts
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?worker';
import { processPdfItem } from './ProcessPdfItem'; // Importing the helper function

// Set the worker to use the imported worker
pdfjsLib.GlobalWorkerOptions.workerPort = new pdfjsWorker();

const extractTextAndImagesFromPDF = async (pdfUrl: string): Promise<string> => {
  const pdfDoc = await pdfjsLib.getDocument(pdfUrl).promise;
  let content = "";

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const ops = await page.getOperatorList();
    const pageText = await page.getTextContent();
    content += `<div class="page-content" data-page-num="${pageNum}" style="padding: 10px;">`;

    // Process images and text items
    for (let i = 0; i < ops.fnArray.length; i++) {
      const fn = ops.fnArray[i];
      const args = ops.argsArray[i];
      const result = await processPdfItem(fn, args, page);  // Handle item based on its type
      content += result;  // Append result to the content
    }

    // Process text content as fallback
    pageText.items.forEach((item: any) => {
      const result = processPdfItem('text', item, page);
      content += result;  // Append formatted text result
    });

    content += "</div>";
  }

  return content;
};

export default extractTextAndImagesFromPDF;
