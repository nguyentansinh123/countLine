import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import Toolbar from './components/TempToolbar';
import { InputBoxType } from './components/tempTypes';
import InputBox from './components/TempInputFields/TempInputBox';
import SignatureBox from './components/TempInputFields/TempSignaturBox';
import SelectText from './components/TempInputFields/TempSelectText';
import { useParams, useNavigate } from 'react-router-dom';
import { Mockdata } from '../Mocakdatat/mockdata';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?worker';
import GeneralLayout from '../../components/General_Layout/GeneralLayout';
import { message } from 'antd';
import axios from 'axios';

pdfjsLib.GlobalWorkerOptions.workerPort = new pdfjsWorker();

const TempEditor: React.FC<{}> = () => {
  const [loading, setLoading] = useState(true);
  const [pdfPages, setPdfPages] = useState<any[]>([]);
  const [inputBoxes, setInputBoxes] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [documentData, setDocumentData] = useState<any>(null);
  const [fileUrl, setFileUrl] = useState<string>('');
  const { user_id, file_id } = useParams();
  const navigate = useNavigate();
  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  const extractKeyFromUrl = (url: string) => {
    const u = new URL(url);
    return decodeURIComponent(u.pathname.slice(1)); // remove leading slash
  };
  useEffect(() => {
    console.log('TempEditor params:', { user_id, file_id });

    if (!file_id) {
      message.error('No document ID provided');
      navigate('/shared-documents');
      return;
    }

    const fetchDocument = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          `http://localhost:5001/api/document/singleTask/${file_id}`,
          { withCredentials: true }
        );

        console.log('Document data response:', response.data);

        if (!response.data || !response.data.success) {
          throw new Error('Failed to fetch document data');
        }

        const document = response.data.data;
        setDocumentData(document);

        // Choose latest revision if exists
        if (document.revisions && document.revisions.length > 0) {
          const sortedRevisions = [...document.revisions].sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );

          const latest = sortedRevisions[0];
          const rawKey = extractKeyFromUrl(latest.fileUrl);

          const presigned = await axios.get(
            `http://localhost:5001/api/document/sign-s3-url?key=${encodeURIComponent(rawKey)}`,
            { withCredentials: true }
          );
          setFileUrl(presigned.data.presignedUrl);
          if (presigned.data?.presignedUrl) {
            setFileUrl(presigned.data.presignedUrl);
          } else {
            message.warning(
              'Could not get latest revision URL, falling back to original'
            );
            const fallbackUrl = await axios.get(
              `http://localhost:5001/api/document/presigned-url/${file_id}`,
              { withCredentials: true }
            );
            setFileUrl(fallbackUrl.data.presignedUrl);
          }
        } else {
          // No revisions yet, get the original file
          const urlResponse = await axios.get(
            `http://localhost:5001/api/document/presigned-url/${file_id}`,
            { withCredentials: true }
          );
          setFileUrl(urlResponse.data.presignedUrl);
        }
      } catch (error) {
        console.error('Error fetching document:', error);
        message.error('Failed to load document. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [file_id, user_id, navigate]);


 useEffect(() => {
    const wrapper = canvasWrapperRef.current;
    if (!wrapper) return;

    const handleScroll = () => {
      const scrollTop = wrapper.scrollTop;
      let visible = 1;
      let offset = 0;

      for (const page of pdfPages) {
        const height = page.viewport.height + 20;
        if (scrollTop < offset + height) {
          visible = page.pageNum;
          break;
        }
        offset += height;
      }

      setCurrentPage(visible);
    };

    wrapper.addEventListener('scroll', handleScroll);
    return () => wrapper.removeEventListener('scroll', handleScroll);
  }, [pdfPages]);


  useEffect(() => {
    if (!fileUrl) return;

    const fetchAndRenderPdf = async () => {
      setLoading(true);
      try {
        const fetchedFile = await fetch(fileUrl);
        console.log('Fetched file response:', fetchedFile.status);

        if (!fetchedFile.ok) {
          throw new Error(
            `Failed to fetch PDF: ${fetchedFile.status} ${fetchedFile.statusText}`
          );
        }

        const arrayBuffer = await fetchedFile.arrayBuffer();
        const loadedPdf = await pdfjsLib.getDocument({ data: arrayBuffer })
          .promise;
        const pages: any[] = [];
        console.log('PDF loaded with', loadedPdf.numPages, 'pages');

        for (let pageNum = 1; pageNum <= loadedPdf.numPages; pageNum++) {
          console.log('Rendering page:', pageNum);
          const page = await loadedPdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.5 });

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          if (context) {
            await page.render({ canvasContext: context, viewport }).promise;
          }

          pages.push({ pageNum, canvas, viewport });
        }

        setPdfPages(pages);
        console.log('PDF rendering complete');
      } catch (err) {
        console.error('Error rendering PDF:', err);
        message.error('Failed to render document');
      } finally {
        setLoading(false);
      }
    };

    fetchAndRenderPdf();
  }, [fileUrl]);

  const addInputBox = (
    type: 'text' | 'number' | 'date' | 'signature' | 'selection'
  ) => {
    const page = pdfPages.find((p) => p.pageNum === currentPage);
    if (!page) return;

    const baseProps: InputBoxType = {
      id: `box-${Date.now()}`,
      type,
      pageNum: currentPage,
      x: page.viewport.width / 2 - 50,
      y: page.viewport.height / 2 - 15,
      width: type === 'signature' ? 200 : type === 'selection' ? 150 : 100,
      height: type === 'signature' ? 100 : type === 'selection' ? 80 : 30,
      value: '',
      placeholder: type === 'date' ? 'MM/DD/YYYY' : '',
      fontSize: 14,
      fontFamily: 'Arial',
      color: '#000000',
      textAlign: 'left',
      action: null,
    };

    setInputBoxes((prev) => [...prev, baseProps]);
    setSelectedBoxId(baseProps.id);
  };

  const updateInputBox = (id: string, updates: Partial<InputBoxType>) => {
    setInputBoxes((prev) =>
      prev.map((box) => (box.id === id ? { ...box, ...updates } : box))
    );
  };

  const deleteInputBox = (id: string) => {
    setInputBoxes((prev) => prev.filter((box) => box.id !== id));
    if (selectedBoxId === id) setSelectedBoxId(null);
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const fetchedFile = await fetch(fileUrl);
      const arrayBuffer = await fetchedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const scale = 1.5;

      // Process input boxes
    for (const box of inputBoxes) {
  try {
    const page = pdfDoc.getPage(box.pageNum - 1);
    const { width: pageWidth, height: pageHeight } = page.getSize();

    const validX = Number.isFinite(box.x) ? box.x : 0;
    const validY = Number.isFinite(box.y) ? box.y : 0;
    const validWidth = Number.isFinite(box.width)
      ? box.width
      : box.type === 'signature'
        ? 200
        : 100;
    const validHeight = Number.isFinite(box.height)
      ? box.height
      : box.type === 'signature'
        ? 100
        : 30;

    const pdfX = validX / scale;
    const pdfY = pageHeight - (validY + validHeight) / scale;
    const pdfW = validWidth / scale;
    const pdfH = validHeight / scale;

    if (box.type === 'signature' && box.value?.startsWith('data:image')) {
      const base64Data = box.value.split(',')[1];
      const byteString = atob(base64Data);
      const byteArray = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) {
        byteArray[i] = byteString.charCodeAt(i);
      }

      const image = box.value.startsWith('data:image/png')
        ? await pdfDoc.embedPng(byteArray)
        : await pdfDoc.embedJpg(byteArray);

      const imgAspectRatio = image.width / image.height;
      let drawWidth = pdfW;
      let drawHeight = drawWidth / imgAspectRatio;

      if (drawHeight > pdfH) {
        drawHeight = pdfH;
        drawWidth = drawHeight * imgAspectRatio;
      }

      page.drawImage(image, {
        x: pdfX,
        y: pdfY,
        width: drawWidth,
        height: drawHeight,
      });

    } else if (box.type === 'selection' && box.action) {
      const { rgb } = await import('pdf-lib');
      const tint =
        box.action === 'edit'
          ? rgb(1, 1, 0)           // yellow
          : box.action === 'remove'
          ? rgb(1, 0, 0)           // red
          : rgb(0.68, 0.85, 0.9);  // light blue

      // Draw translucent rectangle
      page.drawRectangle({
        x: pdfX,
        y: pdfY,
        width: pdfW,
        height: pdfH,
        color: tint,
        opacity: 0.3,
      });

      // Label the action
      page.drawText(box.action.toUpperCase(), {
        x: pdfX + 2,
        y: pdfY + 2,
        size: 10 / scale,
        font: helvetica,
        color: rgb(0, 0, 0),
      });

    } else if (box.value) {
      page.drawText(box.value, {
        x: pdfX,
        y: pdfY,
        size: (box.fontSize || 12) / scale,
        font: helvetica,
        color: rgb(0, 0, 0),
      });
    }

  } catch (error) {
    console.error(`Error processing box ${box.id}:`, error);
  }
}

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });

      const formData = new FormData();
      formData.append('file', blob, 'signed-document.pdf');

      const annotations = inputBoxes.map((box) => ({
        type: box.type,
        position: { x: box.x, y: box.y, page: box.pageNum },
        value: box.type === 'signature' ? 'signature-added' : box.value,
      }));

      formData.append('annotations', JSON.stringify(annotations));
      formData.append(
        'comments',
        JSON.stringify([
          {
            text: 'Document signed',
            timestamp: new Date().toISOString(),
          },
        ])
      );

      console.log('Saving document edit...');

      const saveResponse = await axios.post(
        `http://localhost:5001/api/document/save-edit/${file_id}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        }
      );

      console.log('Save response:', saveResponse.data);

      if (saveResponse.data.success) {
        message.success('Document saved successfully!');

        // Return to documents page
        navigate('/shared-documents');
      } else {
        message.error('Failed to save document. Please try again.');
      }
    } catch (err) {
      console.error('PDF save failed:', err);
      message.error('Failed to save document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !documentData) {
    return (
      <GeneralLayout title="Loading Document...">
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '80vh',
          }}
        >
          <div className="loading-indicator">Loading document...</div>
        </div>
      </GeneralLayout>
    );
  }

  if (!documentData) {
    return (
      <GeneralLayout title="Document Not Found">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Document Not Found</h2>
          <p>The document you're looking for could not be found.</p>
          <button onClick={() => navigate('/shared-documents')}>
            Return to Documents
          </button>
        </div>
      </GeneralLayout>
    );
  }

  return (
    <GeneralLayout title={documentData.name || 'Document Editor'} >
      <div style={{ display: 'flex' }}>
        <Toolbar
          addInputBox={addInputBox}
          addSignatureBox={() => addInputBox('signature')}
          handleSave={handleSave}
          selectedBoxId={selectedBoxId}
          inputBoxes={inputBoxes}
          updateInputBox={updateInputBox}
          addSelection={() => addInputBox('selection')}
        />

        <div
          ref={canvasWrapperRef}
          style={{
            height: '70vh',
            overflowY: 'auto',
            position: 'relative',
            backgroundColor: 'grey',
          }}
        >
          {pdfPages.map((page) => (
            <div
              key={page.pageNum}
              style={{ marginBottom: 20, position: 'relative' }}
            >
              <canvas
                ref={(el) => {
                  if (el) el.replaceWith(page.canvas);
                }}
              />
              {inputBoxes
                .filter((box) => box.pageNum === page.pageNum)
                .map((box) =>
                  box.type === 'signature' ? (
                    <SignatureBox
                      key={box.id}
                      id={box.id}
                      box={box}
                      canvasWrapperRef={canvasWrapperRef}
                      isActive={box.id === selectedBoxId}
                      onSave={(dataUrl: string) => {
                        setInputBoxes((prev) =>
                          prev.map((b) =>
                            b.id === box.id
                              ? { ...b, value: dataUrl } // Store in value instead of image
                              : b
                          )
                        );
                      }}
                      onDelete={() => deleteInputBox(box.id)}
                      onConfirm={(id, value) => {
                        setInputBoxes((prev) =>
                          prev.map((b) => (b.id === id ? { ...b, value } : b))
                        );
                      }}
                      onUpdatePosition={(id: string, x: number, y: number) => {
                        setInputBoxes((prev) =>
                          prev.map((b) => (b.id === id ? { ...b, x, y } : b))
                        );
                      }}
                      onUpdateSize={(
                        id: string,
                        width: number,
                        height: number
                      ) => {
                        setInputBoxes((prev) =>
                          prev.map((b) =>
                            b.id === id ? { ...b, width, height } : b
                          )
                        );
                      }}
                      width={100}
                      height={box.height}
                    />
                  ) : box.type === 'selection' ? (
                    <SelectText
                      key={box.id}
                      id={box.id}
                      x={box.x}
                      y={box.y}
                      width={box.width}
                      height={box.height}
                      canvasWrapperRef={canvasWrapperRef}
                      isActive={box.id === selectedBoxId}
                      action={box.action ?? null}
                      onConfirm={(id, action) =>
                        setInputBoxes((prev) =>
                          prev.map((b) => (b.id === id ? { ...b, action } : b))
                        )
                      }
                      onDelete={() => deleteInputBox(box.id)}
                      onUpdatePosition={(id, x, y) =>
                        setInputBoxes((prev) =>
                          prev.map((b) => (b.id === id ? { ...b, x, y } : b))
                        )
                      }
                      onUpdateSize={(id, width, height) =>
                        setInputBoxes((prev) =>
                          prev.map((b) =>
                            b.id === id ? { ...b, width, height } : b
                          )
                        )
                      }
                      onDoubleClick={setSelectedBoxId}
                    />
                  ) : (
                    <InputBox
                      key={box.id}
                      box={box}
                      canvasWrapperRef={canvasWrapperRef}
                      isActive={box.id === selectedBoxId}
                      onConfirm={(id, value) => {
                        setInputBoxes((prev) =>
                          prev.map((b) => (b.id === id ? { ...b, value } : b))
                        );
                      }}
                      onDelete={(id) => {
                        setInputBoxes((prev) =>
                          prev.filter((b) => b.id !== id)
                        );
                        if (selectedBoxId === id) setSelectedBoxId(null);
                      }}
                      onUpdatePosition={(id, x, y) =>
                        setInputBoxes((prev) =>
                          prev.map((b) => (b.id === id ? { ...b, x, y } : b))
                        )
                      }
                      onUpdateSize={(id, width, height) =>
                        setInputBoxes((prev) =>
                          prev.map((b) =>
                            b.id === id ? { ...b, width, height } : b
                          )
                        )
                      }
                      onDoubleClick={(id) => setSelectedBoxId(id)}
                    />
                  )
                )}
            </div>
          ))}
        </div>
      </div>
    </GeneralLayout>
  );
};

export default TempEditor;
