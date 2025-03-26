import { Collapse, MenuProps, Dropdown, Button, List } from 'antd';
import React from 'react';

interface CollapsableComponentProps {
  column: string[]; // Column names to display
  data: Array<Record<string, any>>; // Data to display in rows
  menu: (item: any) => MenuProps; // Menu for dropdown actions
}

function CollapsableComponent(props: CollapsableComponentProps) {
  const { column, data, menu } = props; // Destructure props to access column, data, and menu

  return (
    <div style={{ width: '100%', margin: '0 auto', paddingBottom: 8 }}>
      {/* Table Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 70,
          fontWeight: 'bold',
          borderBottom: '1px solid #ccc',
          paddingBottom: 8,
        }}
      >
        {column.map((col, index) => (
          <span key={index} style={{ textAlign: 'start' }}>
            {col}
          </span>
        ))}
             <div
          style={{
            height: '70vh',
            padding: 5,
            overflowY: 'auto',
            paddingRight: 10,
          }}
        ></div>
      </div>
      </div>
  );
}

export default CollapsableComponent;
