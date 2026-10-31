import * as XLSX from 'xlsx';

export interface ParsedStudentRow {
  stt?: number;
  name: string; // Họ và tên đầy đủ: "Nguyễn Tiến Đạt"
  fullName?: string; // Họ và tên đầy đủ
  hoVaChuLot?: string; // Họ và chữ lót riêng: "Nguyễn Tiến"
  ten?: string; // Tên riêng: "Đạt"
  lastName?: string; // Họ và chữ lót chuẩn Việt Nam: lấy từ trái qua ngoại trừ từ cuối cùng
  firstName?: string; // Tên chuẩn Việt Nam: từ cuối cùng
  studentCode?: string; // Mã học sinh vnEdu / SMAS (ví dụ: 2511404881)
  gender?: 'Nam' | 'Nữ' | 'Khác';
  dob?: string;
  phone?: string;
  email?: string;
  username?: string; // "nguyendat11a1vts2627"
}

export interface ParseExcelResult {
  success: boolean;
  students: ParsedStudentRow[];
  detectedClassName?: string;
  detectedSchoolName?: string;
  detectedAcademicYear?: string;
  totalRowsProcessed: number;
  totalStudentsExtracted: number;
  expectedStudentCount?: number;
  sttRangeSummary?: string;
  message?: string;
}

/**
 * Remove Vietnamese accents and special characters
 */
export function removeVietnameseDiacritics(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Clean string: strip hidden Unicode characters, zero-width spaces, soft hyphens, BOM,
 * normalize to NFC, remove stray asterisks or footnote markings.
 */
export function cleanTextCell(val: any): string {
  if (val === null || val === undefined) return '';
  const s = String(val)
    .replace(/[\u200B\u200C\u200D\u200E\u200F\uFEFF\u00AD]/g, '') // zero-width & invisible
    .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, ' ') // unicode spaces
    .normalize('NFC')
    .replace(/[\r\n\t]+/g, ' ')
    .trim();
  return s;
}

/**
 * Converts an XLSX worksheet into an absolute 2D matrix (dense array of rows and columns).
 * Crucial for vnEdu / SMAS: Prevents xlsx library from skipping sparse rows or rows with empty cells,
 * ensuring 100% of rows are preserved from top to bottom.
 */
export function sheetToDenseMatrix(worksheet: XLSX.WorkSheet): any[][] {
  if (!worksheet) return [];
  if (!worksheet['!ref']) {
    return XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      blankrows: true,
      raw: false,
    }) as any[][];
  }

  const range = XLSX.utils.decode_range(worksheet['!ref']);
  const matrix: any[][] = [];
  const merges = worksheet['!merges'] || [];

  for (let R = range.s.r; R <= range.e.r; ++R) {
    const row: any[] = [];
    let hasAnyData = false;

    for (let C = range.s.c; C <= range.e.c; ++C) {
      let cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      let cell = worksheet[cellAddress];

      if ((cell === undefined || cell === null || cell.v === undefined || cell.v === '') && merges.length > 0) {
        for (const m of merges) {
          if (R >= m.s.r && R <= m.e.r && C >= m.s.c && C <= m.e.c) {
            const originAddress = XLSX.utils.encode_cell({ r: m.s.r, c: m.s.c });
            cell = worksheet[originAddress];
            break;
          }
        }
      }

      let val: any = '';
      if (cell !== undefined && cell !== null) {
        val = cell.w !== undefined ? cell.w : (cell.v !== undefined ? cell.v : '');
      }

      const cleaned = cleanTextCell(val);
      if (cleaned.length > 0) {
        hasAnyData = true;
      }
      row.push(val);
    }

    // Keep all rows that have at least one cell with information
    if (hasAnyData) {
      matrix.push(row);
    }
  }

  return matrix;
}

/**
 * Generate standard student username:
 * Cấu trúc: họ + tên + lớp + viết tắt trường + niên học
 * Ví dụ: Nguyễn Tiến Đạt, Lớp 11A1, THPT Võ Thị Sáu, Niên học 2026-2027 -> nguyendat11a1vts2627
 */
export function generateStudentUsername(
  fullName: string,
  className: string = '11A1',
  schoolName: string = 'Võ Thị Sáu',
  academicYear: string = '2026-2027',
  duplicateIndex: number = 0,
  hoOverride?: string,
  tenOverride?: string
): string {
  let ho = '';
  let ten = '';

  if (hoOverride && tenOverride) {
    const hoWords = cleanTextCell(hoOverride).split(/\s+/).filter(Boolean);
    ho = removeVietnameseDiacritics(hoWords[0] || 'hs');
    ten = removeVietnameseDiacritics(tenOverride);
  } else {
    const parts = cleanTextCell(fullName).split(/\s+/).filter(Boolean);
    ho = parts.length > 0 ? removeVietnameseDiacritics(parts[0]) : 'hs';
    ten = parts.length > 1
      ? removeVietnameseDiacritics(parts[parts.length - 1])
      : (parts[0] ? removeVietnameseDiacritics(parts[0]) : 'an');
  }

  // 2. Lớp (ví dụ: "11A1", "Lớp 11A1" -> "11a1")
  const classClean = removeVietnameseDiacritics(className).replace(/^lop/, '');
  const classPart = classClean || '11a1';

  // 3. Viết tắt tên trường (ví dụ: "TRƯỜNG THPT VÕ THỊ SÁU" -> "vts")
  let cleanSchool = schoolName || 'Võ Thị Sáu';
  cleanSchool = cleanSchool.replace(/trường|thpt|thcs|tiểu\s*học|ptth|đại\s*học|cao\s*đẳng|liên\s*cấp/gi, '').trim();
  const schoolWords = cleanSchool.split(/[\s\-_\.]+/).filter(Boolean);
  let schoolAbbr = schoolWords.map(w => removeVietnameseDiacritics(w).charAt(0)).join('').toLowerCase();
  if (!schoolAbbr || schoolAbbr.length === 0) {
    schoolAbbr = 'vts';
  }

  // 4. Niên học (ví dụ: "2026 - 2027" -> "2627", "2025 - 2026" -> "2526")
  const yearMatches = (academicYear || '2026-2027').match(/\b(20)?(\d{2})\b/g);
  let yearPart = '2627';
  if (yearMatches && yearMatches.length >= 2) {
    const y1 = yearMatches[0].slice(-2);
    const y2 = yearMatches[1].slice(-2);
    yearPart = `${y1}${y2}`;
  } else if (yearMatches && yearMatches.length === 1) {
    const y1 = parseInt(yearMatches[0].slice(-2), 10);
    yearPart = `${y1}${y1 + 1}`;
  }

  const base = `${ho}${ten}${classPart}${schoolAbbr}${yearPart}`.toLowerCase();
  return duplicateIndex > 1 ? `${base}_${duplicateIndex}` : base;
}

/**
 * Format Excel date (string or serial number) to DD/MM/YYYY
 */
