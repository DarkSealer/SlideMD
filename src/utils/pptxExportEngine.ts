import pptxgen from 'pptxgenjs';
import { PresentationDeck } from '../types/presentation';
import { parseMarkdownToSlides } from './markdownParser';

export interface PptxExportOptions {
  includeNotes?: boolean;
  onProgress?: (current: number, total: number) => void;
}

// Map presentation theme IDs to cohesive PPTX color tokens
function getThemeColors(themeId?: string) {
  const isLight = themeId === 'minimal-light' || themeId === 'academic' || themeId === 'paper';
  if (isLight) {
    return {
      bg: 'FFFFFF',
      title: '0F172A',
      accent: '4F46E5',
      body: '334155',
      cardBg: 'F8FAFC',
      border: 'E2E8F0',
      codeBg: 'F1F5F9',
    };
  }

  // Dark themes (default)
  return {
    bg: '0F172A',
    title: 'F8FAFC',
    accent: '818CF8',
    body: 'CBD5E1',
    cardBg: '1E293B',
    border: '334155',
    codeBg: '020617',
  };
}

// Clean HTML tags and markdown formatting from text runs
function cleanText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\[!NOTE\]|\[!TIP\]|\[!WARNING\]|\[!IMPORTANT\]/g, '')
    .trim();
}

/**
 * Generates and downloads a client-side Microsoft PowerPoint (.pptx) presentation
 * synthesized directly in the browser memory using PptxGenJS.
 */
export async function exportToPptx(
  deck: PresentationDeck,
  options: PptxExportOptions = {}
): Promise<void> {
  const { includeNotes = true, onProgress } = options;
  const slides = parseMarkdownToSlides(deck.markdown);
  const colors = getThemeColors(deck.settings?.theme);

  // Initialize PPTX document
  const pres = new pptxgen();

  // Set document title and metadata
  pres.title = deck.title || 'SlideMD Presentation';
  pres.subject = deck.description || 'Created with SlideMD';
  pres.author = 'SlideMD';

  // Set aspect ratio matching deck settings
  if (deck.settings?.aspectRatio === '4:3') {
    pres.layout = 'LAYOUT_4x3';
  } else {
    pres.layout = 'LAYOUT_16x9';
  }

  const isWide = pres.layout === 'LAYOUT_16x9';
  const slideWidth = isWide ? 10.0 : 10.0;
  const slideHeight = isWide ? 5.625 : 7.5;

  for (let idx = 0; idx < slides.length; idx++) {
    const slideData = slides[idx];
    if (onProgress) {
      onProgress(idx + 1, slides.length);
    }

    const slide = pres.addSlide();

    // Set background color
    slide.background = { color: colors.bg };

    // Slide header bar or subtle accent line at top
    slide.addShape(pres.ShapeType.rect, {
      x: 0,
      y: 0,
      w: slideWidth,
      h: 0.08,
      fill: { color: colors.accent },
    });

    // Parse slide lines
    const lines = slideData.rawMarkdown.split('\n');
    let titleText = '';
    const bodyItems: { type: 'bullet' | 'text' | 'code' | 'callout'; content: string }[] = [];
    let inCode = false;
    let codeBuffer: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Skip slide separators
      if (trimmed === '---' || trimmed === '--') continue;

      // Handle Code Blocks
      if (trimmed.startsWith('```')) {
        if (!inCode) {
          inCode = true;
          codeBuffer = [];
        } else {
          inCode = false;
          if (codeBuffer.length > 0) {
            bodyItems.push({ type: 'code', content: codeBuffer.join('\n') });
          }
        }
        continue;
      }

      if (inCode) {
        codeBuffer.push(line);
        continue;
      }

      // Title detection (first H1 or H2)
      if (!titleText && (trimmed.startsWith('# ') || trimmed.startsWith('## '))) {
        titleText = cleanText(trimmed.replace(/^#+\s*/, ''));
        continue;
      }

      // Bullet points
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        bodyItems.push({
          type: 'bullet',
          content: cleanText(trimmed.substring(2)),
        });
        continue;
      }

      // Numbered lists
      if (/^\d+\.\s/.test(trimmed)) {
        bodyItems.push({
          type: 'bullet',
          content: cleanText(trimmed.replace(/^\d+\.\s*/, '')),
        });
        continue;
      }

      // Callouts / Quotes
      if (trimmed.startsWith('>')) {
        bodyItems.push({
          type: 'callout',
          content: cleanText(trimmed.substring(1)),
        });
        continue;
      }

      // Standard paragraphs (non-empty)
      if (trimmed && !trimmed.startsWith('Note:') && !trimmed.startsWith('<!--')) {
        const cleaned = cleanText(trimmed);
        if (cleaned) {
          bodyItems.push({ type: 'text', content: cleaned });
        }
      }
    }

    // Default title if slide had none
    if (!titleText) {
      titleText = idx === 0 ? deck.title : `Slide ${idx + 1}`;
    }

    // 1. Add Slide Title
    slide.addText(titleText, {
      x: 0.8,
      y: 0.5,
      w: slideWidth - 1.6,
      h: 0.9,
      fontSize: idx === 0 ? 32 : 26,
      fontFace: 'Arial',
      bold: true,
      color: colors.title,
      valign: 'middle',
    });

    // 2. Add Body Content
    let currentY = 1.6;
    const availableHeight = slideHeight - currentY - 0.6;

    if (bodyItems.length > 0) {
      // Group bullets together for PowerPoint bullet list formatting
      const textRuns: pptxgen.TextProps[] = [];

      bodyItems.forEach((item) => {
        if (item.type === 'bullet') {
          textRuns.push({
            text: item.content,
            options: {
              bullet: true,
              fontSize: 16,
              color: colors.body,
              breakLine: true,
              indentLevel: 0,
            },
          });
        } else if (item.type === 'callout') {
          textRuns.push({
            text: `💡 ${item.content}`,
            options: {
              fontSize: 15,
              color: colors.accent,
              bold: true,
              breakLine: true,
            },
          });
        } else if (item.type === 'code') {
          textRuns.push({
            text: item.content,
            options: {
              fontFace: 'Courier New',
              fontSize: 12,
              color: colors.title,
              breakLine: true,
            },
          });
        } else {
          textRuns.push({
            text: item.content,
            options: {
              fontSize: 15,
              color: colors.body,
              breakLine: true,
            },
          });
        }
      });

      slide.addText(textRuns, {
        x: 0.8,
        y: currentY,
        w: slideWidth - 1.6,
        h: availableHeight,
        valign: 'top',
        lineSpacing: 26,
      });
    }

    // 3. Slide Number in Footer
    slide.addText(`${idx + 1} / ${slides.length}`, {
      x: slideWidth - 2.0,
      y: slideHeight - 0.45,
      w: 1.5,
      h: 0.3,
      fontSize: 10,
      color: colors.body,
      align: 'right',
    });

    // 4. Deck Title in Footer
    slide.addText(deck.title, {
      x: 0.8,
      y: slideHeight - 0.45,
      w: slideWidth - 3.0,
      h: 0.3,
      fontSize: 10,
      color: colors.body,
      align: 'left',
    });

    // 5. Attach Speaker Notes (visible in PowerPoint Presenter View)
    if (includeNotes && slideData.speakerNotes && slideData.speakerNotes.trim()) {
      slide.addNotes(slideData.speakerNotes.trim());
    }
  }

  // Generate file name and trigger download
  const safeFilename =
    deck.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') ||
    'presentation';

  await pres.writeFile({ fileName: `${safeFilename}.pptx` });
}
