// SendFile.tsx (Main component)
import { Alert, Button, Card, message } from 'antd';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import clientUserConst from '../../Users/const/clientUserConst';
import teamsData from '../../Teams/const/TeamsConst';
import ndaDocuments from '../const/ndaDocuments';
import legalDocuments from '../const/legalDocuments';
import executiveDocumentTemplates from '../const/executiveDocuments';
import ipAgreements from '../const/ipDocuments';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?worker';
import { Document } from './sendFile/types';
import Step1 from './sendFile/step1';
import Step2 from './sendFile/step2';
import Step3 from './sendFile/step3';

const SendFile: React.FC = () => {
    const [step, setStep] = useState<number>(1);
    const [signatureType, setSignatureType] = useState<'upload' | 'draw'>('upload');
    const [uploadedSignatureImage, setUploadedSignatureImage] = useState<string | null>(null);
    const [drawnSignatureData, setDrawnSignatureData] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [userEmail, setUserEmail] = useState<string>('');
    const [selectedTeam, setSelectedTeam] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [txtContent, setTxtContent] = useState<string | null>(null);

    const { category, file_id } = useParams<{ category: string; file_id: string }>();
    const navigate = useNavigate();

    let fileData: Document[] = [];
    if (category === 'NDA') {
        fileData = ndaDocuments;
    } else if (category === 'IP') {
        fileData = ipAgreements;
    } else if (category === 'Executive Document') {
        fileData = executiveDocumentTemplates;
    } else if (category === 'Legal Document') {
        fileData = legalDocuments;
    }

    const file = fileData.find((f) => f.id === file_id);

    const extractTextFromPDF = async (file: File): Promise<string> => {
        try {
            const fileArrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(fileArrayBuffer).promise;

            let textContent = '';
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const content = await page.getTextContent();

                const lines: string[] = [];
                let currentLine = '';
                let lastYPosition = -1;

                content.items.forEach((item: any) => {
                    if (Math.abs(item.transform[5] - lastYPosition) < 10) {
                        currentLine += item.str + ' ';
                    } else {
                        if (currentLine.trim() !== '') {
                            lines.push(currentLine.trim());
                        }
                        currentLine = item.str + ' ';
                    }
                    lastYPosition = item.transform[5];
                });

                if (currentLine.trim() !== '') {
                    lines.push(currentLine.trim());
                }

                textContent += lines.join('\n') + '\n\n';
            }

            return textContent;
        } catch (error) {
            console.error('Error extracting text from PDF:', error);
            throw new Error('Failed to extract text from PDF');
        }
    };

    const fetchPdfFileWrapper = async () => {
        console.log('fetchPdfFileWrapper called'); // Added console.log
        const fileUrl = file?.location;
        console.log('File URL:', fileUrl); // Added console.log

        if (!fileUrl) {
            setError('File URL is undefined.');
            setLoading(false);
            return;
        }

        try {
            console.log('Loading state set to true'); // Added console.log
            setLoading(true);
            console.log('Starting fetchPdfFile...');
            await fetchPdfFile(fileUrl);
            console.log('fetchPdfFile completed successfully.');
        } catch (err) {
            console.error('Error fetching the PDF:', err);
            setError('Failed to load PDF file');
            console.log('Loading state set to false due to error'); // Added console.log
            setLoading(false);
        }
    };

    const fetchPdfFile = async (url: string) => {
        try {
            console.log(`Fetching PDF from URL: ${url}`);
            const response = await fetch(url);
            console.log('Response status:', response.status);
            if (!response.ok) {
                console.error(`Fetch failed with status: ${response.status} ${response.statusText}`);
                throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
            }

            console.log('Response OK, processing blob...');
            const blob = await response.blob();
            console.log('Blob received, creating file...');
            const file = new File([blob], 'file.pdf', { type: 'application/pdf' });

            console.log('File created, extracting text...');
            const text = await extractTextFromPDF(file);
            console.log('Text extraction successful.');
            setTxtContent(text);
            console.log('txtContent set in fetchPdfFile:', text);
            console.log('fetchPdfFile completed'); // Added console.log
            console.log('Loading state set to false'); // Added console.log
            setLoading(false);
        } catch (error) {
            console.error('Error loading PDF:', error);
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('An unknown error occurred');
            }
            console.log('Loading state set to false due to error'); // Added console.log
            setLoading(false);
        }
    };

    const getUserEmail = (username: string) => {
        const user = clientUserConst.find((u) => u.name === username);
        if (user) {
            setUserEmail(user.mail);
        } else {
            const teamMember = teamsData.find((team) =>
                team.members.some((member) => member.name === username)
            );
            if (teamMember) {
                const member = teamMember.members.find((member) => member.name === username);
                if (member && 'mail' in member) {
                    setUserEmail((member as { name: string; mail: string }).mail);
                }
            }
        }
    };

    const [messageApi, contextHolder] = message.useMessage();

    const handleNextStep = () => {
        if (step === 1) {
            if (!selectedUser && !selectedTeam) {
                messageApi.info('Please select a user or a team.');
                return;
            }
            if (selectedUser) {
                getUserEmail(selectedUser);
            }
            setStep(2);
        } else if (step === 2) {
           
          setStep(3);
      }  else {
          navigate('/non-disclosure-agreement');
      }
  };

  const handleBackStep = () => {
      if (step === 1) {
          navigate('/non-disclosure-agreement');
      } else if (step === 2) {
          setStep(1);
      } else if (step === 3) {
          setStep(2);
      } else {
          setStep(3);
      }
  };

  useEffect(() => {
      console.log("useEffect called with file:", file); // Added console.log
      if (file) {
          fetchPdfFileWrapper();
      }
  }, [file]);

  return (
      <>
          {contextHolder}
          <h2 style={{ color: '#151349' }}>Send File</h2>
          <Card style={{ border: 'solid 1px #151349' }}>
              {step === 1 && (
                  <Step1
                      file={file}
                      category={category}
                      selectedUser={selectedUser}
                      setSelectedUser={setSelectedUser}
                      clientUserConst={clientUserConst}
                      teamsData={teamsData}
                      userEmail={userEmail}
                  />
              )}
          
              {step === 2 && (
                  <>
                      {console.log('txtContent in SendFile before Step3:', txtContent)}
                      <Step2
  txtContent={txtContent}
  userName={userName}
  userEmail={userEmail}
  file={file}
  userAdress='useraddress'
/>

                  </>
              )}
              {step === 3}

              <div style={{ display: 'flex', gap: 20, margin: 0 }}>
                  {step !== 3 && (
                      <Button onClick={handleBackStep}>
                          {step === 1 ? 'Cancel' : step === 2 ? 'Previous' : step === 3 ? 'Go back' : ''}
                      </Button>
                  )}
                  <Button type="primary" onClick={handleNextStep}>
                      {step === 1 ? 'Next' : step === 2 ? 'Next' : step === 3 ? 'Finish' : 'Close'}
                  </Button>
              </div>
          </Card>
      </>
  );
};

export default SendFile;