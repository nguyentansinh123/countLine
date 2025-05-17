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
  const [selectedTypes, setSelectedTypes] = useState<string>('');
  const [messageApi, contextHolder] = message.useMessage();

  const handleUpload = async () => {
    if (!file || !fileName || selectedTypes.length === 0) {
      messageApi.warning('Please fill all fields before uploading.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', fileName);
    formData.append('documentType', selectedTypes); // Assuming only one type can be selected
    console.log(selectedTypes);

    try {
      const response = await fetch(
        'http://localhost:5001/api/document/upload',
        {
          method: 'POST',
          body: formData,
          credentials: 'include', // include cookies if using auth
        }
      );

      const result = await response.json();
      if (response.ok) {
        messageApi.success('File uploaded successfully!');
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
      {contextHolder}
      <div style={{ width: '10%' }}>File Name</div>
      <div style={{ width: '100%' }}>
        <Input
          style={{ width: '50%', border: 'black solid 2px' }}
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          placeholder="Enter file name"
        />
      </div>
      <div style={{ width: '10%' }}>File type</div>
      <div style={{ width: '50%' }}>
        <Select
          value={selectedTypes}
          onChange={setSelectedTypes}
          placeholder="Select File Type"
          style={{ width: '50%', border: 'black solid 2px' }}
        >
          {fileTypes.map((item) => (
            <Select.Option key={item.value} value={item.value}>
              {item.label}
            </Select.Option>
          ))}
        </Select>
      </div>

      <div style={{ padding: 20 }}>
        <Upload
          beforeUpload={(file) => {
            const allowedTypes = [
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'application/vnd.ms-excel',
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'application/vnd.ms-powerpoint',
              'application/vnd.openxmlformats-officedocument.presentationml.presentation',
              'text/plain',
            ];

            if (!allowedTypes.includes(file.type)) {
              messageApi.error('File type not supported');
              return Upload.LIST_IGNORE;
            }

            setFile(file);
            if (!fileName) {
              setFileName(file.name.replace(/\.[^/.]+$/, ''));
            }
            return false;
          }}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />}>Select Document</Button>
        </Upload>

        {file && (
          <div style={{ marginTop: '10px', fontWeight: 'bold' }}>
            Selected File: {file.name}
          </div>
        )}

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
