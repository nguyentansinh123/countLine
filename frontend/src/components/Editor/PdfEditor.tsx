import React, { useState, useEffect } from "react";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import extractTextAndImagesFromPDF  from "../../utils/extracttextFromPdf";

interface PDFEditorProps {
  pdfBlob: Blob | null;
}

const PDFEditor: React.FC<PDFEditorProps> = ({ pdfBlob }) => {
  const [editorContent, setEditorContent] = useState<string>("");

  // Create an object URL from the Blob
  const createBlobURL = (blob: Blob): string => URL.createObjectURL(blob);

  useEffect(() => {
    if (pdfBlob) {
      const fetchAndSetContent = async () => {
        try {
          const pdfUrl = createBlobURL(pdfBlob); // Create URL from Blob
          const content = await extractTextAndImagesFromPDF(pdfUrl); // Use the utility function
          setEditorContent(content); // Update the editor with extracted content
          URL.revokeObjectURL(pdfUrl); // Clean up the URL after use
        } catch (error) {
          console.error("Error extracting text and images:", error);
        }
      };

      fetchAndSetContent();
    }
  }, [pdfBlob]);

  return (
    <div style={{ height: "55vh", overflow: "auto" }}>
      <SunEditor
        setOptions={{
          buttonList: [
            ["bold", "italic", "underline", "strike", "subscript", "superscript"],
            ["font", "fontSize", "formatBlock"],
            ["align", "horizontalRule", "list", "outdent", "indent"],
            ["image"],
          ],
        }}
        setContents={editorContent}
        onChange={setEditorContent}
      />
    </div>
  );
};

export default PDFEditor;
