import React, { useEffect, useState, useRef } from 'react';
import { fetchPdfFile } from '../../utils/fetchFile';
import * as pdfjsLib from 'pdfjs-dist';

interface PdfViewerProps {
  fileUrl: string;
}

function PdfViewer(props: PdfViewerProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAndRenderPdf = async () => {
      setLoading(true);
      setError(null);

      try {
        const fileUrl = props.fileUrl;
        const fetchedFile = await fetchPdfFile(fileUrl);

        if (!fetchedFile) {
          setError('Failed to fetch the PDF file');
          setLoading(false);
          return;
        }

        const arrayBuffer = await fetchedFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

        if (canvasRef.current) {
          canvasRef.current.innerHTML = '';
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
              await page.render(renderContext).promise;
              canvasRef.current.appendChild(canvas);
            }
          }
        }
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError('An error occurred while rendering the PDF.');
      } finally {
        setLoading(false);
      }
    };

    fetchAndRenderPdf();
  }, [props.fileUrl]);

  return (
    <div>
      
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div 
        ref={canvasRef}
        style={{ 
          width: '100%',
          height: '60vh',
          overflowY: 'scroll',
          border: '1px solid #ddd',
          padding: '10px'
        }}
      />
    </div>
  );
}

export default PdfViewer;
