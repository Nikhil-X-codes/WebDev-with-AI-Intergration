import mammoth from 'mammoth';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const standardFontDataUrl = new URL(
  '../../node_modules/pdfjs-dist/standard_fonts/',
  import.meta.url
).href;

const workerSrc = new URL(
  '../../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs',
  import.meta.url
).href;

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

function toUint8Array(input) {
  if (input instanceof Uint8Array && !(input instanceof Buffer)) {
    return input;
  }

  if (Buffer.isBuffer(input)) {
    return new Uint8Array(
      input.buffer,
      input.byteOffset,
      input.byteLength
    );
  }

  if (input instanceof ArrayBuffer) {
    return new Uint8Array(input);
  }

  throw new Error(`Unsupported buffer type: ${input?.constructor?.name}`);
}

async function getPdfMetadata(buffer) {
  try {
    const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    return {
      pageCount: pdfDoc.getPageCount(),
      title: pdfDoc.getTitle?.() || null,
      author: pdfDoc.getAuthor?.() || null,
      subject: pdfDoc.getSubject?.() || null,
      keywords: pdfDoc.getKeywords?.() || null,
      producer: pdfDoc.getProducer?.() || null,
      createdAt: pdfDoc.getCreationDate
        ? pdfDoc.getCreationDate()?.toISOString?.() || null
        : null,
      modifiedAt: pdfDoc.getModificationDate
        ? pdfDoc.getModificationDate()?.toISOString?.() || null
        : null
    };
  } catch (error) {
    
    return null;
  }
}

export function validateFile(file, maxSizeMB = 5) {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, error: `File size exceeds ${maxSizeMB}MB limit.` };
  }

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return { valid: false, error: 'Unsupported file type. Allowed: PDF, DOC, DOCX, TXT.' };
  }

  return { valid: true };
}

async function extractTextFromPdf(buffer) {
  try {
    

    const uint8Array = toUint8Array(buffer);
    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      useSystemFonts: true,
      standardFontDataUrl
    });

    const pdf = await loadingTask.promise;
    

    const pageTexts = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      const text = textContent.items
        .map((item) => {
          if (typeof item === 'string') return item;
          if (item.str) return item.str;
          return '';
        })
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (text.length > 0) {
        pageTexts.push(text);
      }
    }

    const combinedText = pageTexts.join('\n\n').trim();

    const metadata = await getPdfMetadata(buffer);
    if (metadata) {
      
    }

    if (!combinedText) {
      const fallbackNote = 'No extractable text found in PDF. The document may be image-based (scanned) or uses embedded fonts that prevent text extraction.';
      const metaText = metadata
        ? `Pages: ${metadata.pageCount || 'N/A'}; Title: ${metadata.title || 'N/A'}; Author: ${metadata.author || 'N/A'}`
        : 'Metadata unavailable';
      const safeSummary = `\n[Extraction Notice] ${fallbackNote}\n[Metadata] ${metaText}`;
      
      return safeSummary;
    }

    
    return combinedText;
  } catch (error) {
    console.error('[ERROR] PDF extraction error:', error);
    throw new Error(`PDF extraction failed: ${error.message}`);
  }
}

export async function extractTextFromFile(buffer, mimetype) {
  if (!buffer) {
    throw new Error('File buffer is empty.');
  }

  if (!mimetype) {
    throw new Error('MIME type is required.');
  }

  

  try {
    let extractedText = '';

    if (mimetype === 'application/pdf') {
      
      extractedText = await extractTextFromPdf(buffer);
    } else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
      
    } else if (mimetype === 'application/msword') {
      
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
      
    } else if (mimetype === 'text/plain') {
      
      extractedText = buffer.toString('utf-8');
      
    } else {
      throw new Error(`Unsupported MIME type: ${mimetype}`);
    }

    if (!extractedText || extractedText.trim().length === 0) {
      const fallbackText = 'No extractable text found. The file might be empty, corrupted, or image-based. Please upload a text-based PDF/DOC/DOCX/TXT.';
      
      return fallbackText;
    }

    
    return extractedText.trim();
  } catch (error) {
    console.error('[ERROR] File extraction failed:', error.message);
    throw new Error(`Failed to extract text: ${error.message}`);
  }
}