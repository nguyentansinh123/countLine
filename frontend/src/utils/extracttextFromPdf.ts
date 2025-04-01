// src/utils/extractTextFromPdf.ts
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?worker';

// Set the worker to use the imported worker
pdfjsLib.GlobalWorkerOptions.workerPort = new pdfjsWorker();

export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const fileArrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(fileArrayBuffer).promise;

    let textContent = '';
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();

      const lines: string[] = [];
      let currentLine = '';
      let lastYPosition = -1;

      content.items.forEach((item: any) => {
        if (Math.abs(item.transform[5] - lastYPosition) < 10) {
          currentLine += item.str + ' ';
        } else {
          if (currentLine.trim() !== '') {
            lines.push(currentLine.trim());
          }
          currentLine = item.str + ' ';
        }
        lastYPosition = item.transform[5];
      });

      if (currentLine.trim() !== '') {
        lines.push(currentLine.trim());
      }

      textContent += lines.join('\n') + '\n\n';
    }

    return textContent;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
};
