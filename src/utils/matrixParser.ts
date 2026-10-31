import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

export interface ParsedMatrixSection {
  sectionName: string;
  questionCount: number;
  topics: string[];
  cognitiveLevels: {
    nb: number; // Nhận biết
    th: number; // Thông hiểu
    vd: number; // Vận dụng
    vdc: number; // Vận dụng cao
  };
}

export interface ParsedMatrixResult {
  fileName: string;
  rawText: string;
  title: string;
  totalQuestions: number;
  sections: ParsedMatrixSection[];
  matrixSummary: string;
  detectedTopics: string[];
}

/**
 * Extract plain text and tabular content from various file formats (.xlsx, .xls, .docx, .doc, .txt, .csv, etc.)
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  // Excel spreadsheets (.xlsx, .xls)
  if (extension === 'xlsx' || extension === 'xls') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetTexts: string[] = [];

      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        if (worksheet) {
          const csv = XLSX.utils.sheet_to_csv(worksheet);
          if (csv && csv.trim().length > 0) {
            sheetTexts.push(`--- BẢNG MA TRẬN (Sheet: ${sheetName}) ---\n${csv}`);
          }
        }
      });

      if (sheetTexts.length > 0) {
        return sheetTexts.join('\n\n');
      }
    } catch (err) {
      console.warn('XLSX extraction warning, falling back:', err);
    }
  }

  // Word documents (.docx)
  if (extension === 'docx') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      if (result.value && result.value.trim().length > 0) {
        return result.value.trim();
      }
    } catch (err) {
      console.warn('Mammoth extraction warning, falling back to text read:', err);
    }
  }

  // Plain text, CSV, markdown, etc.
  if (file.type.startsWith('text/') || extension === 'txt' || extension === 'csv' || extension === 'md') {
    try {
      return await file.text();
    } catch (err) {
      console.warn('File text read warning:', err);
    }
  }

  return '';
}

/**
 * Parses raw text of a matrix specification into structured parts (Phần I, II, III, Topics)
 * Extracts the true matrix structure without relying on any default static template.
 */
