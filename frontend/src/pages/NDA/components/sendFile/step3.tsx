import React, { useState, useEffect, useRef } from 'react';
import { PDFDocument, rgb, StandardFonts, PDFFont, PDFPage, PDFImage } from 'pdf-lib';

interface Step3Props {
  txtContent: string | null;
  userName: string;
  userEmail: string;
  file: any;
  userAdress: string;
}

const Step3: React.FC<Step3Props> = ({
  txtContent,
  userName,
  userEmail,
  file,
  userAdress,
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [uploadedSignature, setUploadedSignature] = useState<string | null>(null);
  const [drawnSignature, setDrawnSignature] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef<boolean>(false);

  useEffect(() => {
    if (file) {
      modifyPdf();
    }
  }, [file, userName, userEmail, uploadedSignature, drawnSignature, userAdress]);

  const handleUploadSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedSignature(reader.result as string);
        setDrawnSignature(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const saveCanvasSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataURL = canvas.toDataURL('image/png');
      setDrawnSignature(dataURL);
      setUploadedSignature(null);
    }
  };

  const modifyPdf = async () => {
    if (!file) return;

    try {
      const pdfBytes = await fetch(file.location).then((res) => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const firstPage = pdfDoc.getPages()[0];
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const placeholderCoords = getPlaceholderCoordinates(firstPage);
      const replacementValues = getReplacementValues(userName, userAdress);
      drawTextOnPdf(firstPage, placeholderCoords, replacementValues, font);
      await addSignatureToPdf(pdfDoc, firstPage);

      const modifiedPdfBytes = await pdfDoc.save();
      const blobUrl = createBlobUrl(modifiedPdfBytes);
      setPdfUrl(blobUrl);
    } catch (error) {
      console.error('Error modifying PDF:', error);
    }
  };

  const getPlaceholderCoordinates = (page: PDFPage): { [key: string]: { x: number; y: number } } => {
    const { height } = page.getSize();
    return {
      '<<EMPLOYEE_NAME>>': { x: 150, y: height - 120 },
      '<<EMPLOYEE_ADDRESS>>': { x: 150, y: height - 140 },
    };
  };

  const getReplacementValues = (contractorName: string, contractorAddress: string) => {
    return {
      '<<EMPLOYEE_NAME>>': contractorName,
      '<<EMPLOYEE_ADDRESS>>': contractorAddress,
    };
  };

  const drawTextOnPdf = (
    page: PDFPage,
    coordsMap: { [key: string]: { x: number; y: number } },
    values: any,
    font: PDFFont
  ) => {
    Object.entries(coordsMap).forEach(([placeholder, coords]) => {
      const value = values[placeholder];
      page.drawText(value, {
        x: coords.x,
        y: coords.y,
        size: 10,
        font,
        color: rgb(0, 0, 0),
      });
    });
  };

  const addSignatureToPdf = async (pdfDoc: PDFDocument, page: PDFPage) => {
    let signatureDataUrl = uploadedSignature || drawnSignature;
    if (!signatureDataUrl) return;

    const signatureBytes = await fetch(signatureDataUrl).then((res) => res.arrayBuffer());
    const signatureImage: PDFImage = await pdfDoc.embedPng(signatureBytes);
    const dims = signatureImage.scale(0.5);

    page.drawImage(signatureImage, {
      x: 100,
      y: 100,
      width: dims.width,
      height: dims.height,
    });
  };

  const createBlobUrl = (bytes: Uint8Array) => {
    const blob = new Blob([bytes], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      isDrawing.current = true;
      ctx.beginPath();
      const rect = canvas.getBoundingClientRect();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      const rect = canvas.getBoundingClientRect();
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    }
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  return (
    <div>
      <h3 style={{ marginBottom: 8 }}>Editable Document Area</h3>
      <div
        contentEditable
        suppressContentEditableWarning
        style={{
          border: '1px solid #ccc',
          padding: '15px',
          minHeight: '300px',
          background: '#fefefe',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
        dangerouslySetInnerHTML={{ __html: txtContent || '' }}
      />

      <div style={{ marginTop: 24 }}>
        <h3>Upload Signature</h3>
        <input type="file" accept="image/*" onChange={handleUploadSignature} />
        {uploadedSignature && (
          <img src={uploadedSignature} alt="Uploaded Signature" style={{ marginTop: 10, height: 100 }} />
        )}
      </div>

      <div style={{ marginTop: 32 }}>
        <h3>Or Draw Signature</h3>
        <canvas
          ref={canvasRef}
          width={400}
          height={150}
          style={{ border: '1px solid #ccc', borderRadius: 6 }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        <div style={{ marginTop: 10 }}>
          <button onClick={saveCanvasSignature}>Save Signature</button>
          <button onClick={clearCanvas} style={{ marginLeft: 10 }}>
            Clear
          </button>
        </div>
        {drawnSignature && <img src={drawnSignature} alt="Drawn Signature" style={{ marginTop: 10, height: 100 }} />}
      </div>

      {pdfUrl && (
        <div style={{ marginTop: 40 }}>
          <h3>Modified PDF Preview</h3>
          <iframe src={pdfUrl} width="100%" height="500px" title="PDF Preview" />
        </div>
      )}
    </div>
  );
};

export default Step3;