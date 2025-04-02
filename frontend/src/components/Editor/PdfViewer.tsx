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

        if (canvasRef.current) {
          canvasRef.current.innerHTML = ''; // Clear any previously rendered content

          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            if (context) {
              canvas.width = viewport.width;
              canvas.height = viewport.height;

              const renderContext = {
                canvasContext: context,
                viewport: viewport,
              };
              await page.render(renderContext).promise; // Render the page onto the canvas
              canvasRef.current.appendChild(canvas); // Append the canvas to the container
            }
          }
        }
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('An error occurred while rendering the PDF.');
      } finally {
        setLoading(false);
      }
    };

    fetchAndRenderPdf();
  }, [props.fileUrl]);

  return (
    <div>
      {/* Display loading and error messages */}
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* PDF rendered on canvas */}
      <div 
        ref={canvasRef}
        style={{
          width: '100%',
          height: '60vh',
          overflowY: 'scroll',
          border: '1px solid #ddd',
          padding: '10px',
        }}
      />
    </div>
  );
}

export default PdfViewer;