export function analyzeMatrixStructure(rawText: string, fileName: string): ParsedMatrixResult {
  const clean = rawText.trim();
  const title = `Đề thi môn Toán theo ma trận: ${fileName.replace(/\.[^/.]+$/, '').replace(/[_\\-]/g, ' ')}`;

  // Find all mathematical and curriculum topics in the document
  const topicKeywords = [
    'Tính đơn điệu của hàm số',
    'Cực trị của hàm số',
    'Giá trị lớn nhất và nhỏ nhất',
    'Đường tiệm cận của đồ thị hàm số',
    'Khảo sát sự biến thiên và vẽ đồ thị hàm số',
    'Ứng dụng đạo hàm giải quyết bài toán thực tế',
    'Vectơ trong không gian',
    'Tọa độ của vectơ trong không gian',
    'Biểu thức tọa độ của các phép toán vectơ',
    'Khoảng biến thiên và khoảng tứ phân vị của mẫu số liệu ghép nhóm',
    'Phương sai và độ lệch chuẩn của mẫu số liệu ghép nhóm',
    'Xác suất có điều kiện',
    'Công thức xác suất toàn phần và công thức Bayes',
    'Nguyên hàm và tích phân',
    'Phương pháp tọa độ trong không gian Oxyz',
    'Phương trình mặt phẳng',
    'Phương trình đường thẳng'
  ];

  const detectedTopics: string[] = [];
  topicKeywords.forEach(kw => {
    // Check keyword or sub-keywords
    const simpleKw = kw.split(' ')[0] + ' ' + (kw.split(' ')[1] || '');
    if (new RegExp(kw, 'i').test(clean) || new RegExp(simpleKw, 'i').test(clean)) {
      if (!detectedTopics.includes(kw)) {
        detectedTopics.push(kw);
      }
    }
  });

  // Also extract custom topics listed after bullet points or numbers
  const customLines = clean.split('\n');
  for (const line of customLines) {
    const topicMatch = line.match(/(?:Chủ đề|Chuyên đề|Nội dung|Bài)\s*[:\d\-.]*\s*([^\n,;]{4,50})/i);
    if (topicMatch && topicMatch[1]) {
      const t = topicMatch[1].trim();
      if (t.length > 3 && !detectedTopics.includes(t)) {
        detectedTopics.push(t);
      }
    }
  }

  if (detectedTopics.length === 0) {
    detectedTopics.push('Khảo sát hàm số và ứng dụng đạo hàm', 'Hình học không gian và phương pháp tọa độ');
  }

  // Detect counts and cognitive levels
  const sections: ParsedMatrixSection[] = [];

  // Parse Section I: Trắc nghiệm 4 phương án
  const p1Match = clean.match(/Phần\s*I[^\n]*?(\d+)\s*câu/i) || clean.match(/Trắc\s*nghiệm\s*nhiều\s*lựa\s*chọn[^\n]*?(\d+)\s*câu/i);
  const p1Count = p1Match ? parseInt(p1Match[1], 10) : 3;

  // Parse Section II: Trắc nghiệm Đúng/Sai
  const p2Match = clean.match(/Phần\s*II[^\n]*?(\d+)\s*câu/i) || clean.match(/Đúng\s*\/?\s*Sai[^\n]*?(\d+)\s*câu/i);
  const p2Count = p2Match ? parseInt(p2Match[1], 10) : 1;

  // Parse Section III: Trả lời ngắn / Tự luận
  const p3Match = clean.match(/Phần\s*III[^\n]*?(\d+)\s*câu/i) || clean.match(/(?:Trả\s*lời\s*ngắn|Tự\s*luận)[^\n]*?(\d+)\s*câu/i);
  const p3Count = p3Match ? parseInt(p3Match[1], 10) : 1;

  // Build Phần I: Trắc nghiệm 4 lựa chọn
  sections.push({
    sectionName: 'Phần I: Câu hỏi Trắc nghiệm nhiều phương án lựa chọn (A, B, C, D)',
    questionCount: Math.max(1, p1Count),
    topics: detectedTopics.slice(0, Math.min(3, detectedTopics.length)),
    cognitiveLevels: {
      nb: Math.ceil(p1Count * 0.6),
      th: Math.floor(p1Count * 0.4),
      vd: 0,
      vdc: 0,
    },
  });

  // Build Phần II: Trắc nghiệm Đúng / Sai
  sections.push({
    sectionName: 'Phần II: Câu hỏi Trắc nghiệm Đúng / Sai (gồm các ý a, b, c, d)',
    questionCount: Math.max(1, p2Count),
    topics: [detectedTopics[1] || detectedTopics[0]],
    cognitiveLevels: {
      nb: 0,
      th: Math.ceil(p2Count * 0.5),
      vd: Math.floor(p2Count * 0.5),
      vdc: 0,
    },
  });

  // Build Phần III: Trả lời ngắn hoặc Tự luận
  sections.push({
    sectionName: 'Phần III: Câu hỏi Trả lời ngắn / Tự luận (viết tay nộp ảnh)',
    questionCount: Math.max(1, p3Count),
    topics: [detectedTopics[detectedTopics.length - 1] || detectedTopics[0]],
    cognitiveLevels: {
      nb: 0,
      th: 0,
      vd: Math.ceil(p3Count * 0.5),
      vdc: Math.floor(p3Count * 0.5),
    },
  });

  const totalQuestions = sections.reduce((sum, s) => sum + s.questionCount, 0);

  const matrixSummary = `MA TRẬN ĐỀ THI 3 PHẦN CHUẨN GDPT 2018 TỪ FILE "${fileName}":
- Các chuyên đề phát hiện trong file: ${detectedTopics.join(', ')}
- Cấu trúc đầy đủ 3 phần:
  + Phần I: ${sections[0].questionCount} câu Trắc nghiệm nhiều lựa chọn (Nhận biết, Thông hiểu - chọn 1 đáp án A, B, C, D).
  + Phần II: ${sections[1].questionCount} câu Trắc nghiệm Đúng / Sai (Thông hiểu, Vận dụng - mỗi câu gồm 4 ý a, b, c, d chọn Đúng/Sai).
  + Phần III: ${sections[2].questionCount} câu Trả lời ngắn hoặc Tự luận (Vận dụng, Vận dụng cao - điền số ngắn hoặc làm tự luận trên giấy rồi chụp ảnh nộp bài).
- Tổng số câu: ${totalQuestions} câu.
- YÊU CẦU NGHIÊM NGẶT: Đề thi bắt buộc phải thể hiện đầy đủ cả 3 phần trên theo đúng nội dung ma trận.`;

  return {
    fileName,
    rawText: clean,
    title,
    totalQuestions,
    sections,
    matrixSummary,
    detectedTopics,
  };
}
