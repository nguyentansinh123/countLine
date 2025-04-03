import React, { useState, useEffect } from "react";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import extractTextAndImagesFromPDF from "../../utils/extractTextFromPdf";

interface PDFEditorProps {
  pdfBlob: Blob | null;
}

const PDFEditor: React.FC<PDFEditorProps> = ({ pdfBlob }) => {
  const [editorContent, setEditorContent] = useState<string>("");

  // Function to update content with extracted text and images
  const updateContent = async (pdfBlob: Blob) => {
    console.log(pdfBlob); // Log the object to ensure it is a Blob
    try {
      const content = await extractTextAndImagesFromPDF(pdfBlob);
      setEditorContent(content); // Update the editor with the extracted content
    } catch (error) {
      console.error("Error updating content:", error);
    }
  };

  // useEffect to trigger content update when pdfBlob changes
  useEffect(() => {
    if (pdfBlob) {
      updateContent(pdfBlob); // Call updateContent when pdfBlob is available
    }
  }, [pdfBlob]); // Trigger whenever pdfBlob changes

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
