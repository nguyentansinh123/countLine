import React, { useRef, useState, useEffect, useCallback } from 'react';
import Moveable from 'react-moveable';

type AnnotationAction = 'edit' | 'remove' | 'elaborate' | null;

interface SelectTextProps {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  canvasWrapperRef: React.RefObject<HTMLDivElement | null>;
  onConfirm: (id: string, action: AnnotationAction) => void;
  onDelete: (id: string) => void;
  onUpdatePosition: (id: string, x: number, y: number) => void;
  onUpdateSize?: (id: string, width: number, height: number) => void;
  onDoubleClick?: (id: string) => void;
  isActive?: boolean;
  action?: AnnotationAction;
}

const SelectText: React.FC<SelectTextProps> = ({
  id,
  x,
  y,
  width,
  height,
  onConfirm,
  onDelete,
  onUpdatePosition,
  onUpdateSize,
  onDoubleClick,
  isActive = false,
  action = null,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const getBackgroundColor = () => {
    switch (action) {
      case 'edit': return 'rgba(255, 255, 0, 0.3)';
      case 'remove': return 'rgba(255, 0, 0, 0.3)';
      case 'elaborate': return 'rgba(173, 216, 230, 0.3)';
      default: return 'rgba(200, 200, 200, 0.3)';
    }
  };

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(id);
  }, [id, onDelete]);

  const handleConfirm = useCallback((selectedAction: AnnotationAction) => {
    onConfirm(id, selectedAction);
    setIsEditing(false);
  }, [id, onConfirm]);

  const handleDoubleClick = useCallback(() => {
    if (!action) {
      setIsEditing(true);
      onDoubleClick?.(id);
    }
  }, [id, action, onDoubleClick]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.left = `${x}px`;
      containerRef.current.style.top = `${y}px`;
      containerRef.current.style.width = `${width}px`;
      containerRef.current.style.height = `${height}px`;
    }
  }, [x, y, width, height]);

  const controlButtonSize = Math.min(Math.max(width * 0.15, 20), 40);

  return (
    <>
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          left: `${x}px`,
          top: `${y}px`,
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: getBackgroundColor(),
          border: `2px ${isActive ? 'dashed' : 'solid'} #333`,
          boxSizing: 'border-box',
          cursor: 'move',
          transition: 'all 0.1s ease',
          zIndex: isActive ? 100 : 10,
          ...(isActive && { boxShadow: '0 0 0 2px #1890ff' }),
        }}
        onDoubleClick={handleDoubleClick}
        data-box-id={id}
      >
        {/* Action Buttons */}
        {isEditing && (
          <div style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '5px',
            marginBottom: '5px',
            zIndex: 101
          }}>
            <button onClick={() => handleConfirm('edit')} style={{ backgroundColor: 'rgba(255, 255, 0, 0.7)' }}>
              Request Edit
            </button>
            <button onClick={() => handleConfirm('remove')} style={{ backgroundColor: 'rgba(255, 0, 0, 0.7)' }}>
              Ask to Remove
            </button>
            <button onClick={() => handleConfirm('elaborate')} style={{ backgroundColor: 'rgba(173, 216, 230, 0.7)' }}>
              Requires Elaboration
            </button>
          </div>
        )}

        {/* Always-visible Delete Button */}
        <button
          style={{
            position: 'absolute',
            top: `-${controlButtonSize + 4}px`,
            right: 0,
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
            zIndex: 101
          }}
          onClick={handleDelete}
          title="Delete"
          onMouseDown={(e) => e.stopPropagation()}
        >
          ✕
        </button>
      </div>

      {isActive && containerRef.current && (
        <Moveable
          target={containerRef.current}
          draggable={!action}
          resizable={!action}
          keepRatio={false}
          throttleDrag={0}
          throttleResize={0}
dragArea={true}
          onDrag={({ beforeTranslate }) => {
            const newX = x + beforeTranslate[0];
            const newY = y + beforeTranslate[1];
            if (containerRef.current) {
              containerRef.current.style.transform = `translate(${beforeTranslate[0]}px, ${beforeTranslate[1]}px)`;
            }
          }}

          onDragEnd={({ lastEvent }) => {
            if (lastEvent) {
              const [dx, dy] = lastEvent.beforeTranslate;
              containerRef.current!.style.transform = '';
              onUpdatePosition(id, x + dx, y + dy);
            }
          }}
          onResize={({ width: w, height: h, drag }) => {
            const dx = drag?.beforeTranslate[0] ?? 0;
            const dy = drag?.beforeTranslate[1] ?? 0;

            const el = containerRef.current;
            if (el) {
              el.style.left = `${x + dx}px`;
              el.style.top = `${y + dy}px`;
              el.style.width = `${w}px`;
              el.style.height = `${h}px`;
            }
          }}

          onResizeEnd={({ lastEvent }) => {
            if (lastEvent && onUpdateSize) {
              const dx = lastEvent.drag?.beforeTranslate[0] ?? 0;
              const dy = lastEvent.drag?.beforeTranslate[1] ?? 0;
              const newX = x + dx;
              const newY = y + dy;
              onUpdatePosition(id, newX, newY);
              onUpdateSize(id, lastEvent.width, lastEvent.height);
            }
          }}

        />
      )}
    </>
  );
};

export default React.memo(SelectText);
