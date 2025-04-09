import React, { useState, useEffect } from "react";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import extractContentsFromPDF from "../../utils/extractContentsFromPdf";

interface PDFEditorProps {
  pdfBlob: Blob | null;
}

const PDFEditor: React.FC<PDFEditorProps> = ({ pdfBlob }) => {
  const [editorContent, setEditorContent] = useState<string>("");

  // Function to update the editor content
  const updateContent = async (pdfBlob: Blob) => {
    console.log(pdfBlob);
    try {
      const content = await extractContentsFromPDF(pdfBlob);
      setEditorContent(content); // Update the content with extracted text/images
    } catch (error) {
      console.error("Error updating content:", error);
    }
  };

  // Effect to run when pdfBlob changes
  useEffect(() => {
    if (pdfBlob) {
      updateContent(pdfBlob);
    }
  }, [pdfBlob]);

  return (
    <div>
      {/* SunEditor section */}
      <div style={{ height: "55vh", overflow: "auto", marginBottom: "2rem" }}>
        <SunEditor
          setOptions={{
            buttonList: [
              ["bold", "italic", "underline", "strike", "subscript", "superscript"],
              ["font", "fontSize", "formatBlock"],
              ["align", "horizontalRule", "list", "outdent", "indent"],
              ["image"],
            ],
          }}
          setContents={editorContent}  // Pass the HTML content (with images) here
          onChange={setEditorContent}   // Update the editor content on change
        />
      </div>

      {/* Raw HTML Preview */}
      <div
        style={{
          padding: "1rem",
          border: "1px solid #ddd",
          background: "#f9f9f9",
          display: "flex",
          flexDirection: "column"
        }}
        dangerouslySetInnerHTML={{ __html: editorContent }}  // Render HTML directly
      />
    </div>
  );
};

export default PDFEditor;
