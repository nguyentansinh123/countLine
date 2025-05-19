import React from 'react';
import { Button } from 'antd';
import { EditOutlined, SignatureOutlined, FileTextOutlined, CalendarOutlined, NumberOutlined, SelectOutlined } from '@ant-design/icons';
import { InputBoxType } from './tempTypes';

interface TempToolbarProps {
  addInputBox: (type: 'number' | 'text' | 'date' | 'signature'|'selection') => void;
  addSignatureBox: () => void;
  addSelection:()=>void;
  handleSave: () => Promise<void>;
  selectedBoxId: string | null;
  inputBoxes: InputBoxType[];
  updateInputBox: (id: string, updates: Partial<InputBoxType>) => void;
}

const TempToolbar: React.FC<TempToolbarProps> = ({ addInputBox, addSignatureBox, handleSave, selectedBoxId, inputBoxes,  addSelection }) => {
  return (
    <div style={{ width: '200px', padding: '16px', borderRight: '1px solid #f0f0f0' }}>
      <h3>Form Fields</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Button
          icon={<FileTextOutlined />}
          onClick={() => addInputBox('text')}
          type={selectedBoxId ? 'default' : 'primary'}
          block
        >
          Text Input
        </Button>
        <Button
          icon={<SignatureOutlined />}
          onClick={addSignatureBox}
          type={selectedBoxId ? 'default' : 'primary'}
          block
        >
          Signature
        </Button>
          <Button
          icon={<SelectOutlined />}
          onClick={addSelection}
          type={selectedBoxId ? 'default' : 'primary'}
          block
        >
          Select Text
        </Button>
      </div>
      

      <div style={{ marginTop: '32px' }}>
        <Button
          type="primary"
          onClick={handleSave}
          block
          disabled={inputBoxes.length === 0}
        >
          Save Form
        </Button>
      </div>
    </div>
  );
};

export default TempToolbar;
