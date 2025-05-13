import React, { useState } from 'react';
import { Button, Card, Input, Upload, message, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import GeneralLayout from '../../../components/General_Layout/GeneralLayout';

const fileTypes = [
  { label: 'NDA', value: 'NDA' },
  { label: 'I.P Agreement', value: 'I.P Agreement' },
  { label: 'Executive Document', value: 'Executive Document' },
  { label: 'Legal Document', value: 'Legal Document' },
];

const UploadDocument: React.FC = () => {
  const [file, setFile] = useState<any>(null);
  const [fileName, setFileName] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const handleUpload = async () => {
    if (!file || !fileName || selectedTypes.length === 0) {
      message.warning('Please fill all fields before uploading.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', fileName);
    formData.append('fileTypes', JSON.stringify(selectedTypes)); // send as JSON string

    try {
      const response = await fetch('http://localhost:5000/upload-s3', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        message.success('File uploaded successfully!');
        console.log(result);
      } else {
        message.error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error(error);
      message.error('An error occurred during the upload');
    }
  };

  return (
    <GeneralLayout title="Upload Document">
  
      <div style={{width:'10%'}}>
      File Name
      </div>
      <div style={{width:'100%'}}>
       <Input
            style={{  width:'50%', border:'black solid 2px' }}
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="Enter file name"
          />
      </div>
       <div style={{width:'10%'}}>
      File type
      </div>
      <div style={{width:'50%'}}>
        <Select
            value={selectedTypes}
            onChange={setSelectedTypes}
            placeholder="Select File Type"
            style={{ width:'50%', border:'black solid 2px' }}
          >
            {fileTypes.map((item) => (
              <Select.Option key={item.value} value={item.value}>
                {item.label}
              </Select.Option>
            ))}
          </Select>
      </div>


<div style={{padding:20}}>
        <Upload
          beforeUpload={(file) => {
            setFile(file);
            return false; // prevents auto upload
          }}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />}>Select Document</Button>
        </Upload>
          
        <div style={{ marginTop: 20 }}>
          <Button type="primary" onClick={handleUpload}>
            Upload
          </Button>
        </div>
        </div>

    </GeneralLayout>
  );
};

export default UploadDocument;