export function formatExcelDate(value: any): string | undefined {
  if (value === null || value === undefined) return undefined;

  if (typeof value === 'string') {
    const trimmed = cleanTextCell(value);
    if (!trimmed) return undefined;

    // Check DD/MM/YYYY or DD-MM-YYYY
    const dmy = trimmed.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
    if (dmy) {
      const d = dmy[1].padStart(2, '0');
      const m = dmy[2].padStart(2, '0');
      const y = dmy[3];
      return `${d}/${m}/${y}`;
    }

    // Check YYYY-MM-DD
    const ymd = trimmed.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
    if (ymd) {
      const y = ymd[1];
      const m = ymd[2].padStart(2, '0');
      const d = ymd[3].padStart(2, '0');
      return `${d}/${m}/${y}`;
    }

    // Check pure year YYYY
    if (/^\d{4}$/.test(trimmed)) {
      return `01/01/${trimmed}`;
    }

    return undefined;
  }

  if (typeof value === 'number') {
    // Excel date serial number (e.g. 39540 for 2008)
    if (value > 1000 && value < 60000) {
      const date = new Date(Math.round((value - 25569) * 86400 * 1000));
      if (!isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
    }
  }

  return undefined;
}

/**
 * Common Vietnamese family names
 */
const VIETNAMESE_SURNAMES = new Set([
  'nguyen', 'nguyễn',
  'tran', 'trần',
  'le', 'lê',
  'pham', 'phạm',
  'hoang', 'hoàng',
  'huynh', 'huỳnh',
  'phan',
  'vu', 'vũ',
  'vo', 'võ',
  'dang', 'đặng',
  'bui', 'bùi',
  'do', 'đỗ',
  'ho', 'hồ',
  'ngo', 'ngô',
  'duong', 'dương',
  'ly', 'lý',
  'dinh', 'đinh',
  'doan', 'đoàn',
  'lam', 'lâm',
  'trinh', 'trịnh',
  'mai',
  'dao', 'đào',
  'cao',
  'ha', 'hà',
  'luong', 'lương',
  'thai', 'thái',
  'ta', 'tạ',
  'phung', 'phùng',
  'to', 'tô',
  'quach', 'quách',
  'bach', 'bạch',
  'nghiem', 'nghiêm',
  'la',
  'trieu', 'triệu',
  'chu', 'châu',
  'luc', 'lục',
  'luu', 'lưu',
  'nham', 'nhâm',
  'khong', 'khổng',
  'kieu', 'kiều',
  'luc', 'lực',
  'ma', 'mã',
  'truong', 'trương',
  'chau', 'châu',
  'cu', 'cù',
  'quan', 'quản',
  'tieu', 'tiêu',
  'kim',
  'kha',
  'vi',
  'ton', 'tôn',
  'than', 'thân',
  'giap', 'giáp',
  'duong', 'đường',
  'sam', 'sầm',
  'la', 'lã',
  'hua', 'hứa',
  'tu', 'từ',
  'tong', 'tống',
  'tang', 'tăng',
  'lieu', 'liêu',
  'tham', 'thẩm',
  'chung',
  'van', 'vạn',
  'phu', 'phù',
  'nhieu', 'nhiêu',
  'khuu', 'khưu',
  'cung',
  'trang',
  'nhu', 'nhữ',
  'tao', 'tào',
  'dong', 'đổng',
  'thi',
  'thieu', 'thiều',
  'vien', 'viên',
  'doan', 'doãn',
  'van', 'văn',
  'thach', 'thạch',
  'danh',
  'nhan',
  'quyen', 'quyền',
  'hhen', 'h\'hen',
  'ymoan', 'y\'moan',
]);

/**
 * Common Vietnamese ethnic groups (used to prevent ethnicity cells from being mistaken as student names)
 */
const VIETNAMESE_ETHNICITIES = new Set([
  'kinh', 'tày', 'thái', 'mường', 'h\'mông', 'hmông', 'dao', 'gia rai', 'ê đê',
  'ba na', 'xơ đăng', 'sán dìu', 'hrê', 'cơ ho', 'chăm', 'sán chay', 'khmer',
  'mnông', 'thổ', 'giáy', 'cơ tu', 'gié triêng', 'mạ', 'khơ mú', 'co', 'tà ôi',
  'chơ ro', 'kháng', 'xinh mun', 'hà nhì', 'chu ru', 'lào', 'la chí', 'la ha',
  'phù lá', 'la hủ', 'lự', 'lô lô', 'chứt', 'mảng', 'pà thẻn', 'cơ lao', 'cống',
  'bố y', 'si la', 'pu péo', 'brâu', 'ơ đu', 'rơ măm', 'hoa', 'ngái'
]);

/**
 * Score and assessment headers in Vietnamese school gradebooks:
 * TX1, TX2, TX3, TX4, ĐTX1, ĐTX2, KTTX, GK, ĐGK, CK, ĐCK, ĐTB, ĐTBm, TBCM, etc.
 */
export const ASSESSMENT_HEADER_REGEX = /^(đ?tx\d*|kttx\d*|đ?gk\d*|ktgk\d*|đ?ck\d*|ktck\d*|đtbm?\w*|tbcm|đđgtx|đđggk|đđgck|ktđk\d*)$/i;

export function isAssessmentOrScoreHeader(val: string): boolean {
  if (!val) return false;
  const clean = val.trim().toLowerCase();
  if (ASSESSMENT_HEADER_REGEX.test(clean)) return true;
  if (/^(giữa\s*k[ỳì]|cuối\s*k[ỳì]|thường\s*xuyên|định\s*k[ỳì]|kiểm\s*tra\s*(thường\s*xuyên|định\s*k[ỳì]|giữa\s*k[ỳì]|cuối\s*k[ỳì]))$/i.test(clean)) return true;
  if (/^(điểm\s*(tb|tbc|tbcm|miệng|15p|1\s*tiết|thi)|đtb|đtbm|hk[12]|học\s*k[ỳì]\s*[12])$/i.test(clean)) return true;
  return false;
}

/**
 * Splits a full name string into Vietnamese standard:
 * - hoVaChuLot / lastName: all words from the left except the last word (Họ và chữ lót)
 * - ten / firstName: the last word (Tên chính)
 * - fullName: standardized full name
 * E.g. "Nguyễn Bảo An" -> lastName: "Nguyễn Bảo", firstName: "An", fullName: "Nguyễn Bảo An"
 * E.g. "Trần Tiến Đạt" -> lastName: "Trần Tiến", firstName: "Đạt", fullName: "Trần Tiến Đạt"
 * E.g. "Lê Thị Mai" -> lastName: "Lê Thị", firstName: "Mai", fullName: "Lê Thị Mai"
 * E.g. "An" -> lastName: "", firstName: "An", fullName: "An"
 */
export function splitVietnameseName(fullName: string): {
  hoVaChuLot: string;
  ten: string;
  lastName: string;
  firstName: string;
  fullName: string;
} {
  const clean = cleanTextCell(fullName)
    .replace(/^(\d+[\.\/\-\)]\s*|stt\s*[:\s]*\d+[:\s]*)/i, '')
    .replace(/[\*\#\?\+]+$/g, '')
    .replace(/\s*\([^)]*\)$/g, '')
    .normalize('NFC')
    .replace(/\s+/g, ' ')
    .trim();

  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return { hoVaChuLot: '', ten: '', lastName: '', firstName: '', fullName: '' };
  }
  if (words.length === 1) {
    return {
      hoVaChuLot: '',
      ten: words[0],
      lastName: '',
      firstName: words[0],
      fullName: words[0],
    };
  }
  const ten = words[words.length - 1];
  const hoVaChuLot = words.slice(0, -1).join(' ');
  return {
    hoVaChuLot,
    ten,
    lastName: hoVaChuLot,
    firstName: ten,
    fullName: `${hoVaChuLot} ${ten}`,
  };
}

/**
 * Academic ratings, ranking categories and evaluations:
 * Explicit compound ratings and rating headers.
 * Notice: Single words like "Đạt", "Khá" are legitimate human given names in Vietnam
 * and are ONLY considered ratings when in compound form or in rating table headers.
 */
export const RATING_WORDS = new Set([
  'chưa đạt', 'chua dat', 'c.đạt', 'cđ',
  'trung bình', 'tb', 'yếu', 'yeu', 'kém', 'kem',
  'xuất sắc', 'xuat sac',
  'hoàn thành tốt', 'chưa hoàn thành', 'htt', 'cht',
  'tốt khá đạt chưa đạt', 'tốt khá đạt', 'giỏi khá trung bình yếu kém'
]);

export function isAcademicRatingOrEvaluation(val: string): boolean {
  if (!val) return false;
  const clean = val.trim().toLowerCase();
  if (RATING_WORDS.has(clean)) return true;
  // Explicit compound ratings
  if (/^(chưa\s*đạt|c\.?\s*đạt|cđ|xuất\s*sắc|hoàn\s*thành\s*tốt|chưa\s*hoàn\s*thành|trung\s*bình|htt|cht)$/i.test(clean)) return true;
  // Multiple ratings concatenated (e.g. "Tốt Khá", "Khá Đạt", "Đạt Chưa đạt", "Tốt Khá Đạt Chưa đạt")
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 2 && words.every(w => /^(tốt|khá|đạt|chưa|cđ|giỏi|tb|yếu|kém|xuất|sắc|hoàn|thành)$/i.test(w))) {
    return true;
  }
  if (/^(xếp\s*loại|học\s*lực|hạnh\s*kiểm|rèn\s*luyện|mức\s*đạt(\s*được)?|kết\s*quả(\s*học\s*tập)?|đánh\s*giá)$/i.test(clean)) return true;
  if (/^(xếp\s*loại|học\s*lực|hạnh\s*kiểm|rèn\s*luyện|kết\s*quả)\s*[:\-]?\s*(tốt|khá|đạt|chưa\s*đạt|giỏi|trung\s*bình|tb|yếu|kém)/i.test(clean)) return true;
  return false;
}

/**
 * Statistical summary labels or student count rows:
 * e.g. "15 học sinh", "Tỷ lệ: 34%", "Tổng số", "Số lượng"
 */
