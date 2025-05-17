// PdfViewer.tsx
import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

interface PdfViewerProps {
  fileUrl: string;
  onPageRender?: (pageNum: number, pageWrapper: HTMLDivElement) => void;
  height: string;
  width: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({
  fileUrl,
  onPageRender,
  height,
  width,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef<string | null>(null);

  useEffect(() => {
    if (hasFetchedRef.current === fileUrl) return;
    hasFetchedRef.current = fileUrl;

    const fetchAndRender = async () => {
      setLoading(true);
      setError(null);

      try {
        const fetched = await fetch(fileUrl);
        if (!fetched.ok) {
          throw new Error(
            `Failed to fetch PDF: ${fetched.status} ${fetched.statusText}`
          );
        }

        const arrayBuffer = await fetched.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        if (containerRef.current) containerRef.current.innerHTML = '';

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.25 });

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) continue;

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({ canvasContext: ctx, viewport }).promise;

          const pageWrapper = document.createElement('div');
          Object.assign(pageWrapper.style, {
            position: 'relative',
            margin: '10px 0',
            display: 'block',
            width: `${canvas.width}px`,
            height: `${canvas.height}px`,
          });
          pageWrapper.className = 'pageWrapper';
          pageWrapper.appendChild(canvas);
          containerRef.current?.appendChild(pageWrapper);

          if (onPageRender) onPageRender(pageNum, pageWrapper);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load PDF.');
        setLoading(false);
      }
    };

    fetchAndRender();
  }, [fileUrl, onPageRender]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div
        ref={containerRef}
        style={{
          height,
          width,
          overflowY: 'scroll',
          background: '#f9f9f9',
          padding: '10px',
          border: '1px solid #ccc',
        }}
      />
    </div>
  );
};

export default PdfViewer;
