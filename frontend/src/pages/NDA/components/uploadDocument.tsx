import React, { useState } from 'react';
import { Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const UploadDocument: React.FC = () => {
  const [file, setFile] = useState<any>(null);
  const [category, setCategory] = useState<string>('NDA Documents');

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

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
    <div>
      <h2>Upload Document</h2>
      <Upload
        beforeUpload={(file) => {
          setFile(file);
          return false;
        }}
        showUploadList={false}
      >
        <Button icon={<UploadOutlined />}>Select Document</Button>
      </Upload>
      <div style={{ marginTop: 10 }}>
        <Button type="primary" onClick={handleUpload}>
          Upload
        </Button>
      </div>
    </div>
  );
};

export default UploadDocument;
