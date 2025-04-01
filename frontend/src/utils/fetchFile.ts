// src/utils/fetchFile.ts
export const fetchPdfFile = async (url: string): Promise<File | null> => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.statusText}`);
  
      const blob = await response.blob();
      return new File([blob], 'file.pdf', { type: 'application/pdf' });
    } catch (error) {
      console.error('Error fetching file:', error);
      throw new Error('Failed to load PDF file');
    }
  };
  