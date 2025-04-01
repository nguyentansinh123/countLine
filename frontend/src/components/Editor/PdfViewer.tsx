import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

interface PdfViewerProps {
  fileUrl: string; // The URL or path to the PDF
}

const PdfViewer: React.FC<PdfViewerProps> = ({ fileUrl }) => {
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fetch the PDF file and load it into pdfjsLib
  const fetchPdfFile = async (fileUrl: string): Promise<Response | null> => {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.statusText}`);
      
      console.log('Fetched PDF response:', response);  // Log the response to console
      return response;
    } catch (error) {
      console.error('Error fetching file:', error);
      setError('Failed to load PDF file');
      return null;
    }
  };

  const renderPage = (pageNum: number) => {
    if (!pdf || !canvasRef.current) return;

    pdf.getPage(pageNum).then((page) => {
      const context = canvasRef.current?.getContext('2d');
      if (!context || !canvasRef.current) return; // Add check to ensure canvasRef.current is not null
      
      // Get the scale based on the window size
      const scale = Math.min(
        window.innerWidth / page.getViewport({ scale: 1 }).width,  // Fit to width
        window.innerHeight / page.getViewport({ scale: 1 }).height // Fit to height
      );

      const viewport = page.getViewport({ scale });

      // Set canvas size
      canvasRef.current.height = viewport.height;
      canvasRef.current.width = viewport.width;

      // Render the page onto the canvas context
      page.render({
        canvasContext: context,
        viewport: viewport,
      });
    });
  };

  // Fetch and load the PDF when the component mounts
  useEffect(() => {
    const loadPdf = async () => {
      try {
        const response = await fetchPdfFile(fileUrl);
        if (!response) return; // If fetching fails, stop execution

        const arrayBuffer = await response.arrayBuffer();
        const pdfDocument = await pdfjsLib.getDocument(arrayBuffer).promise;
        setPdf(pdfDocument);
        setNumPages(pdfDocument.numPages);
      } catch (error) {
        console.error('Error loading PDF:', error);
        setError('Error loading PDF');
      }
    };

    loadPdf();
  }, [fileUrl]); // Re-run only when fileUrl changes

  // Re-render the page when pageNum changes
  useEffect(() => {
    if (pdf) {
      renderPage(pageNum);
    }
  }, [pageNum, pdf]); // Re-render when pageNum or pdf changes

  // Handle previous page
  const goToPrevPage = () => {
    if (pageNum > 1) {
      setPageNum(pageNum - 1);
    }
  };

  // Handle next page
  const goToNextPage = () => {
    if (pageNum < numPages) {
      setPageNum(pageNum + 1);
    }
  };

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message */}
      <p>
        Page {pageNum} of {numPages}
      </p>
      <canvas ref={canvasRef}></canvas>

      {/* Page navigation buttons */}
      <div>
        <button onClick={goToPrevPage} disabled={pageNum <= 1}>
          Previous
        </button>
        <button onClick={goToNextPage} disabled={pageNum >= numPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export default PdfViewer;
