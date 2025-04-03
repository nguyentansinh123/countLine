import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?worker';
pdfjsLib.GlobalWorkerOptions.workerPort = new pdfjsWorker();

const extractTextAndImagesFromPDF = async (pdfBlob: Blob): Promise<string> => {
  const readBlobAsArrayBuffer = (blob: Blob): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject("Failed to read blob as ArrayBuffer");
        }
      };
      reader.onerror = () => reject("Error reading Blob as ArrayBuffer");
      reader.readAsArrayBuffer(blob);
    });
  };

  try {
    // Convert the Blob to ArrayBuffer
    const arrayBuffer = await readBlobAsArrayBuffer(pdfBlob);

    // Load the PDF document
    const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let content = "";

    // Loop through each page in the PDF
    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const viewport = page.getViewport({ scale: 1.0 });

      content += `<div class="page" data-page-num="${pageNum}">`;

      let currentLine = '';
      let lastY = -1;

      // Extract text content and group it by line
      textContent.items.forEach((item: any) => {
        // Check if the Y position is significantly different from the last one to create a new line
        if (lastY !== -1 && Math.abs(item.transform[5] - lastY) > 10) {
          if (currentLine.trim()) {
            content += `<p>${currentLine}</p>`; // Add the accumulated line as a paragraph
          }
          currentLine = ''; // Reset the current line
        }
        currentLine += item.str; // Append the current text item to the line
        lastY = item.transform[5]; // Update the last Y coordinate
      });

      // Add the final line after the loop
      if (currentLine.trim()) {
        content += `<p>${currentLine}</p>`;
      }

      // Extract images from the operator list
      const operatorList = await page.getOperatorList();

      const imagePromises = operatorList.fnArray.map(async (fn, idx) => {
        if (fn === pdfjsLib.OPS.paintImageXObject) {
          const image = operatorList.argsArray[idx][0]; // Image object reference
          const imageObj = await page.objs.get(image);

          if (imageObj) {
            // Ensure the image is fully loaded before processing
            if (imageObj.data) {
              const imgData = imageObj.data;
              const blob = new Blob([imgData], { type: 'image/jpeg' });
              const imgUrl = URL.createObjectURL(blob);
              
              // Add image to content
              content += `<img src="${imgUrl}" alt="Extracted Image" />`;
            }
          } else {
            console.warn(`Image object with id ${image} not resolved yet.`);
          }
        }
      });

      // Wait for all image extraction to complete
      await Promise.all(imagePromises);

      content += "</div>"; // Close the page div
    }

    return content;

  } catch (error) {
    console.error("Error extracting content from PDF:", error);
    throw error;
  }
};

export default extractTextAndImagesFromPDF;
