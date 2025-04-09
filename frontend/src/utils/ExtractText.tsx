import * as pdfjsLib from 'pdfjs-dist';

interface TextItem {
  str: string;
  transform: number[];
  width: number;
  height: number;
  fontName: string;
  color?: number[] | string;
  fontSize?: number;
  textDecoration?: string;
  fontStyle?: string;
  fontWeight?: string;
}

const PT_TO_PX = 1.333;
const LINE_TOLERANCE = 5;

const CONTENT_PADDING_TOLERANCE = 5; // Reduced padding tolerance

const extractTextAndColorsFromPDF = async (page: any): Promise<{ html: string }> => {
  const textContent = await page.getTextContent();
  const viewport = page.getViewport({ scale: 1.0 });

  // Detect content boundaries with precise measurements
  let minX = Infinity, maxX = -Infinity;
  const linesMap = new Map<number, TextItem[]>();
  
  textContent.items.forEach((item: TextItem) => {
    if (!item.str?.trim()) return;

    const x = item.transform[4];
    const itemEndX = x + item.width;
    
    // Update content boundaries
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, itemEndX);

    const baseY = viewport.height - item.transform[5];
    const normalizedY = Math.round(baseY / LINE_TOLERANCE) * LINE_TOLERANCE;
    
    const lineItems = linesMap.get(normalizedY) || [];
    lineItems.push(item);
    linesMap.set(normalizedY, lineItems);
  });

  // Calculate content area with conservative padding
  const contentPadding = {
    left: Math.max(0, minX - CONTENT_PADDING_TOLERANCE),
    right: Math.max(0, viewport.width - maxX - CONTENT_PADDING_TOLERANCE)
  };


  // Process lines with enhanced legal document handling
  const lineElements = Array.from(linesMap.entries())
    .sort(([y1], [y2]) => y1 - y2)
    .map(([y, items]) => {
      items.sort((a, b) => a.transform[4] - b.transform[4]);

      // Calculate line metrics
      const lineStart = items[0].transform[4];
      const lineEnd = items[items.length - 1].transform[4] + items[items.length - 1].width;
      const lineCenter = (lineStart + lineEnd) / 2;

      // Determine alignment with legal document priorities
      let alignment = 'left';
      const isNumberedClause = /^\(\w+\)/.test(items[0].str.trim());

      // Only consider center alignment for text spanning >40% of content width

      // Calculate precise word spacing
      let previousRight = 0;
      const lineContent = items.map((item, index) => {
        const x = item.transform[4];
        const marginLeft = index > 0 ? Math.max(0, x - previousRight) : 0;
        previousRight = x + item.width;

        // Convert color
        let color = 'black';
        if (item.color) {
          if (Array.isArray(item.color)) {
            const [r, g, b] = item.color.map(c => 
              Math.min(255, Math.max(0, Math.round(c * 255))
            ));
            color = `rgb(${r},${g},${b})`;
          }
        }

        // Calculate font properties
        const fontSize = item.fontSize 
          ? `${Math.round(item.fontSize * PT_TO_PX)}px`
          : `${Math.round(item.height * 1.15)}px`;

        const styles = [
          `display: inline-block`,
          `margin-left: ${marginLeft}px`,
          `color: ${color}`,
          `font-size: ${fontSize}`,
          `font-family: ${item.fontName || 'sans-serif'}`,
          item.fontWeight === 'bold' ? 'font-weight: bold' : '',
          item.fontStyle === 'italic' ? 'font-style: italic' : '',
          item.textDecoration?.includes('underline') ? 'text-decoration: underline' : '',
        ].filter(s => s).join('; ');

        return `<span style="${styles}">${item.str}</span>`;
      });

      // Apply indentation for numbered clauses
      const baseIndent = isNumberedClause 
        ? contentPadding.left + 20 
        : Math.max(0, lineStart - contentPadding.left);

      return `
        <div style="
          margin-left: ${baseIndent}px;
          ${alignment === 'center' ? `
            margin: 0 auto; 
            width: ${lineEnd - lineStart}px;
            text-align: center;
          ` : 'text-align: left;'}
          margin-top: 2px;
          margin-bottom: 2px;
        ">
          ${lineContent.join('')}
        </div>
      `;
    });

  return {
    html: `
      <div style="
        width: ${viewport.width}px;
        min-height: ${viewport.height}px;
        padding: 10px ${contentPadding.right}px 10px ${contentPadding.left}px;
        min-height: ${viewport.height}px;
      ">
        ${lineElements.join('\n')}
      </div>
      <br/>
    `
  };
};

export default extractTextAndColorsFromPDF;