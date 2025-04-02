import * as pdfjsLib from 'pdfjs-dist';

// Helper to convert an array of characters into a string
const convertGlyphsToText = (glyphs: any[]): string => {
  return glyphs.map((glyph) => glyph.unicode || glyph.fontChar).join('');
};

// Helper to check if a string might be a bullet point
const isBulletPoint = (text: string) => /^[•\-\u2022]/.test(text);

// Helper to check if the text is empty (blank line)
const isBlankLine = (text: string) => !text.trim();

export const processPdfItem = async (fn: any, args: any, page: any): Promise<string> => {
  let content = "";

  console.log("Processing PDF Item:", fn, args); // Log the operator and arguments to see what's being processed

  // Process Text (e.g., rendering text, handles fonts, and styles)
  if (fn === pdfjsLib.OPS.beginText) {
    content += "<span>"; // Start of text span
    console.log("Begin Text Span");
  } else if (fn === pdfjsLib.OPS.showText || fn === pdfjsLib.OPS.showSpacedText) {
    const text = args[0]; // Get the actual text string
    const style = `font-family: ${args[1]}; color: rgb(0, 0, 0);`; // Assuming args[1] is the font name
    content += `<span style="${style}">${text}</span>`; // Text
    console.log("Show Text:", text); // Log the text being processed
  } else if (fn === pdfjsLib.OPS.endText) {
    content += "</span>"; // End of text span
    console.log("End Text Span");
  }

  // Process Text (line by line for formatting)
  if (fn === 'text') {
    const { str, transform, fontName } = args;

    // Handling blank lines, bullet points, etc.
    if (isBlankLine(str)) {
      content += "<br />"; // Blank line
      console.log("Blank Line");
    } else if (isBulletPoint(str)) {
      content += `<ul><li>${str}</li></ul>`; // Bullet point (list item)
      console.log("Bullet Point:", str);
    } else {
      const style = `font-family: ${fontName}; color: rgb(0, 0, 0);`;
      content += `<span style="${style}">${str}</span>`; // Normal text
      console.log("Normal Text:", str);
    }
  }

  // Handling Glyph Data (each glyph represents a character in the text)
  if (Array.isArray(args)) {
    args.forEach((item: any) => {
      if (Array.isArray(item)) {
        const textContent = convertGlyphsToText(item); // Convert glyphs to text
        content += `<span>${textContent}</span>`; // Render as text
        console.log("Glyphs as Text:", textContent);
      }
    });
  }

  // Process Images (Handle image rendering)
  if (fn === pdfjsLib.OPS.paintImageXObject || fn === pdfjsLib.OPS.paintXObject) {
    const img = await page.objs.get(args[0]);
    if (img) {
      const imgUrl = URL.createObjectURL(new Blob([img.data], { type: "image/png" }));
      content += `<img src="${imgUrl}" style="max-width: 100%; margin: 5px;" />`; // Image
      console.log("Image Processed:", imgUrl); // Log the image URL
    }
  }

  // If args is an object, ensure to extract necessary data, avoid `[object Object]`
  if (args && typeof args === 'object') {
    content += `<pre>${JSON.stringify(args)}</pre>`; // Debugging: Convert object to string
    console.log("Object Args:", JSON.stringify(args)); // Log the object arguments
  }

  return content;
};
