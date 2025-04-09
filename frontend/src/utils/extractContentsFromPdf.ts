import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?worker';
pdfjsLib.GlobalWorkerOptions.workerPort = new pdfjsWorker();

import extractTextFromPDF from './ExtractText';
import  extractImagesFromPDF  from './ExtractImages';

const extractContentsFromPDF = async (pdfBlob: Blob): Promise<string> => {
  let htmlContent = '';
  const blobUrls: string[] = [];

  try {
    const pdfData = await pdfBlob.arrayBuffer();
    const pdfDoc = await pdfjsLib.getDocument({ data: pdfData }).promise;
    const numPages = pdfDoc.numPages;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });

      let pageHtml = `
        <div class="page" 
             style="position: relative; 
                    width: ${viewport.width}px; 
                    height: ${viewport.height}px;
                    background: white;
                    margin: 20px auto;">
      `;

      // Extract and position images (bottom layer)
      try {
        const images = await extractImagesFromPDF(pdfBlob,pageNum); // Pass the Blob directly
        console.log(images);
      } catch (imgError) {
        console.error(`Images error page ${pageNum}:`, imgError);
      }

      // Extract and position text (top layer)
      try {
        const { html: textHtml } = await extractTextFromPDF(page);
        pageHtml += `
          <div style="position: relative; z-index: 1;">
            ${textHtml || ''}
          </div>
        `;
      } catch (textError) {
        console.error(`Text error page ${pageNum}:`, textError);
      }

      pageHtml += '</div><br/>';
      htmlContent += pageHtml;
    }

    return htmlContent;

  } catch (error) {
    // Cleanup any created blob URLs
    blobUrls.forEach(url => URL.revokeObjectURL(url));
    throw new Error(`PDF processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    // Always clean up the blob URLs
    blobUrls.forEach(url => URL.revokeObjectURL(url));
  }
};

export default extractContentsFromPDF;
