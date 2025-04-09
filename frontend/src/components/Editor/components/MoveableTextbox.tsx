import React, { useState, useRef, useEffect } from 'react';
import Moveable from 'react-moveable';

const MoveableTextBox = ({ parentTarget, pdfPosition, initialPosition }: { parentTarget: HTMLElement | null, pdfPosition: { top: number, left: number }, initialPosition: { top: number, left: number } }) => {
    const [childTarget, setChildTarget] = useState<HTMLElement | null>(null);
    const [position, setPosition] = useState<{ top: number; left: number; width: number; height: number }>({
        top: initialPosition.top,
        left: initialPosition.left,
        width: 200,
        height: 100,
    });

    useEffect(() => {
        if (parentTarget && childTarget) {
            const rect = parentTarget.getBoundingClientRect();
            setPosition((prevState) => ({
                ...prevState,
                top: rect.top + pdfPosition.top + position.top, // Adjust for relative positioning
                left: rect.left + pdfPosition.left + position.left, // Adjust for relative positioning
            }));
        }
    }, [parentTarget, pdfPosition, position]);

    const handleSave = () => {
        if (childTarget) {
            const rect = childTarget.getBoundingClientRect();
            setPosition({
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
            });
            console.log('Saved Position:', position);
        }
    };

    return (
        <div>
            {/* Child Moveable Text Box */}
            <div
                ref={setChildTarget}
                style={{
                    width: `${position.width}px`,
                    height: `${position.height}px`,
                    backgroundColor: 'transparent',
                    position: 'absolute',
                    top: `${position.top}px`,
                    left: `${position.left}px`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '20px',
                }}
            >
                {/* Editable Input Field */}
                <input
                    type="text"
                    placeholder="Type here..."
                    style={{
                        width: '100%',
                        height: '100%',
                        textAlign: 'center',
                        border: 'none',
                        outline: 'none',
                        background: 'white',
                        color: 'black',
                        fontSize: '16px',
                    }}
                />
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={handleSave}>Save</button>
                    <button>Delete</button>
                </div>
            </div>

            {/* Moveable for Child Box */}
            {childTarget && (
                <Moveable
                    target={childTarget}
                    draggable={true}
                    resizable={true}
                    checkInput={true}
                    onDrag={(e) => {
                        e.target.style.left = e.left + 'px';
                        e.target.style.top = e.top + 'px';
                    }}
                    onResize={(e) => {
                        e.target.style.width = e.width + 'px';
                        e.target.style.height = e.height + 'px';
                    }}
                />
            )}
        </div>
    );
};

export default MoveableTextBox;
