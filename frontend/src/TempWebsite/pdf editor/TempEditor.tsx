import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import Toolbar from './components/TempToolbar';
import { InputBoxType } from './components/tempTypes';
import InputBox from './components/TempInputFields/TempInputBox';
import SignatureBox from './components/TempInputFields/TempSignaturBox';
import SelectText from './components/TempInputFields/TempSelectText';
import { useParams } from 'react-router-dom';
import { Mockdata } from '../Mocakdatat/mockdata';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?worker';
import GeneralLayout from '../../components/General_Layout/GeneralLayout';

pdfjsLib.GlobalWorkerOptions.workerPort = new pdfjsWorker();



const TempEditor: React.FC<{}> = ({  }) => {
  const [loading, setLoading] = useState(true);
  const [pdfPages, setPdfPages] = useState<any[]>([]);
  const [inputBoxes, setInputBoxes] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const { user_id, file_id } = useParams();
  const canvasWrapperRef = useRef<HTMLDivElement>(null);


  if (!file_id) {
    return <div>No document ID provided.</div>;
  }

  const documentData = Mockdata.find((doc) => doc.file_id === file_id);
  console.log(documentData)
  if (!documentData) {
    return <div>Document not found.</div>;
  }

    const isClient = documentData.client.id === user_id;
    console.log(isClient)
  if (!isClient) {
    return <div>You are not authorized to view this document.</div>;
  }

const fileUrl=documentData.location;


  useEffect(() => {
    
    const fetchAndRenderPdf = async () => {
      setLoading(true);
      try {
        const fetchedFile = await fetch(fileUrl);
        console.log("fetched"+ fetchedFile)
        const arrayBuffer = await fetchedFile.arrayBuffer();
        const loadedPdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const pages: any[] = [];
        console.log("pag'e", pages)

        for (let pageNum = 1; pageNum <= loadedPdf.numPages; pageNum++) {
        console.log('pahe: '+pageNum)
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
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndRenderPdf();
  }, [fileUrl]);

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

  const addInputBox = (type: 'text' | 'number' | 'date' | 'signature'|'selection') => {
    const page = pdfPages.find((p) => p.pageNum === currentPage);
    if (!page) return;

    const baseProps: InputBoxType = {
      id: `box-${Date.now()}`,
      type,
      pageNum: currentPage,
      x: page.viewport.width / 2 - 50,
      y: page.viewport.height / 2 - 15,
      width:
        type === 'signature'
          ? 200
          : type === 'selection'
            ? 150
            : 100,
      height:
        type === 'signature'
          ? 100
          : type === 'selection'
            ? 80
            : 30,
      value: '',
      placeholder: type === 'date' ? 'MM/DD/YYYY' : '',
      fontSize: 14,
      fontFamily: 'Arial',
      color: '#000000',
      textAlign: 'left',
      action: null
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
    const fetchedFile = await fetch(fileUrl);
    const arrayBuffer = await fetchedFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const scale = 1.5; // Should match your rendering scale

    for (const box of inputBoxes) {
      try {
        const page = pdfDoc.getPage(box.pageNum - 1); // pdf-lib uses 0-based indexing
        const { width: pageWidth, height: pageHeight } = page.getSize();

        // Validate coordinates and dimensions
        const validX = Number.isFinite(box.x) ? box.x : 0;
        const validY = Number.isFinite(box.y) ? box.y : 0;
        const validWidth = Number.isFinite(box.width) ? box.width : (box.type === 'signature' ? 200 : 100);
        const validHeight = Number.isFinite(box.height) ? box.height : (box.type === 'signature' ? 100 : 30);

        // Convert canvas coordinates to PDF coordinates
        // pdf-lib has (0,0) at bottom-left, while canvas has it at top-left
        const pdfX = validX / scale;
        const pdfY = pageHeight - (validY + validHeight) / scale;

        if (box.type === 'signature' && box.value?.startsWith('data:image')) {
          // Process signature image
          const base64Data = box.value.split(',')[1];
          const byteString = atob(base64Data);
          const byteArray = new Uint8Array(byteString.length);
          
          for (let i = 0; i < byteString.length; i++) {
            byteArray[i] = byteString.charCodeAt(i);
          }

          // Embed image (PNG or JPG)
          const image = box.value.startsWith('data:image/png')
            ? await pdfDoc.embedPng(byteArray)
            : await pdfDoc.embedJpg(byteArray);

          // Calculate dimensions while maintaining aspect ratio
          const imgAspectRatio = image.width / image.height;
          let drawWidth = validWidth / scale;
          let drawHeight = drawWidth / imgAspectRatio;

          // If the calculated height is too big for the box, scale down
          if (drawHeight > validHeight / scale) {
            drawHeight = validHeight / scale;
            drawWidth = drawHeight * imgAspectRatio;
          }

          page.drawImage(image, {
            x: pdfX,
            y: pdfY,
            width: drawWidth,
            height: drawHeight,
          });
        } else if (box.value) {
          // Handle text fields
          page.drawText(box.value, {
            x: pdfX,
            y: pdfY + (validHeight / scale) - 2, // Adjust text baseline
            size: (box.fontSize || 12) / scale,

          });
        }
      } catch (error) {
        console.error(`Error processing box ${box.id}:`, error);
      }
    }

    // Save and download
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'signed-document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

  } catch (err) {
    console.error("PDF save failed:", err);
    alert("Failed to save PDF. Check console for details.");
  }
};


  return (
    <GeneralLayout title={documentData.name}>
    <div style={{display:'flex'}}>
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
        style={{ height: '70vh', overflowY: 'auto', position: 'relative', backgroundColor:'grey' }}
      >
        {pdfPages.map((page) => (
  <div key={page.pageNum} style={{ marginBottom: 20, position: 'relative' }}>
    <canvas ref={(el) => { if (el) el.replaceWith(page.canvas); }} />
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
          onUpdateSize={(id: string, width: number, height: number) => {
            setInputBoxes((prev) =>
              prev.map((b) => (b.id === id ? { ...b, width, height } : b))
            );
          }}
          width={100}
          height={box.height}
        />
        
        
        
        ):  box.type === 'selection' ? (
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
      setInputBoxes(prev =>
        prev.map(b => (b.id === id ? { ...b, action } : b))
      )
    }
    onDelete={() => deleteInputBox(box.id)}
    onUpdatePosition={(id, x, y) =>
      setInputBoxes(prev =>
        prev.map(b => (b.id === id ? { ...b, x, y } : b))
      )
    }
    onUpdateSize={(id, width, height) =>
      setInputBoxes(prev =>
        prev.map(b => (b.id === id ? { ...b, width, height } : b))
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
              setInputBoxes((prev) => prev.filter((b) => b.id !== id));
              if (selectedBoxId === id) setSelectedBoxId(null);
            }}
            onUpdatePosition={(id, x, y) =>
              setInputBoxes((prev) =>
                prev.map((b) => (b.id === id ? { ...b, x, y } : b))
              )
            }
            onUpdateSize={(id, width, height) =>
              setInputBoxes((prev) =>
                prev.map((b) => (b.id === id ? { ...b, width, height } : b))
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
