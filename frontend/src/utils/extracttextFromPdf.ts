// src/utils/extractTextFromPdf.ts
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?worker';

// Set the worker to use the imported worker
pdfjsLib.GlobalWorkerOptions.workerPort = new pdfjsWorker();

const extractTextAndImagesFromPDF = async (pdfUrl: string): Promise<string> => {
  const pdfDoc = await pdfjsLib.getDocument(pdfUrl).promise;
  let content = "";

  // Helper to check if a string might be a bullet point
  const isBulletPoint = (text: string) => /^[•\-\u2022]/.test(text);

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });
    const pageText = await page.getTextContent();
    content += `<div class="page-content" data-page-num="${pageNum}" style="padding: 10px;">`;

    let previousY: number | null = null;
    let isListOpen = false;
    let isTableOpen = false;
    let previousX: number | null = null;

    // Extract images if any
    const ops = await page.getOperatorList();
    const imageIndices = ops.fnArray
      .map((fn, index) => (fn === pdfjsLib.OPS.paintImageXObject ? index : -1))
      .filter(index => index !== -1);

    for (const index of imageIndices) {
      const img = await page.objs.get(ops.argsArray[index][0]);
      if (img) {
        const imgUrl = URL.createObjectURL(
          new Blob([img.data], { type: "image/png" })
        );
        content += `<img src="${imgUrl}" style="max-width: 100%; margin: 5px;" /><br />`;
      }
    }

    // Extract the text content and handle formatting
    pageText.items.forEach((item: any) => {
      const { str, transform, fontName } = item;
      const [x, y, , , , ty] = transform;

      // Handle line breaks
      if (previousY !== null && Math.abs(ty - previousY) > 5) {
        content += "<br />";
        previousX = null;
      }

      // Detect bullet points
      if (isBulletPoint(str) && !isListOpen) {
        content += "<ul>";
        isListOpen = true;
      } else if (!isBulletPoint(str) && isListOpen) {
        content += "</ul>";
        isListOpen = false;
      }

      // Detect tables based on consistent X-coordinate differences
      if (previousX !== null && Math.abs(x - previousX) > 50) {
        if (!isTableOpen) {
          content += "<table><tr>";
          isTableOpen = true;
        }
        content += "</tr><tr>";
      }

      // Close table if necessary
      if (isTableOpen && previousX !== null && Math.abs(x - previousX) <= 50) {
        content += "</tr></table>";
        isTableOpen = false;
      }

      // Apply basic styles: font, color
      const style = `font-family: ${fontName}; color: rgb(0, 0, 0);`;
      const formattedText = isBulletPoint(str) ? `<li>${str}</li>` : `<span style="${style}">${str}</span>`;

      content += formattedText;
      previousY = ty;
      previousX = x;
    });

    // Close any open list or table tags
    if (isListOpen) content += "</ul>";
    if (isTableOpen) content += "</tr></table>";

    content += "</div>";
  }

  return content;
};

export  default extractTextAndImagesFromPDF ;