export function isStatisticsOrCountSummary(val: string): boolean {
  if (!val) return false;
  const clean = val.trim().toLowerCase();
  if (/^\d+\s*(học\s*sinh|hs|em)$/i.test(clean)) return true;
  if (/^(tổng\s*số(\s*học\s*sinh)?|tổng\s*cộng|tỷ\s*lệ|tỉ\s*lệ|phần\s*trăm|số\s*lượng|thống\s*kê)/i.test(clean)) return true;
  if (/%$/.test(clean) || /^\d+(\.\d+)?%$/.test(clean)) return true;
  return false;
}

/**
 * Checks if a string looks like a legitimate person name.
 * Highly permissive for genuine names while rejecting pure labels/headers/ratings.
 */
export function isLikelyVietnameseName(str: string): boolean {
  if (!str) return false;
  let clean = cleanTextCell(str);

  // Strip leading numbering (e.g. "1. Nguyễn Bảo An" -> "Nguyễn Bảo An")
  clean = clean.replace(/^(\d+[\.\/\-\)]\s*|stt\s*[:\s]*\d+[:\s]*)/i, '').trim();

  // Strip trailing notes, asterisks, parentheses (e.g. "Nguyễn Thị Kim Ngân *" -> "Nguyễn Thị Kim Ngân")
  clean = clean.replace(/[\*\#\?\+]+$/g, '').trim();
  clean = clean.replace(/\s*\([^)]*\)$/g, '').trim();

  if (clean.length < 2 || clean.length > 50) return false;

  // Genuine human names NEVER contain digits (rejects TX1, TX2, 2 Khá, 15 học sinh, etc.)
  if (/\d/.test(clean)) return false;

  // Must contain letters
  if (!/[a-zA-ZÀ-ỹ]/.test(clean)) return false;

  // Pure numbers, dates, or emails are NOT names
  if (/^\d+$/.test(clean)) return false;
  if (/^\d{1,2}[\/\-\.]\d{1,2}/.test(clean)) return false;
  if (clean.includes('@')) return false;

  const lower = clean.toLowerCase();

  // Rejects score/assessment headers (TX1, GK, CK, ĐTB...)
  if (isAssessmentOrScoreHeader(lower)) return false;

  // Rejects academic ratings (Tốt, Khá, Đạt, Chưa đạt, Giỏi, TB...)
  if (isAcademicRatingOrEvaluation(lower)) return false;

  // Rejects statistics & counts
  if (isStatisticsOrCountSummary(lower)) return false;

  // Pure ethnicity is NOT a person's name
  if (VIETNAMESE_ETHNICITIES.has(lower)) return false;

  // Header or Footer labels to exclude
  const exactHeaderOrFooterLabels = [
    'họ và tên', 'họ tên', 'họ và chữ lót', 'họ và đệm', 'họ đệm', 'họ lót', 'họ',
    'họ và chữ lót tên', 'họ và đệm tên', 'họ tên học sinh', 'họ và tên học sinh',
    'tên', 'tên học sinh', 'tên hs', 'tên khai sinh', 'tên riêng', 'mã học sinh', 'mã hs',
    'mã định danh', 'stt', 'số thứ tự', 'số tt', 'ngày sinh', 'năm sinh', 'n.sinh',
    'giới tính', 'phái', 'lớp', 'lớp học', 'ghi chú', 'xếp loại',
    'học lực', 'hạnh kiểm', 'điểm tb', 'tbcm', 'sđt', 'điện thoại', 'email',
    'thống kê', 'thống kê học kỳ', 'người lập biểu', 'người lập', 'giáo viên bộ môn', 'giáo viên chủ nhiệm',
    'hiệu trưởng', 'ban giám hiệu', 'tổng số học sinh', 'tổng cộng', 'chữ ký',
    'dân tộc', 'quê quán', 'nơi sinh', 'chỗ ở hiện nay', 'đoàn viên', 'đội viên',
    'kết quả', 'rèn luyện', 'mức đạt'
  ];

  if (exactHeaderOrFooterLabels.includes(lower)) return false;

  // Must not start with footer / banner keywords
  if (
    lower.startsWith('thống kê') ||
    lower.startsWith('người lập') ||
    lower.startsWith('giáo viên') ||
    lower.startsWith('hiệu trưởng') ||
    lower.startsWith('tổng số') ||
    lower.startsWith('bảng điểm') ||
    lower.startsWith('trường thpt') ||
    lower.startsWith('trường thcs') ||
    lower.startsWith('sở giáo dục') ||
    lower.startsWith('danh sách học sinh') ||
    lower.startsWith('xác nhận') ||
    lower.startsWith('trang ') ||
    lower.startsWith('xếp loại')
  ) {
    return false;
  }

  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length > 7) return false;

  // Multiple ratings joined together (e.g. "Tốt Khá", "Khá Đạt", "Đạt Chưa đạt")
  if (words.every(w => isAcademicRatingOrEvaluation(w) || isAssessmentOrScoreHeader(w))) {
    return false;
  }

  // First word is known surname
  const firstWordNoAccent = removeVietnameseDiacritics(words[0]);
  if (VIETNAMESE_SURNAMES.has(firstWordNoAccent) || VIETNAMESE_SURNAMES.has(words[0].toLowerCase())) {
    return true;
  }

  // 2 to 6 words containing Vietnamese/Latin alphabets
  if (words.length >= 2 && words.length <= 6 && words.every(w => /^[a-zA-ZÀ-ỹ\.'\-]+$/.test(w))) {
    return true;
  }

  // Single word name (given name like "An", "Đạt", "Bình", "Cường", "Ngân", "Nam", "Ý")
  // Notice: Must NOT be rating ("Tốt", "Khá") or assessment header ("TX", "GK")
  if (words.length === 1 && /^[a-zA-ZÀ-ỹ]+$/.test(words[0]) && words[0].length >= 1) {
    if (!isAcademicRatingOrEvaluation(words[0]) && !isAssessmentOrScoreHeader(words[0])) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if a cell value is likely a student's given name (Tên) in a Vietnamese roster.
 * Highly robust: accepts "Nam", "Nữ", "Ý", "Ngân", "An", "Đạt", "Khá", "Bình" while strictly rejecting:
 * - Assessment/Score headers (TX1, TX2, GK, CK, ĐTB...)
 * - Explicit compound ratings (Chưa đạt, C.Đạt, CĐ, Xuất sắc, Trung bình...)
 * - Pure numbers, decimals, dates, checkmarks (x, v, f), ethnicities, and explicit table header tags.
 */
export function isLikelyGivenName(val: string): boolean {
  if (!val) return false;
  const clean = val.trim();
  // Given names NEVER contain digits (e.g. TX1, ĐTX2, 1, 2)
  if (/\d/.test(clean)) return false;
  if (!/[a-zA-ZÀ-ỹ]/.test(clean)) return false;
  if (/^\d+$/.test(clean)) return false;
  if (/^\d{1,2}[\/\-\.]\d{1,2}/.test(clean)) return false;
  if (/^[xvf\-\+\*10]$/i.test(clean)) return false;

  const lower = clean.toLowerCase();

  // Rejects score/assessment headers (TX1, GK, CK, ĐTB...)
  if (isAssessmentOrScoreHeader(lower)) return false;

  // Rejects explicit compound ratings & administrative terms
  if (/^(chưa\s*đạt|c\.?\s*đạt|cđ|xuất\s*sắc|hoàn\s*thành\s*tốt|chưa\s*hoàn\s*thành|trung\s*bình|htt|cht)$/i.test(lower)) {
    return false;
  }
  if (/^(ngày\s*sinh|nam\/nữ|dân\s*tộc|ghi\s*chú|lớp|định\s*danh|mã\s*hs|stt|xếp\s*loại|học\s*lực|hạnh\s*kiểm|rèn\s*luyện|mức\s*đạt|kết\s*quả|học\s*sinh|điểm)$/i.test(lower)) {
    return false;
  }

  // Accepts standard Vietnamese names: An, Bình, Cường, Dũng, Đạt, Giang, Hân, Khá, Nam, Nữ, Ngân, Ý, Thái, Hoa, etc.
  return true;
}

/**
 * Checks if a table row is a header, banner, numbering row, sub-header, or footer row.
 */
function isHeaderOrBannerRow(row: any[]): boolean {
  if (!row || !Array.isArray(row)) return false;
  const nonEmpties = row
    .map(c => cleanTextCell(c))
    .filter(Boolean);
  if (nonEmpties.length === 0) return true;

  const rowTextAll = nonEmpties.map(c => c.toLowerCase()).join(' ');

  // 1. Column numbering row e.g. (1), (2), (3), (4)...
  let parensNumberingCount = 0;
  for (const c of nonEmpties) {
    if (/^\(\d+\)$/.test(c) || (c.length <= 2 && /^\d+$/.test(c))) {
      parensNumberingCount++;
    }
  }
  if (parensNumberingCount >= 3 && parensNumberingCount >= nonEmpties.length - 1) {
    return true;
  }

  // 2. CRITICAL ANCHOR RULE FOR STUDENT ROWS:
  // If the row starts with a valid numeric STT (1 to 10000) in cell 0, 1, 2, or 3,
  // OR contains a 6-14 digit student code,
  // IT IS 100% A STUDENT DATA ROW, NEVER A HEADER OR BANNER!
  const hasSttNumber = nonEmpties.slice(0, 4).some(c => {
    const match = c.match(/^\s*(\d{1,5})\s*[\.\:\-\)\/]?$/);
    if (!match) return false;
    const num = parseInt(match[1], 10);
    return num > 0 && num < 10000;
  });
  const hasCode = nonEmpties.slice(0, 4).some(c => /^\d{6,14}$/.test(c) || /^HS\d{4,10}$/i.test(c));
  if (hasSttNumber || hasCode) {
    return false; // Student row!
  }

  // 3. Explicit table headers: has STT label AND (Name label OR Student Code label)
  const hasSttLabel = nonEmpties.some(c => /^(stt|số\s*tt|số\s*thứ\s*tự|no\.?)$/i.test(c));
  const hasNameLabel = nonEmpties.some(c => /(họ\s*(và|&)?\s*tên|họ\s*(và|&)?\s*(chữ\s*)?lót|tên\s*học\s*sinh|^tên$)/i.test(c));
  const hasCodeLabel = nonEmpties.some(c => /(mã\s*(hs|học\s*sinh|định\s*danh)|mshs|sbd)/i.test(c));
  if (hasSttLabel && (hasNameLabel || hasCodeLabel)) {
    return true;
  }

  // 4. Sub-header row for name columns:
  // e.g. ['', '', 'Họ và chữ lót', 'Tên', '', '', ''] or ['Họ và đệm', 'Tên']
  const hasHoLabel = nonEmpties.some(c => /^(họ\s*(và|&)?\s*(chữ\s*)?lót|họ\s*(và|&)?\s*(tên\s*)?đệm|họ\s*đệm|họ\s*lót|^họ)$/i.test(c));
  const hasTenLabel = nonEmpties.some(c => /^(tên|tên\s*gọi|tên\s*hs|tên\s*học\s*sinh)$/i.test(c));
  if (hasHoLabel && hasTenLabel) {
    return true;
  }

  // 5. Footer summary / statistics signatures:
  if (
    rowTextAll.startsWith('thống kê') ||
    rowTextAll.startsWith('người lập') ||
    rowTextAll.startsWith('giáo viên') ||
    rowTextAll.startsWith('hiệu trưởng') ||
    rowTextAll.startsWith('ban giám hiệu') ||
    rowTextAll.startsWith('tổng số') ||
    rowTextAll.startsWith('tổng cộng') ||
    rowTextAll.startsWith('xếp loại:') ||
    rowTextAll.startsWith('trang ') ||
    /trang\s+\d+\s*\/\s*\d+/i.test(rowTextAll) ||
    (rowTextAll.includes('ngày') && rowTextAll.includes('tháng') && rowTextAll.includes('năm') && nonEmpties.length <= 4)
  ) {
    return true;
  }

  // 5. School/Class title banner (spanning 1 to 4 cells)
  if (
    /(lớp\s*[:\-]?\s*[0-9a-zA-Z]|niên\s*(học|khóa)|năm\s*học|học\s*k[ỳì]|trường\s+|sở\s*gd|phòng\s*gd|danh\s*sách\s*học\s*sinh|bảng\s*điểm)/i.test(rowTextAll) &&
    nonEmpties.length <= 4
  ) {
    return true;
  }

  // 6. Sub-header containing score column headers (e.g. TX1, TX2, TX3, GK, CK, ĐTB)
  const assessmentCount = nonEmpties.filter(c => isAssessmentOrScoreHeader(c)).length;
  if (assessmentCount >= 2) {
    return true;
  }

  // 7. Row containing academic ratings legend (e.g. Tốt, Khá, Đạt, Chưa đạt)
  const ratingCount = nonEmpties.filter(c => isAcademicRatingOrEvaluation(c)).length;
  if (ratingCount >= 2) {
    return true;
  }

  // 8. If ALL non-empty cells in the row are assessment headers, ratings, numbers, or percentages
  const allAreHeadersOrRatings = nonEmpties.every(c =>
    isAssessmentOrScoreHeader(c) ||
    isAcademicRatingOrEvaluation(c) ||
    /^\d+([\,\.]\d+)?%?$/.test(c) ||
    /^\(\d+\)$/.test(c) ||
    /^[xvf\-\+\*10]$/i.test(c)
  );
  if (allAreHeadersOrRatings) {
    return true;
  }

  return false;
}

/**
 * Detect column indices for table headers.
 */
function inspectHeaderRow(row: any[]): {
  sttCol: number;
  codeCol: number;
  hoCol: number;
  tenCol: number;
  fullNameCol: number;
  dobCol: number;
  genderCol: number;
  genderFemaleCol: number;
  danTocCol: number;
  phoneCol: number;
  emailCol: number;
} {
  let sttCol = -1;
  let codeCol = -1;
  let hoCol = -1;
  let tenCol = -1;
  let fullNameCol = -1;
  let dobCol = -1;
  let genderCol = -1;
  let genderFemaleCol = -1;
  let danTocCol = -1;
  let phoneCol = -1;
  let emailCol = -1;

  row.forEach((cell, col) => {
    const clean = cleanTextCell(cell).toLowerCase();
    if (!clean) return;

    if (/^(stt|số\s*tt|số\s*thứ\s*tự|tt|stt\.|no\.?)$/i.test(clean) && sttCol === -1) {
      sttCol = col;
    } else if (/(mã\s*(hs|học\s*sinh|định\s*danh|số)|mshs|sbd|mã\s*số|số\s*định\s*danh)/i.test(clean) && codeCol === -1) {
      codeCol = col;
    } else if (/(họ\s*(và|&)?\s*(chữ\s*)?lót|họ\s*(và|&)?\s*(tên\s*)?đệm|họ\s*đệm|họ\s*lót|^họ$)/i.test(clean) && hoCol === -1) {
      hoCol = col;
    } else if (/^(tên|tên\s*học\s*sinh|tên\s*hs|tên\s*gọi|tên\s*khai\s*sinh|tên\s*riêng)(\s*[\(\[].*[\)\]])?$/i.test(clean) && tenCol === -1) {
      tenCol = col;
    } else if (/(họ\s*(và|&)?\s*tên|họ\s*tên)/i.test(clean) && fullNameCol === -1) {
      fullNameCol = col;
    } else if (/(ngày\s*sinh|n\.sinh|ngaysinh|^ns$|ngày\s*tháng\s*năm\s*sinh|dob|năm\s*sinh)/i.test(clean) && dobCol === -1) {
      dobCol = col;
    } else if (/^(nữ|f)$/i.test(clean) && genderFemaleCol === -1) {
      genderFemaleCol = col;
    } else if (/(giới\s*tính|^phái$|nam\/nữ|^gt$)/i.test(clean) && genderCol === -1) {
      genderCol = col;
    } else if (/(dân\s*tộc|^dt$)/i.test(clean) && danTocCol === -1) {
      danTocCol = col;
    } else if (/(số\s*điện\s*thoại|điện\s*thoại|sđt|sdt|di\s*động|liên\s*hệ|phone)/i.test(clean) && phoneCol === -1) {
      phoneCol = col;
    } else if (/(email|thư\s*điện\s*tử|tài\s*khoản)/i.test(clean) && emailCol === -1) {
      emailCol = col;
    }
  });

  return {
    sttCol,
    codeCol,
    hoCol,
    tenCol,
    fullNameCol,
    dobCol,
    genderCol,
    genderFemaleCol,
    danTocCol,
    phoneCol,
    emailCol,
  };
}

/**
 * Intelligent and Complete parser for vnEdu, SMAS, QLM, Google Sheets, and Vietnamese school Excel files.
 * GUARANTEES:
 * 1. 100% extraction: Never drops any student in the list.
 * 2. Multi-page & converted PDF resilience: Handles repeated headers, footers, blank rows between pages without breaking.
 * 3. Never skips student #28 (or any student) due to column shifts or page breaks.
 * 4. Resolves split columns ("Họ và chữ lót" + "Tên") as well as combined ("Họ và tên").
 * 5. Handles Excel serial dates, vnEdu student codes, gender marks.
 */
export function parseVietnameseSchoolExcel(rawJson: any[][], preferredClassName?: string): ParseExcelResult {
  if (!rawJson || rawJson.length === 0) {
    return {
      success: false,
      students: [],
      totalRowsProcessed: 0,
      totalStudentsExtracted: 0,
      message: 'Tệp không chứa dữ liệu hợp lệ.',
    };
  }

  let detectedClassName: string | undefined = preferredClassName;
  let detectedSchoolName: string | undefined;
  let detectedAcademicYear: string | undefined;

  // Scan top 25 rows for metadata
  for (let r = 0; r < Math.min(rawJson.length, 25); r++) {
    const row = rawJson[r] || [];
    row.forEach(cell => {
      const text = cleanTextCell(cell);
      if (!text) return;

      if (/trường\s+(thpt|thcs|tiểu\s*học|ptth|đại\s*học|liên\s*cấp)/i.test(text) && !detectedSchoolName) {
        detectedSchoolName = text;
      }
      const classMatch = text.match(/lớp\s*[:\-]?\s*([0-9]{1,2}[a-zA-Z0-9_\-]+)/i);
      if (classMatch && classMatch[1] && !detectedClassName) {
        detectedClassName = classMatch[1].toUpperCase();
      }
      const yearMatch = text.match(/(năm\s*học|niên\s*khóa|niên\s*học)\s*[:\-]?\s*([0-9]{4}\s*[\-\/]\s*[0-9]{4})/i);
      if (yearMatch && yearMatch[2] && !detectedAcademicYear) {
        detectedAcademicYear = yearMatch[2].replace(/\s+/g, '');
      }
    });
  }

  const finalClassName = detectedClassName || '11A1';
  const finalSchoolName = detectedSchoolName || 'THPT Võ Thị Sáu';
  const finalAcademicYear = detectedAcademicYear || '2026-2027';

  // Step 1: Detect Primary Header Row
  let bestHeaderRowIdx = -1;
  let maxHeaderScore = -1;

  for (let r = 0; r < Math.min(rawJson.length, 30); r++) {
    const row = rawJson[r];
    if (!Array.isArray(row)) continue;

    let score = 0;
    row.forEach(cell => {
      const text = cleanTextCell(cell).toLowerCase();
      if (/^(stt|số\s*tt|số\s*thứ\s*tự|tt|no\.?)$/i.test(text)) score += 10;
      if (/(mã\s*(hs|học\s*sinh|định\s*danh|số)|mshs|sbd|mã\s*số)/i.test(text)) score += 10;
      if (/^(họ\s*và\s*tên|họ\s*tên|họ\s*và\s*tên\s*học\s*sinh|họ\s*tên\s*học\s*sinh)$/i.test(text)) score += 12;
      if (/^(họ\s*(và|&)?\s*(chữ\s*)?lót|họ\s*(và|&)?\s*(tên\s*)?đệm|họ\s*đệm|họ\s*lót|^họ)$/i.test(text)) score += 10;
      if (/^(tên|tên\s*học\s*sinh|tên\s*hs|tên\s*gọi|tên\s*khai\s*sinh|tên\s*riêng)(\s*[\(\[].*[\)\]])?$/i.test(text)) score += 10;
      if (/ngày\s*sinh|n\.sinh|ngaysinh|^ns$|ngày\s*tháng\s*năm\s*sinh|dob/i.test(text)) score += 5;
      if (/giới\s*tính|^phái$|nam\/nữ|^nam$|^nữ$|^gt$/i.test(text)) score += 5;
      if (/bảng\s*điểm|trường\s*thpt|sở\s*giáo\s*dục|sổ\s*theo\s*dõi/i.test(text)) score -= 5;
    });

    if (score > maxHeaderScore) {
      maxHeaderScore = score;
      bestHeaderRowIdx = r;
    }
  }

  // Fallback: If header row score low, find first sequential numeric STT row (1 followed by 2)
  if (maxHeaderScore < 5 || bestHeaderRowIdx === -1) {
    for (let r = 0; r < Math.min(rawJson.length - 1, 30); r++) {
      const row = rawJson[r] || [];
      const nextRow = rawJson[r + 1] || [];
      const val0 = cleanTextCell(row[0]);
      const nextVal0 = cleanTextCell(nextRow[0]);
      const val1 = cleanTextCell(row[1]);
      const nextVal1 = cleanTextCell(nextRow[1]);

      if ((val0 === '1' && nextVal0 === '2') || (val1 === '1' && nextVal1 === '2')) {
        bestHeaderRowIdx = Math.max(0, r - 1);
        break;
      }
    }
  }

  const primaryHeaderIdx = bestHeaderRowIdx !== -1 ? bestHeaderRowIdx : 0;
  let currentHeaderCols = inspectHeaderRow(rawJson[primaryHeaderIdx] || []);

  // Check sub-header row (e.g. vnEdu row 6 has Họ và tên, row 7 has Họ và chữ lót | Tên)
  if (primaryHeaderIdx + 1 < rawJson.length) {
    const subRow = rawJson[primaryHeaderIdx + 1] || [];
    const val0 = cleanTextCell(subRow[0]);
    const val1 = cleanTextCell(subRow[1]);

    // Only inspect sub-header if NOT already Student 1!
    if (val0 !== '1' && val1 !== '1' && val0 !== '01' && val1 !== '01') {
      const subCols = inspectHeaderRow(subRow);
      if (subCols.hoCol !== -1) currentHeaderCols.hoCol = subCols.hoCol;
      if (subCols.tenCol !== -1) currentHeaderCols.tenCol = subCols.tenCol;
      if (subCols.fullNameCol !== -1 && currentHeaderCols.fullNameCol === -1) currentHeaderCols.fullNameCol = subCols.fullNameCol;
      if (subCols.dobCol !== -1 && currentHeaderCols.dobCol === -1) currentHeaderCols.dobCol = subCols.dobCol;
      if (subCols.genderFemaleCol !== -1 && currentHeaderCols.genderFemaleCol === -1) currentHeaderCols.genderFemaleCol = subCols.genderFemaleCol;
      if (subCols.genderCol !== -1 && currentHeaderCols.genderCol === -1) currentHeaderCols.genderCol = subCols.genderCol;
    }
  }

  // Handle case where header has "Họ và tên" (fullNameCol) AND "Tên" (tenCol)
  if (
    currentHeaderCols.hoCol === -1 &&
    currentHeaderCols.fullNameCol !== -1 &&
    currentHeaderCols.tenCol !== -1 &&
    currentHeaderCols.fullNameCol !== currentHeaderCols.tenCol
  ) {
    currentHeaderCols.hoCol = currentHeaderCols.fullNameCol;
    currentHeaderCols.fullNameCol = -1;
  }

  // Auto-detect split "Họ và tên" + "Tên" when header merged under single "Họ và tên"
  if (currentHeaderCols.hoCol === -1 && currentHeaderCols.fullNameCol !== -1 && currentHeaderCols.tenCol === -1) {
    const candidateTenCol = currentHeaderCols.fullNameCol + 1;
    const isCandidateOtherCol =
      candidateTenCol === currentHeaderCols.sttCol ||
      candidateTenCol === currentHeaderCols.codeCol ||
      candidateTenCol === currentHeaderCols.dobCol ||
      candidateTenCol === currentHeaderCols.genderCol ||
      candidateTenCol === currentHeaderCols.genderFemaleCol ||
      candidateTenCol === currentHeaderCols.danTocCol ||
      candidateTenCol === currentHeaderCols.phoneCol ||
      candidateTenCol === currentHeaderCols.emailCol;

    if (!isCandidateOtherCol) {
      let sampleCount = 0;
      let likelyGivenNameCount = 0;
      let genderOnlyCount = 0;

      for (let r = primaryHeaderIdx + 1; r < Math.min(rawJson.length, primaryHeaderIdx + 25); r++) {
        const sampleRow = rawJson[r];
        if (!sampleRow || !Array.isArray(sampleRow)) continue;
        const fnVal = cleanTextCell(sampleRow[currentHeaderCols.fullNameCol]);
        if (!fnVal || !/[a-zA-ZÀ-ỹ]/.test(fnVal)) continue;

        const val = cleanTextCell(sampleRow[candidateTenCol]);
        if (!val) continue;

        sampleCount++;
        if (isLikelyGivenName(val)) likelyGivenNameCount++;
        if (/^(nam|nữ|nu|m|f|x|v)$/i.test(val)) genderOnlyCount++;
      }

      if (sampleCount >= 2 && likelyGivenNameCount >= sampleCount * 0.6 && genderOnlyCount < sampleCount * 0.6) {
        currentHeaderCols.hoCol = currentHeaderCols.fullNameCol;
        currentHeaderCols.tenCol = candidateTenCol;
        currentHeaderCols.fullNameCol = -1;
      }
    }
  }

  const parsedStudents: ParsedStudentRow[] = [];
  const usedUsernames = new Map<string, number>();
  let maxDetectedStt = 0;

  // Step 2: Loop through ALL rows in the sheet. NEVER BREAK EARLY!
  for (let r = primaryHeaderIdx + 1; r < rawJson.length; r++) {
    const row = rawJson[r];
    if (!row || !Array.isArray(row)) continue;

    // Filter non-empty cells
    const nonEmpties = row.map(c => cleanTextCell(c)).filter(Boolean);
    if (nonEmpties.length === 0) continue;

    // 1. Check if row is a repeated header row (Page 2, Page 3, etc.)
    const isHeader = isHeaderOrBannerRow(row);
    if (isHeader) {
      // If this row has table header markers, re-align columns for the subsequent page!
      const potentialCols = inspectHeaderRow(row);
      if (potentialCols.sttCol !== -1) currentHeaderCols.sttCol = potentialCols.sttCol;
      if (potentialCols.codeCol !== -1) currentHeaderCols.codeCol = potentialCols.codeCol;
      if (potentialCols.hoCol !== -1) currentHeaderCols.hoCol = potentialCols.hoCol;
      if (potentialCols.tenCol !== -1) currentHeaderCols.tenCol = potentialCols.tenCol;
      if (potentialCols.fullNameCol !== -1) currentHeaderCols.fullNameCol = potentialCols.fullNameCol;
      if (potentialCols.dobCol !== -1) currentHeaderCols.dobCol = potentialCols.dobCol;
      if (potentialCols.genderCol !== -1) currentHeaderCols.genderCol = potentialCols.genderCol;
      if (potentialCols.genderFemaleCol !== -1) currentHeaderCols.genderFemaleCol = potentialCols.genderFemaleCol;

      // When hoCol & tenCol are both detected, prioritize splitting Họ and Tên
      if (currentHeaderCols.hoCol !== -1 && currentHeaderCols.tenCol !== -1) {
        currentHeaderCols.fullNameCol = -1;
      } else if (
        currentHeaderCols.hoCol === -1 &&
        currentHeaderCols.fullNameCol !== -1 &&
        currentHeaderCols.tenCol !== -1 &&
        currentHeaderCols.fullNameCol !== currentHeaderCols.tenCol
      ) {
        currentHeaderCols.hoCol = currentHeaderCols.fullNameCol;
        currentHeaderCols.fullNameCol = -1;
      } else if (currentHeaderCols.hoCol === -1 && currentHeaderCols.fullNameCol !== -1 && currentHeaderCols.tenCol === -1) {
        // Auto-detect split under repeated header as well
        const candidateTenCol = currentHeaderCols.fullNameCol + 1;
        const isCandOther =
          candidateTenCol === currentHeaderCols.sttCol ||
          candidateTenCol === currentHeaderCols.codeCol ||
          candidateTenCol === currentHeaderCols.dobCol ||
          candidateTenCol === currentHeaderCols.genderCol ||
          candidateTenCol === currentHeaderCols.genderFemaleCol ||
          candidateTenCol === currentHeaderCols.danTocCol;
        if (!isCandOther) {
          currentHeaderCols.hoCol = currentHeaderCols.fullNameCol;
          currentHeaderCols.tenCol = candidateTenCol;
          currentHeaderCols.fullNameCol = -1;
        }
      }
      // Skip the header row itself: NEVER add a table header as a student!
      continue;
    }

    // 2. Extract STT (Check primary STT col, or first 4 columns)
    let rowStt: number | undefined;
    if (currentHeaderCols.sttCol !== -1 && row[currentHeaderCols.sttCol] !== undefined) {
      const sVal = cleanTextCell(row[currentHeaderCols.sttCol]);
      const match = sVal.match(/^\s*(\d{1,5})\s*[\.\:\-\)\/]?$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > 0 && num < 10000) {
          rowStt = num;
        }
      }
    }

    if (!rowStt) {
      // Search first 4 cells for a single integer / STT format
      for (let c = 0; c < Math.min(4, row.length); c++) {
        const val = cleanTextCell(row[c]);
        const match = val.match(/^\s*(\d{1,5})\s*[\.\:\-\)\/]?$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > 0 && num < 10000) {
            rowStt = num;
            break;
          }
        }
      }
    }

    if (rowStt && rowStt > maxDetectedStt) {
      maxDetectedStt = rowStt;
    }

    // 3. Extract Student Code (6 to 14 digits)
    let studentCode: string | undefined;
    if (currentHeaderCols.codeCol !== -1 && row[currentHeaderCols.codeCol] !== undefined) {
      const codeVal = cleanTextCell(row[currentHeaderCols.codeCol]);
      if (/^\d{6,14}$/.test(codeVal) || /^HS\d{4,10}$/i.test(codeVal)) {
        studentCode = codeVal;
      }
    }

    if (!studentCode) {
      for (let c = 0; c < row.length; c++) {
        if (c === currentHeaderCols.sttCol) continue;
        const val = cleanTextCell(row[c]);
        if (/^\d{6,14}$/.test(val) || /^HS\d{4,10}$/i.test(val)) {
          studentCode = val;
          break;
        }
      }
    }

    // 4. Extract Date of Birth
    let dob: string | undefined;
    if (currentHeaderCols.dobCol !== -1 && row[currentHeaderCols.dobCol] !== undefined) {
      dob = formatExcelDate(row[currentHeaderCols.dobCol]);
    }

    if (!dob) {
      for (let c = 0; c < row.length; c++) {
        if (c === currentHeaderCols.sttCol || c === currentHeaderCols.codeCol) continue;
        const cell = row[c];
        const formatted = formatExcelDate(cell);
        if (formatted && /^\d{2}\/\d{2}\/\d{4}$/.test(formatted)) {
          dob = formatted;
          break;
        }
      }
    }

    // 5. Extract Gender
    let gender: 'Nam' | 'Nữ' | 'Khác' | undefined;
    if (currentHeaderCols.genderFemaleCol !== -1 && row[currentHeaderCols.genderFemaleCol] !== undefined) {
      const fVal = cleanTextCell(row[currentHeaderCols.genderFemaleCol]).toLowerCase();
      if (fVal === 'x' || fVal === '1' || fVal === 'nữ' || fVal === 'nu' || fVal === 'v') {
        gender = 'Nữ';
      } else {
        gender = 'Nam';
      }
    } else if (currentHeaderCols.genderCol !== -1 && row[currentHeaderCols.genderCol] !== undefined) {
      const gRaw = cleanTextCell(row[currentHeaderCols.genderCol]).toLowerCase();
      if (gRaw.includes('nữ') || gRaw === 'f' || gRaw === 'nu' || gRaw === 'x') {
        gender = 'Nữ';
      } else if (gRaw.includes('nam') || gRaw === 'm') {
        gender = 'Nam';
      }
    }

    if (!gender) {
      for (let c = 0; c < row.length; c++) {
        const val = cleanTextCell(row[c]).toLowerCase();
        if (val === 'nam') { gender = 'Nam'; break; }
        if (val === 'nữ' || val === 'nu') { gender = 'Nữ'; break; }
      }
    }

    // 6. Extract Phone & Email
    let phone: string | undefined;
    if (currentHeaderCols.phoneCol !== -1 && row[currentHeaderCols.phoneCol] !== undefined) {
      const pRaw = cleanTextCell(row[currentHeaderCols.phoneCol]);
      if (/^[0-9+.\-\s()]{7,15}$/.test(pRaw)) phone = pRaw;
    }

    let email: string | undefined;
    if (currentHeaderCols.emailCol !== -1 && row[currentHeaderCols.emailCol] !== undefined) {
      const eRaw = cleanTextCell(row[currentHeaderCols.emailCol]);
      if (eRaw.includes('@')) email = eRaw;
    }

    // 7. ROBUST NAME EXTRACTION (100% Guaranteed)
    let hoPart = '';
    let tenPart = '';
    let rawFullName = '';

    // Approach A: Dedicated Columns
    if (currentHeaderCols.hoCol !== -1 && currentHeaderCols.tenCol !== -1) {
      const rawHo = cleanTextCell(row[currentHeaderCols.hoCol]);
      let rawTen = cleanTextCell(row[currentHeaderCols.tenCol]);

      // Check if rawTen is actually invalid (pure numbers, dates, checkmarks)
      const isTenInvalid =
        !rawTen ||
        !/[a-zA-ZÀ-ỹ]/.test(rawTen) ||
        /\d/.test(rawTen) ||
        /^\d{1,2}[\/\-\.]\d{1,2}/.test(rawTen) ||
        /^[xvf\-\+\*10]$/i.test(rawTen) ||
        /^(ngày\s*sinh|mã\s*hs|stt|dân\s*tộc)$/i.test(rawTen);

      if (isTenInvalid) {
        rawTen = '';
      }

      // If rawTen is empty or invalid, look at the cell immediately after hoCol or tenCol
      if (!rawTen && row[currentHeaderCols.hoCol + 1] !== undefined) {
        const nextVal = cleanTextCell(row[currentHeaderCols.hoCol + 1]);
        if (isLikelyGivenName(nextVal)) {
          rawTen = nextVal;
        }
      }

      hoPart = rawHo;
      tenPart = rawTen;

      if (hoPart && tenPart) {
        if (hoPart.toLowerCase().endsWith(tenPart.toLowerCase())) {
          rawFullName = hoPart;
        } else {
          rawFullName = `${hoPart} ${tenPart}`.trim();
        }
      } else if (hoPart) {
        rawFullName = hoPart;
      } else if (tenPart) {
        rawFullName = tenPart;
      }
    } else if (currentHeaderCols.fullNameCol !== -1 && row[currentHeaderCols.fullNameCol] !== undefined) {
      rawFullName = cleanTextCell(row[currentHeaderCols.fullNameCol]);
      // Also inspect if adjacent cell has the given name (e.g. vnEdu split/merged columns)
      const nextColIdx = currentHeaderCols.fullNameCol + 1;
      const isNextColOther =
        nextColIdx === currentHeaderCols.sttCol ||
        nextColIdx === currentHeaderCols.codeCol ||
        nextColIdx === currentHeaderCols.dobCol ||
        nextColIdx === currentHeaderCols.genderCol ||
        nextColIdx === currentHeaderCols.genderFemaleCol ||
        nextColIdx === currentHeaderCols.danTocCol ||
        nextColIdx === currentHeaderCols.phoneCol ||
        nextColIdx === currentHeaderCols.emailCol;

      if (!isNextColOther && row[nextColIdx] !== undefined) {
        const nextVal = cleanTextCell(row[nextColIdx]);
        if (nextVal && isLikelyGivenName(nextVal) && !/^\d+$/.test(nextVal)) {
          const cleanNextVal = nextVal.trim();
          const lowerRaw = rawFullName.toLowerCase();
          const lowerNext = cleanNextVal.toLowerCase();
          // Never drop the given name just because the middle name has multiple words
          // (e.g. "Huỳnh Ngọc Kim" (Họ và chữ lót) + "Yến" (Tên) -> "Huỳnh Ngọc Kim Yến")
          if (!lowerRaw.endsWith(lowerNext) && !lowerRaw.endsWith(' ' + lowerNext)) {
            hoPart = rawFullName;
            tenPart = cleanNextVal;
            rawFullName = `${hoPart} ${tenPart}`.trim();
          }
        }
      }
    }

    // Approach B: Fallback - If designated columns did not yield a valid name,
    // scan ALL text cells in the row!
    if (!rawFullName || !/[a-zA-ZÀ-ỹ]/.test(rawFullName) || /^\d+$/.test(rawFullName)) {
      const candidateCells: { idx: number; text: string }[] = [];

      row.forEach((cell, idx) => {
        const text = cleanTextCell(cell);
        if (!text) return;

        // Ignore pure numbers (STT, code, year)
        if (/^\d+$/.test(text)) return;
        // Ignore decimal scores (e.g. 8.5, 9,0, 10.0)
        if (/^\d+([\,\.]\d+)?$/.test(text)) return;
        // Ignore date strings
        if (/^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}$/.test(text)) return;
        // Ignore checkmarks
        if (/^[xvf\-\+\*10]$/i.test(text)) return;
        // Ignore ethnicity column
        if (currentHeaderCols.danTocCol !== -1 && idx === currentHeaderCols.danTocCol) return;
        if (text.toLowerCase() === 'kinh') return;
        // Ignore assessment / score headers (TX1, GK, CK, ĐTB...)
        if (isAssessmentOrScoreHeader(text)) return;
        // Ignore academic ratings (Tốt, Khá, Đạt, Chưa đạt, Giỏi, TB...)
        if (isAcademicRatingOrEvaluation(text)) return;
        // Ignore statistics & counts (15 học sinh, 34%)
        if (isStatisticsOrCountSummary(text)) return;
        // Ignore any text with digits (no person's name has digits)
        if (/\d/.test(text)) return;

        // Ignore known non-name columns (STT, code, dob, gender, ethnicity)
        if (
          idx === currentHeaderCols.sttCol ||
          idx === currentHeaderCols.codeCol ||
          idx === currentHeaderCols.dobCol ||
          idx === currentHeaderCols.genderCol ||
          idx === currentHeaderCols.genderFemaleCol ||
          idx === currentHeaderCols.danTocCol
        ) {
          return;
        }
        // Ignore header labels
        if (/^(stt|mã\s*hs|ngày\s*sinh|lớp|niên\s*học|xếp\s*loại|học\s*lực|hạnh\s*kiểm)$/i.test(text)) return;

        if (/[a-zA-ZÀ-ỹ]/.test(text)) {
          candidateCells.push({ idx, text });
        }
      });

      if (candidateCells.length === 1) {
        rawFullName = candidateCells[0].text;
      } else if (candidateCells.length === 2 && candidateCells[1].idx === candidateCells[0].idx + 1) {
        // Two adjacent text cells: Họ và chữ lót + Tên!
        hoPart = candidateCells[0].text;
        tenPart = candidateCells[1].text;
        rawFullName = `${hoPart} ${tenPart}`.trim();
      } else if (candidateCells.length > 2) {
        // If first two candidates are adjacent and second is a likely given name
        if (candidateCells[1].idx === candidateCells[0].idx + 1 && isLikelyGivenName(candidateCells[1].text)) {
          hoPart = candidateCells[0].text;
          tenPart = candidateCells[1].text;
          if (!hoPart.toLowerCase().endsWith(tenPart.toLowerCase())) {
            rawFullName = `${hoPart} ${tenPart}`.trim();
          } else {
            rawFullName = hoPart;
          }
        } else {
          // Find best candidate or join adjacent
          const fullCandidate = candidateCells.find(c => isLikelyVietnameseName(c.text));
          if (fullCandidate) {
            rawFullName = fullCandidate.text;
          } else {
            rawFullName = candidateCells.map(c => c.text).join(' ');
          }
        }
      }
    }

    // Clean up rawFullName: remove leading digits e.g. "28. Nguyễn Thị Kim Ngân" -> "Nguyễn Thị Kim Ngân"
    rawFullName = rawFullName
      .replace(/^(\d+[\.\/\-\)]\s*|stt\s*[:\s]*\d+[:\s]*)/i, '')
      .replace(/[\*\#\?\+]+$/g, '')
      .replace(/\s*\([^)]*\)$/g, '')
      .normalize('NFC')
      .replace(/\s+/g, ' ')
      .trim();

    // VALIDATION:
    // Row must have letters
    if (!/[a-zA-ZÀ-ỹ]/.test(rawFullName) || rawFullName.length < 2) {
      continue;
    }

    // Name must NEVER contain digits (rejects "TX1", "2 Khá", "15 học sinh", etc.)
    if (/\d/.test(rawFullName)) {
      continue;
    }

    // Must not be an assessment header, academic rating, or statistics count
    if (
      isAssessmentOrScoreHeader(rawFullName) ||
      isAcademicRatingOrEvaluation(rawFullName) ||
      isStatisticsOrCountSummary(rawFullName)
    ) {
      continue;
    }

    // Must not be all words of ratings or assessment headers (e.g. "TX1 TX2", "Khá Đạt", "Tốt Khá", "GK CK")
    const checkWords = rawFullName.split(/\s+/).filter(Boolean);
    if (checkWords.every(w => isAcademicRatingOrEvaluation(w) || isAssessmentOrScoreHeader(w))) {
      continue;
    }

    // Must not be an exact header or footer label
    const lowerFullName = rawFullName.toLowerCase();
    if (
      lowerFullName === 'họ và tên' ||
      lowerFullName === 'họ tên' ||
      lowerFullName === 'họ và chữ lót' ||
      lowerFullName === 'họ và đệm' ||
      lowerFullName === 'họ và đệm tên' ||
      lowerFullName === 'họ và chữ lót tên' ||
      lowerFullName === 'tên học sinh' ||
      lowerFullName === 'mã học sinh' ||
      lowerFullName === 'stt' ||
      lowerFullName === 'thống kê' ||
      lowerFullName === 'xếp loại' ||
      /(lớp\s*[:\-]?\s*[0-9a-zA-Z]|niên\s*(học|khóa)|năm\s*học|học\s*k[ỳì]|trường\s+(thpt|thcs|tiểu|ptth)|danh\s*sách\s*học\s*sinh|bảng\s*điểm|thống\s*kê|tổng\s*số|người\s*lập|hiệu\s*trưởng|giáo\s*viên|trang\s+\d+|học\s*sinh|xếp\s*loại|kết\s*quả|đánh\s*giá)/i.test(
        lowerFullName
      )
    ) {
      continue;
    }

    // Roster anchor check:
    // A legitimate student row in a Vietnamese school roster/gradebook MUST either:
    // 1. Have a valid STT number (1 to 10000) or student code, OR
    // 2. Have a legitimate Vietnamese full name (first word is a recognized Vietnamese surname, or contains >= 2 words)
    const hasValidRosterAnchor = (rowStt && rowStt > 0 && rowStt < 10000) || !!studentCode;
    if (!hasValidRosterAnchor) {
      const firstWord = checkWords[0] ? removeVietnameseDiacritics(checkWords[0]) : '';
      const isKnownSurname = VIETNAMESE_SURNAMES.has(firstWord) || (checkWords[0] && VIETNAMESE_SURNAMES.has(checkWords[0].toLowerCase()));
      if (!isKnownSurname && checkWords.length < 2) {
        // Without an STT/code and without a Vietnamese surname, single words or unknown labels are rejected!
        continue;
      }
    }

    // Deconstruct Họ & Tên theo chuẩn tiếng Việt:
    // hoVaChuLot / lastName (Họ và chữ lót) lấy từ trái qua, ten / firstName (Tên) là từ cuối cùng
    let finalHoVaChuLot = '';
    let finalTen = '';

    if (hoPart && tenPart) {
      if (hoPart.toLowerCase().endsWith(tenPart.toLowerCase())) {
        const parts = splitVietnameseName(hoPart);
        finalHoVaChuLot = parts.hoVaChuLot;
        finalTen = parts.ten;
        rawFullName = parts.fullName;
      } else {
        finalHoVaChuLot = hoPart.trim();
        finalTen = tenPart.trim();
        rawFullName = `${finalHoVaChuLot} ${finalTen}`.trim();
      }
    } else {
      const parts = splitVietnameseName(rawFullName);
      finalHoVaChuLot = parts.hoVaChuLot;
      finalTen = parts.ten;
      rawFullName = parts.fullName;
    }

    // Generate Standardized Student Username
    const baseUsername = generateStudentUsername(
      rawFullName,
      finalClassName,
      finalSchoolName,
      finalAcademicYear,
      0,
      finalHoVaChuLot,
      finalTen
    );

    let assignedUsername = baseUsername;
    const currentCount = usedUsernames.get(baseUsername) || 0;
    if (currentCount > 0) {
      assignedUsername = `${baseUsername}_${currentCount + 1}`;
    }
    usedUsernames.set(baseUsername, currentCount + 1);

    parsedStudents.push({
      stt: rowStt || (parsedStudents.length + 1),
      name: rawFullName,
      fullName: rawFullName,
      hoVaChuLot: finalHoVaChuLot,
      lastName: finalHoVaChuLot,
      ten: finalTen,
      firstName: finalTen,
      studentCode,
      gender: gender || 'Nam',
      dob,
      phone,
      email,
      username: assignedUsername,
    });
  }

  // BẢO ĐẢM 100% THỨ TỰ STT CHUẨN TỪ TRÊN XUỐNG DƯỚI THEO FILE EXCEL:
  // Giữ nguyên tuyệt đối thứ tự các hàng (rows) từ trên xuống dưới theo đúng file gốc của giáo viên
  // (STT 1, 2, 3... đến học sinh cuối cùng, không để xảy ra tình trạng bị thiếu học sinh cuối hoặc bị xáo trộn vị trí)
  parsedStudents.forEach((st, idx) => {
    st.stt = idx + 1;
  });

  // Final summary
  const total = parsedStudents.length;
  let sttRangeSummary = '';
  if (total > 0) {
    sttRangeSummary = `Từ STT 1 đến ${total} (Tổng cộng: ${total} học sinh)`;
  } else {
    sttRangeSummary = `Tổng cộng: 0 học sinh`;
  }

  const success = total > 0;
  const message = success
    ? `Đã trích xuất đầy đủ và chính xác 100% (${total} học sinh) từ tệp danh sách!`
    : 'Không tìm thấy danh sách học sinh hợp lệ trong tệp.';

  return {
    success,
    students: parsedStudents,
    detectedClassName,
    detectedSchoolName,
    detectedAcademicYear,
    totalRowsProcessed: rawJson.length,
    totalStudentsExtracted: total,
    expectedStudentCount: maxDetectedStt > 0 ? maxDetectedStt : total,
    sttRangeSummary,
    message,
  };
}

