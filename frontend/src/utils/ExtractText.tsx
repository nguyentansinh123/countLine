import * as pdfjsLib from 'pdfjs-dist';

const PT_TO_PX = 1.333;
const LINE_TOLERANCE = 5;
const CONTENT_PADDING_TOLERANCE = 10;

const normalizeColorValue = (value: number): number => {
  if (value >= 0 && value <= 1) {
    return Math.round(value * 255);
  }
  if (value > 255) {
    return value <= 65535
      ? Math.round((value / 65535) * 255)
      : 255;
  }
  return Math.max(0, Math.min(255, Math.round(value)));
};

const normalizeColor = (color: string | number[]): string => {
  if (Array.isArray(color)) {
    const [r, g, b] = color.map(normalizeColorValue);
    return `rgb(${r}, ${g}, ${b})`;
  }

  if (typeof color === 'string') {
    if (/65(025|535)/.test(color)) {
      return 'rgb(255, 255, 255)';
    }

    const matches = color.match(/\d+\.?\d*/g);
    if (matches && matches.length >= 3) {
      const [r, g, b] = matches.slice(0, 3).map(Number).map(normalizeColorValue);
      return `rgb(${r}, ${g}, ${b})`;
    }
  }

  return 'rgb(0, 0, 0)';
};

const getStyledHTMLFromOperatorList = async (page: any): Promise<string> => {
  const [operatorList, textContent] = await Promise.all([
    page.getOperatorList(),
    page.getTextContent(),
  ]);
  const viewport = page.getViewport({ scale: 1.0 });

  const fnArray = operatorList.fnArray;
  const argsArray = operatorList.argsArray;

  const words: any[] = [];
  const lines: any[] = [];

  let currentColor = 'rgb(0, 0, 0)';
  let currentFontSize = 12;
  let currentTransform = [1, 0, 0, 1, 0, 0];
  let currentStrokeColor = 'rgb(0, 0, 0)';
  let currentPath: [number, number][] = [];

  const textItems = [...textContent.items];
  let matchedIndices = new Set<number>();

  for (let i = 0; i < fnArray.length; i++) {
    const fnId = fnArray[i];
    const args = argsArray[i];

    switch (fnId) {
      case pdfjsLib.OPS.setFillRGBColor:
        currentColor = normalizeColor(`rgb(${Math.round(args[0] * 255)}, ${Math.round(args[1] * 255)}, ${Math.round(args[2] * 255)})`);
        break;
      case pdfjsLib.OPS.setFillGray:
        const gray = Math.round(args[0] * 255);
        currentColor = normalizeColor(`rgb(${gray}, ${gray}, ${gray})`);
        break;
      case pdfjsLib.OPS.setStrokeRGBColor:
        currentStrokeColor = `rgb(${Math.round(args[0] * 255)}, ${Math.round(args[1] * 255)}, ${Math.round(args[2] * 255)})`;
        break;
      case pdfjsLib.OPS.setFont:
        [, currentFontSize] = args;
        break;
      case pdfjsLib.OPS.setTextMatrix:
        currentTransform = args;
        break;
      case pdfjsLib.OPS.moveTo:
        currentPath = [[args[0], args[1]]];
        break;
      case pdfjsLib.OPS.lineTo:
        currentPath.push([args[0], args[1]]);
        break;
      case pdfjsLib.OPS.stroke:
        if (currentPath.length >= 2) {
          for (let j = 0; j < currentPath.length - 1; j++) {
            const [x1, y1] = currentPath[j];
            const [x2, y2] = currentPath[j + 1];
            lines.push({
              x1, y1: viewport.height - y1,
              x2, y2: viewport.height - y2,
              color: currentStrokeColor,
            });
          }
        }
        currentPath = [];
        break;
        
        
        case pdfjsLib.OPS.showText:
        const glyphs = args[0];
        const textStr = glyphs.map((g: any) => g.unicode || '').join('');
        
        // Find matching text item (using fuzzy matching for better reliability)
        const itemIndex = textItems.findIndex((item, index) => {
          if (matchedIndices.has(index)) return false;
          
          // Normalize strings for comparison (trim and collapse whitespace)
          const itemStr = item.str.replace(/\s+/g, ' ').trim();
          const glyphStr = textStr.replace(/\s+/g, ' ').trim();
          
          return itemStr === glyphStr || 
                 (glyphStr.length > 0 && itemStr.includes(glyphStr));
        });
      
        if (itemIndex !== -1) {
          const item = textItems[itemIndex];
          matchedIndices.add(itemIndex);
      
          // Get detailed font info if available
          const font = item.fontName || 'sans-serif';
          const fontSize = currentFontSize * PT_TO_PX;
          const fontHeight = fontSize * 1.2; // Approximate line height
          
          // Calculate character positions more accurately
          let currentX = item.transform[4];
          const startY = viewport.height - item.transform[5] - (fontSize * 0.8); // Baseline adjustment
          
          // Handle both combined and individual glyph cases
          if (glyphs.length === 1 || item.str.length === glyphs.length) {
            // Individual glyph positioning
            for (let i = 0; i < glyphs.length; i++) {
              const glyph = glyphs[i];
              if (!glyph.unicode || glyph.unicode.trim() === '') continue;
              
              // Use actual glyph width if available, otherwise estimate
              const glyphWidth = glyph.width || 
                               (item.width / item.str.length) || 
                               (fontSize * 0.6); // Fallback
              
              words.push({
                text: glyph.unicode,
                x: currentX,
                y: startY,
                width: glyphWidth,
                height: fontHeight,
                color: currentColor,
                fontSize: fontSize,
                font: font,
                isSpace: glyph.unicode.trim() === ''
              });
              
              currentX += glyphWidth;
            }
          } else {
            // Combined text item (treat as single word)
            words.push({
              text: item.str,
              x: currentX,
              y: startY,
              width: item.width,
              height: fontHeight,
              color: currentColor,
              fontSize: fontSize,
              font: font,
              isSpace: false
            });
          }
        }
        break;
    }
  }

  // Group words into lines
  const lineMap = new Map<number, any[]>();
  for (const word of words) {
    const roundedY = Math.round(word.y / LINE_TOLERANCE) * LINE_TOLERANCE;
    if (!lineMap.has(roundedY)) lineMap.set(roundedY, []);
    lineMap.get(roundedY)!.push(word);
  }

  const allX = words.map(w => w.x);
  const minX = Math.min(...allX);
  const maxX = Math.max(...allX);
  const contentPadding = {
    left: Math.max(0, minX - CONTENT_PADDING_TOLERANCE),
    right: Math.max(0, viewport.width - maxX - CONTENT_PADDING_TOLERANCE),
  };

  const linesHTML = Array.from(lineMap.entries())
    .sort(([y1], [y2]) => y1 - y2)
    .map(([y, words]) => {
      words.sort((a, b) => a.x - b.x);
      let previousRight = 0;

      const wordSpans = words.map((word, i) => {
        const marginLeft = i > 0 ? Math.max(0, word.x - previousRight) : 0;
        previousRight = word.x + word.width;

        return `<span style="
          display: inline-block;
          margin-left: ${marginLeft}px;
          color: ${word.color};
          font-size: ${word.fontSize}px;
          font-family: ${word.font};
          white-space: pre;
        ">${word.text}</span>`;
      });

      const baseIndent = Math.max(0, words[0].x - contentPadding.left);
      return `
        <div style="
          margin-left: ${baseIndent}px;
          margin-top: 2px;
          margin-bottom: 2px;
        ">
          ${wordSpans.join('')}
        </div>
      `;
    });

  const lineSVGs = lines.map(line => `
    <line x1="${line.x1}" y1="${line.y1}" x2="${line.x2}" y2="${line.y2}"
      stroke="${line.color}" stroke-width="1" />
  `).join('\n');

  return `
    <div style="
      position: relative;
      width: ${viewport.width}px;
      min-height: ${viewport.height}px;
      padding: 10px ${contentPadding.right}px 10px ${contentPadding.left}px;
    ">
      <svg width="${viewport.width}" height="${viewport.height}" style="position: absolute; left: 0; top: 0;">
        ${lineSVGs}
      </svg>
      ${linesHTML.join('\n')}
    </div>
  `;
};

const extractTextAndColorsFromPDF = async (page: any): Promise<{ html: string }> => {
  const html = await getStyledHTMLFromOperatorList(page);
  return { html };
};

export default extractTextAndColorsFromPDF;
