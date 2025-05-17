import React, { useRef, useState, useEffect } from 'react';
import Moveable from 'react-moveable';
import { Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadChangeParam, RcFile } from 'antd/es/upload';
import { InputBoxType } from '../types';

interface SignatureBoxProps {
  box: InputBoxType;
  id: any;
  isActive: boolean;
  onConfirm: (id: string, value: string) => void;
  onUpdatePosition: (id: string, x: number, y: number) => void;
  onUpdateSize: (id: string, width: number, height: number) => void;
  onDelete: (id: string) => void;
  onDoubleClick?: (id: string) => void;
  onSave: (dataUrl: string) => void;
  canvasWrapperRef: React.RefObject<HTMLDivElement | null>;
  width: number;
  height: number;
}

const SignatureBox: React.FC<SignatureBoxProps> = ({
  box,
  isActive,
  onConfirm,
  onDelete,
  onUpdatePosition,
  onUpdateSize,
  onDoubleClick,
}) => {
  const [mode, setMode] = useState<'draw' | 'upload'>('draw');
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const moveableRef = useRef<Moveable>(null);

useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  // If the signature is finalized, do nothing — avoid clearing/redrawing
  if (isFinalized) return;

  const setupCanvas = () => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const scale = window.devicePixelRatio || 1.5;
    canvas.width = box.width * scale;
    canvas.height = box.height * scale;
    canvas.style.width = `${box.width}px`;
    canvas.style.height = `${box.height}px`;

    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform before scaling
    ctx.scale(scale, scale);
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';

    // Re-draw the signature after resize if it exists
    if (signatureData && mode === 'draw') {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, box.width, box.height);
      };
      img.src = signatureData;
    }
  };

  setupCanvas();
}, [box.width, box.height, mode, signatureData, isFinalized]);

  // Drawing functions
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (isFinalized || mode !== 'draw') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const ctx = canvas.getContext('2d');
    ctx?.beginPath();
    ctx?.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current || isFinalized || mode !== 'draw') return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const ctx = canvas.getContext('2d');
    ctx?.lineTo(x, y);
    ctx?.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Handle file upload
  const beforeUpload = (file: RcFile) => {
    const isImage = file.type.startsWith('image/');
    const isLt2M = file.size / 1024 / 1024 < 2;

    if (!isImage) {
      message.error('You can only upload image files!');
      return false;
    }
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!');
      return false;
    }
    return true;
  };

  const handleUpload = (info: UploadChangeParam) => {
    if (info.file.status === 'uploading') {
      setIsUploading(true);
      return;
    }

    if (info.file.status === 'done') {
      const file = info.file.originFileObj;
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          setUploadedUrl(result);
          message.success(`${info.file.name} uploaded successfully`);
        }
        setIsUploading(false);
      };
      reader.onerror = () => {
        message.error('Failed to read file');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }

    if (info.file.status === 'error') {
      message.error(`${info.file.name} upload failed`);
      setIsUploading(false);
    }
  };

  // Finalize signature
  const finalizeSignature = () => {
    if (mode === 'draw' && canvasRef.current && hasDrawn) {
      const dataUrl = canvasRef.current.toDataURL();
      setSignatureData(dataUrl);
      onConfirm(box.id, dataUrl);
      setIsFinalized(true);
      message.success('Signature saved');
    } else if (mode === 'upload' && uploadedUrl) {
      setSignatureData(uploadedUrl);
      onConfirm(box.id, uploadedUrl);
      setIsFinalized(true);
      message.success('Signature uploaded');
    } else {
      message.warning('Please draw or upload a signature first');
    }
  };

  // Handle resizing with aspect ratio preservation
  const handleResize = ({ width, height, drag }: any) => {
    if (!containerRef.current) return;
    
    containerRef.current.style.width = `${width}px`;
    containerRef.current.style.height = `${height}px`;
    
    if (drag) {
      containerRef.current.style.left = `${box.x + drag.left}px`;
      containerRef.current.style.top = `${box.y + drag.top}px`;
    }
  };

 const handleResizeEnd = ({ target, width, height, drag }: any) => {
  if (!target) return;
  
  const newWidth = Math.max(100, width); // Minimum width
  const newHeight = Math.max(50, height); // Minimum height
  
  onUpdateSize(box.id, newWidth, newHeight);

  if (drag) {
    onUpdatePosition(box.id, box.x + drag.left, box.y + drag.top);
  }

  // Reset transform after resize
  target.style.transform = 'translate(0px, 0px)';

  // Ensure the canvas retains the signature after resizing
  const canvas = canvasRef.current;
  if (canvas && signatureData) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before re-drawing
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, box.width, box.height);
      };
      img.src = signatureData;
    }
  }
};
;

  return (
    <>
      {/* Signature Box Container */}
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          left: `${box.x}px`,
          top: `${box.y}px`,
          width: `${box.width}px`,
          height: `${box.height}px`,
          border: isFinalized ? '2px solid transparent' : '2px dashed #1890ff',
          boxShadow: '0 0 3px rgba(0,0,0,0.2)',
          boxSizing: 'border-box',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          zIndex: isActive ? 100 : 10,
        }}
        onDoubleClick={() => onDoubleClick?.(box.id)}
      >
        {!isFinalized && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              background: '#f0f0f0',
              borderBottom: '1px solid #ccc',
              zIndex: 1,
            }}
          >
            <Button
              type={mode === 'draw' ? 'primary' : 'default'}
              size="small"
              onClick={() => setMode('draw')}
            >
              Draw
            </Button>
            <Button
              type={mode === 'upload' ? 'primary' : 'default'}
              size="small"
              onClick={() => setMode('upload')}
            >
              Upload
            </Button>
            <Button 
              type="primary" 
              size="small" 
              onClick={finalizeSignature}
              disabled={(mode === 'draw' && !hasDrawn) || (mode === 'upload' && !uploadedUrl)}
            >
              ✓
            </Button>
          </div>
        )}

        <div style={{ flex: 1, position: 'relative' }}>
          {mode === 'draw' ? (
            <canvas
              ref={canvasRef}
              style={{
                display: 'block',
                touchAction: 'none',
                backgroundColor:'white',
                cursor: isFinalized ? 'default' : 'crosshair',
                width: '100%',
                height: '100%',
              }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          ) : uploadedUrl ? (
            <img
              src={uploadedUrl}
              alt="signature"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          ) : (
            <div style={{ 
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%'
            }}>
              <Upload
                accept="image/*"
                showUploadList={false}
                beforeUpload={beforeUpload}
                customRequest={({ file, onSuccess }) => {
                  setTimeout(() => onSuccess?.("ok"), 0);
                }}
                onChange={handleUpload}
              >
                <Button icon={<UploadOutlined />} loading={isUploading}>
                  Upload Signature
                </Button>
              </Upload>
            </div>
          )}
        </div>
      </div>

      {/* Delete Button */}
      {isFinalized && (
        <div style={{ 
          position: 'absolute', 
          top: box.y + box.height + 5, 
          left: box.x,
          zIndex: 100,
        }}>
          <Button danger size="small" onClick={() => onDelete(box.id)}>
            Delete
          </Button>
        </div>
      )}

      {/* Moveable Controls */}
      {isActive && containerRef.current && (
        <Moveable
          ref={moveableRef}
          target={containerRef.current}
          draggable={true}
          resizable={true}
          throttleDrag={0}
          throttleResize={0}
          edge={false}
          origin={false}
          onDrag={({ target, beforeTranslate }) => {
            target.style.transform = `translate(${beforeTranslate[0]}px, ${beforeTranslate[1]}px)`;
          }}
          onDragEnd={({ target, lastEvent }) => {
            if (lastEvent) {
              const [dx, dy] = lastEvent.beforeTranslate;
              target.style.transform = 'translate(0px, 0px)';
              onUpdatePosition(box.id, box.x + dx, box.y + dy);
            }
          }}
          onResize={handleResize}
          onResizeEnd={handleResizeEnd}
        />
      )}
    </>
  );
};

export default SignatureBox;