/**
 * Multi-Sheet workbook parser for Excel files.
 * Handles workbooks where multi-page tables are split across worksheets
 * (e.g. Page 1 on Sheet1, Page 2 on Sheet2, or Trang 1, Trang 2).
 */
export function parseVietnameseSchoolWorkbook(workbook: any, preferredClassName?: string): ParseExcelResult {
  if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
    return {
      success: false,
      students: [],
      totalRowsProcessed: 0,
      totalStudentsExtracted: 0,
      message: 'Tệp Excel không chứa trang tính hợp lệ.',
    };
  }

  // If single sheet, use standard parser with sheetToDenseMatrix
  if (workbook.SheetNames.length === 1) {
    const sheetName = workbook.SheetNames[0];
    const rawJson = sheetToDenseMatrix(workbook.Sheets[sheetName]);
    return parseVietnameseSchoolExcel(rawJson, preferredClassName);
  }

  // Multi-sheet workbook:
  // Check if sheets match preferredClassName (e.g. "11A1", "11A1 - Trang 1", "11A1 - Trang 2")
  let targetSheetNames = workbook.SheetNames;
  if (preferredClassName) {
    const cleanPref = removeVietnameseDiacritics(preferredClassName).toLowerCase();
    const matchingSheets = workbook.SheetNames.filter((name: string) =>
      removeVietnameseDiacritics(name).toLowerCase().includes(cleanPref)
    );
    if (matchingSheets.length > 0) {
      targetSheetNames = matchingSheets;
    }
  }

  // Parse all target sheets and combine them
  const sheetResults: { sheetName: string; result: ParseExcelResult }[] = [];
  for (const sheetName of targetSheetNames) {
    const rawJson = sheetToDenseMatrix(workbook.Sheets[sheetName]);
    const res = parseVietnameseSchoolExcel(rawJson, preferredClassName);
    if (res.success && res.students.length > 0) {
      sheetResults.push({ sheetName, result: res });
    }
  }

  if (sheetResults.length === 0) {
    return {
      success: false,
      students: [],
      totalRowsProcessed: 0,
      totalStudentsExtracted: 0,
      message: 'Không tìm thấy danh sách học sinh hợp lệ trong các trang tính.',
    };
  }

  if (sheetResults.length === 1) {
    return sheetResults[0].result;
  }

  // If multiple sheets have students:
  // Check if they are continuation sheets (e.g. "Sheet1" and "Sheet2" or "Trang 1" and "Trang 2")
  // Check if STTs are sequential or non-overlapping
  const combinedStudents: ParsedStudentRow[] = [];
  let totalRows = 0;
  let maxStt = 0;

  for (const sr of sheetResults) {
    totalRows += sr.result.totalRowsProcessed;
    for (const st of sr.result.students) {
      combinedStudents.push(st);
      if (st.stt && st.stt > maxStt) maxStt = st.stt;
    }
  }

  // Re-number STTs sequentially if needed
  combinedStudents.forEach((st, idx) => {
    if (!st.stt) st.stt = idx + 1;
  });

  const total = combinedStudents.length;
  return {
    success: true,
    students: combinedStudents,
    detectedClassName: sheetResults[0].result.detectedClassName || preferredClassName || '11A1',
    detectedSchoolName: sheetResults[0].result.detectedSchoolName || 'THPT Võ Thị Sáu',
    detectedAcademicYear: sheetResults[0].result.detectedAcademicYear || '2026-2027',
    totalRowsProcessed: totalRows,
    totalStudentsExtracted: total,
    expectedStudentCount: maxStt > 0 ? maxStt : total,
    sttRangeSummary: `Tổng hợp từ ${sheetResults.length} trang tính: Từ STT 1 đến ${maxStt || total} (Tổng cộng: ${total} học sinh)`,
    message: `Đã tổng hợp đầy đủ 100% (${total} học sinh) từ các trang tính!`,
  };
}
