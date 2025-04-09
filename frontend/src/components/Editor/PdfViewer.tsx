import React, { useEffect, useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

interface PdfViewerProps {
  fileUrl: string;
}

function PdfViewer(props: PdfViewerProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null); // Reference for the container

  useEffect(() => {
    const fetchAndRenderPdf = async () => {
      setLoading(true);
      setError(null);

      try {
        const fileUrl = props.fileUrl;
        
        // Fetch the file using your utility
        const fetchedFile = await fetch(fileUrl);

        if (!fetchedFile.ok) {
          setError('Failed to fetch the PDF file');
          setLoading(false);
          return;
        }

        const arrayBuffer = await fetchedFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

        console.log('Number of pages in PDF:', pdf.numPages); // Debug: Check the number of pages

        if (canvasRef.current) {
  
          canvasRef.current.innerHTML = '';

          // Render each page
          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 2});
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            if (context) {
              canvas.width = viewport.width +600;
              canvas.height = viewport.height;

              const renderContext = {
                canvasContext: context,
                viewport: viewport,
              };
              page.render(renderContext); // Render the page onto the canvas
              canvasRef.current.appendChild(canvas); // Append the canvas to the container
              setLoading(false);
            }
          }
        }
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('An error occurred while rendering the PDF.');
      }
    };

    fetchAndRenderPdf();
  }, [props.fileUrl]); // Run effect only when `fileUrl` changes

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Display loading and error messages */}
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* PDF rendered on canvas */}
      <div 
        ref={canvasRef}
        style={{
          display: 'flex',
          flexDirection: 'column',  
          width: '50%',
          height: '60vh',
          overflowY: 'scroll',
          padding: '10px',
        }}
      />
    </div>
  );
}

export default PdfViewer;
