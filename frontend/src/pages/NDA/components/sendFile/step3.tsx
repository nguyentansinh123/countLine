import React, { useState, useEffect, useRef } from 'react';
import {
  PDFDocument,
  rgb,
  StandardFonts,
  PDFFont,
  PDFPage,
  PDFImage,
} from 'pdf-lib';

import { Button } from 'antd';

interface Step3Props {
  txtContent: string | null;
  userName: string;
  userEmail: string;
  file: any;
  userAdress: string;
  signedUrl: string;
}

const Step3: React.FC<{ recipient: string; onClose: () => void }> = ({
  recipient,
  onClose,
}) => {
  return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <h3>✅ Document successfully signed and sent!</h3>
      <p>
        The document was sent to <strong>{recipient}</strong>.
        <br />
        User{recipient.includes('@') ? '' : 's'}/Team will be notified via
        email.
      </p>
    </div>
  );
};

export default Step3;
