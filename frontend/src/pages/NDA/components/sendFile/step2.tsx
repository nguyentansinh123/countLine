import React, { useState, useEffect, useRef } from 'react';
import {
  PDFDocument,
  rgb,
  StandardFonts,
  PDFFont,
  PDFPage,
  PDFImage,
} from 'pdf-lib';
import PdfEditor from '../../../../components/Editor/PdfEditor';

interface Step2Props {
  txtContent: string | null;
  userName: string;
  userEmail: string;
  file: any;
  userAdress: string;
  signedUrl: string;
}

const Step2: React.FC<Step2Props> = ({
  txtContent,
  userName,
  userEmail,
  file,
  userAdress,
  signedUrl,
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const signedUr = signedUrl;
  const modifyPdf = async () => {
    if (!file) return;

    try {
      const pdfBytes = await fetch(file.location).then((res) =>
        res.arrayBuffer()
      );
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const firstPage = pdfDoc.getPages()[0];
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const modifiedPdfBytes = await pdfDoc.save();
      const blobUrl = createBlobUrl(modifiedPdfBytes);
      setPdfUrl(blobUrl);
    } catch (error) {
      console.error('Error modifying PDF:', error);
    }
  };

  function createBlobUrl(modifiedPdfBytes: Uint8Array): string {
    const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  }

  return (
    <>
      <PdfEditor fileUrl={signedUr} />
    </>
  );
};

export default Step2;
