import React, { useRef, useState, useEffect, useCallback } from 'react';
import Moveable from 'react-moveable';
import { InputBoxType } from '../types';

interface InputBoxProps {
  box: InputBoxType;
  canvasWrapperRef: React.RefObject<HTMLDivElement | null>;
  onConfirm: (id: string, value: string) => void;
  onDelete: (id: string) => void;
  onUpdatePosition: (id: string, x: number, y: number) => void;
  onUpdateSize?: (id: string, width: number, height: number) => void;
  onDoubleClick?: (id: string) => void;
  isActive?: boolean;
}

const InputBox: React.FC<InputBoxProps> = ({
  box,
  onConfirm,
  onDelete,
  onUpdatePosition,
  onUpdateSize,
  onDoubleClick,
  isActive = false,
}) => {
  const [value, setValue] = useState<string | number>(
    typeof box.value === 'string' || typeof box.value === 'number' ? box.value : ''
  );
  const [isEditing, setIsEditing] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  // Confirm input
  const handleConfirm = useCallback(() => {
    onConfirm(box.id, String(value));
    setIsEditing(false);
    setShowControls(false);
  }, [box.id, value, onConfirm]);

  // Delete input
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(box.id);
  }, [box.id, onDelete]);

  // Start editing
  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
    onDoubleClick?.(box.id);
  }, [box.id, onDoubleClick]);

  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setValue(typeof box.value === 'string' || typeof box.value === 'number' ? box.value : '');
      setShowControls(false);
    }
  };


  

  // Focus input when editing
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // Update position when props change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.left = `${box.x}px`;
      containerRef.current.style.top = `${box.y}px`;
      containerRef.current.style.width = `${box.width}px`;
      containerRef.current.style.height = `${box.height}px`;
    }
  }, [box.x, box.y, box.width, box.height]);

  // Calculate control button size based on input size
  const controlButtonSize = Math.min(Math.max(box.width * 0.15, 20), 40);

  return (
    <>
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          left: `${box.x}px`,
          top: `${box.y}px`,
          width: `${box.width}px`,
          height: `${box.height}px`,
          fontSize: `${box.fontSize || 14}px`,
          fontFamily: box.fontFamily || 'Arial',
          color: box.color || '#000000',
          textAlign: box.textAlign as any || 'left',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          padding: '5px',
          cursor: 'move',
          zIndex: isActive ? 100 : 10,
          ...(isActive && {
            boxShadow: '0 0 0 2px #1890ff',
          }),
        }}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => !isEditing && setShowControls(true)}
        data-input-id={box.id}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            type={box.type === 'number' ? 'number' : 'text'}
            value={value}
            color='black'
            placeholder="input text"
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleConfirm}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 'inherit',
              fontFamily: 'inherit',
              color: 'inherit',
              textAlign: 'inherit',
            }}
          />
        ) : (
          <div style={{ 
            width: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {value || box.placeholder}
          </div>
        )}

        {showControls && (
          <div style={{
            position: 'absolute',
            top: `-${controlButtonSize + 4}px`,
            right: 0,
            display: 'flex',
            gap: '4px',
          }}>
            {isEditing && (
              <button
                style={{
                  width: `${controlButtonSize}px`,
                  height: `${controlButtonSize}px`,
                  padding: 0,
                  background: '#52c41a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={handleConfirm}
                title="Confirm"
              >
                ✓
              </button>
            )}
            <button
              style={{
                width: `${controlButtonSize}px`,
                height: `${controlButtonSize}px`,
                padding: 0,
                background: '#ff4d4f',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={handleDelete}
              title="Delete"
              onMouseDown={(e) => e.stopPropagation()} // Prevent moveable from capturing this click
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {isActive && containerRef.current && (
        <Moveable
  target={containerRef.current}
  draggable={true}
  resizable={true}
  keepRatio={false}
  throttleDrag={1}
  throttleResize={1}
  snappable={true}
  snapDirections={{ top: true, left: true, bottom: true, right: true }}
  snapThreshold={5}
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
  onResize={({ width, height }) => {
    if (containerRef.current) {
      containerRef.current.style.width = `${width}px`;
      containerRef.current.style.height = `${height}px`;
    }
    // DO NOT call onUpdateSize here to avoid slow re-renders
  }}
  onResizeEnd={({ lastEvent }) => {
    if (lastEvent && onUpdateSize) {
      onUpdateSize(box.id, lastEvent.width, lastEvent.height); // update state once on resize end
    }
  }}
/>


      )}
    </>
  );
};

export default React.memo(InputBox);