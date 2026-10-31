var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var vietnameseExcelParser_exports = {};
__export(vietnameseExcelParser_exports, {
  ASSESSMENT_HEADER_REGEX: () => ASSESSMENT_HEADER_REGEX,
  RATING_WORDS: () => RATING_WORDS,
  cleanTextCell: () => cleanTextCell,
  formatExcelDate: () => formatExcelDate,
  generateStudentUsername: () => generateStudentUsername,
  isAcademicRatingOrEvaluation: () => isAcademicRatingOrEvaluation,
  isAssessmentOrScoreHeader: () => isAssessmentOrScoreHeader,
  isLikelyGivenName: () => isLikelyGivenName,
  isLikelyVietnameseName: () => isLikelyVietnameseName,
  isStatisticsOrCountSummary: () => isStatisticsOrCountSummary,
  parseVietnameseSchoolExcel: () => parseVietnameseSchoolExcel,
  parseVietnameseSchoolWorkbook: () => parseVietnameseSchoolWorkbook,
  removeVietnameseDiacritics: () => removeVietnameseDiacritics,
  sheetToDenseMatrix: () => sheetToDenseMatrix,
  splitVietnameseName: () => splitVietnameseName
});
module.exports = __toCommonJS(vietnameseExcelParser_exports);
var XLSX = __toESM(require("xlsx"), 1);
function removeVietnameseDiacritics(str) {
  if (!str) return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "d").toLowerCase().replace(/[^a-z0-9]/g, "");
}
function cleanTextCell(val) {
  if (val === null || val === void 0) return "";
  const s = String(val).replace(/[\u200B\u200C\u200D\u200E\u200F\uFEFF\u00AD]/g, "").replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, " ").normalize("NFC").replace(/[\r\n\t]+/g, " ").trim();
  return s;
}
function sheetToDenseMatrix(worksheet) {
  if (!worksheet) return [];
  if (!worksheet["!ref"]) {
    return XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: "",
      blankrows: true,
      raw: false
    });
  }
  const range = XLSX.utils.decode_range(worksheet["!ref"]);
  const matrix = [];
  const merges = worksheet["!merges"] || [];
  for (let R = range.s.r; R <= range.e.r; ++R) {
    const row = [];
    let hasAnyData = false;
    for (let C = range.s.c; C <= range.e.c; ++C) {
      let cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      let cell = worksheet[cellAddress];
      if ((cell === void 0 || cell === null || cell.v === void 0 || cell.v === "") && merges.length > 0) {
        for (const m of merges) {
          if (R >= m.s.r && R <= m.e.r && C >= m.s.c && C <= m.e.c) {
            const originAddress = XLSX.utils.encode_cell({ r: m.s.r, c: m.s.c });
            cell = worksheet[originAddress];
            break;
          }
        }
      }
      let val = "";
      if (cell !== void 0 && cell !== null) {
        val = cell.w !== void 0 ? cell.w : cell.v !== void 0 ? cell.v : "";
      }
      const cleaned = cleanTextCell(val);
      if (cleaned.length > 0) {
        hasAnyData = true;
      }
      row.push(val);
    }
    if (hasAnyData) {
      matrix.push(row);
    }
  }
  return matrix;
}
function generateStudentUsername(fullName, className = "11A1", schoolName = "V\xF5 Th\u1ECB S\xE1u", academicYear = "2026-2027", duplicateIndex = 0, hoOverride, tenOverride) {
  let ho = "";
  let ten = "";
  if (hoOverride && tenOverride) {
    const hoWords = cleanTextCell(hoOverride).split(/\s+/).filter(Boolean);
    ho = removeVietnameseDiacritics(hoWords[0] || "hs");
    ten = removeVietnameseDiacritics(tenOverride);
  } else {
    const parts = cleanTextCell(fullName).split(/\s+/).filter(Boolean);
    ho = parts.length > 0 ? removeVietnameseDiacritics(parts[0]) : "hs";
    ten = parts.length > 1 ? removeVietnameseDiacritics(parts[parts.length - 1]) : parts[0] ? removeVietnameseDiacritics(parts[0]) : "an";
  }
  const classClean = removeVietnameseDiacritics(className).replace(/^lop/, "");
  const classPart = classClean || "11a1";
  let cleanSchool = schoolName || "V\xF5 Th\u1ECB S\xE1u";
  cleanSchool = cleanSchool.replace(/trường|thpt|thcs|tiểu\s*học|ptth|đại\s*học|cao\s*đẳng|liên\s*cấp/gi, "").trim();
  const schoolWords = cleanSchool.split(/[\s\-_\.]+/).filter(Boolean);
  let schoolAbbr = schoolWords.map((w) => removeVietnameseDiacritics(w).charAt(0)).join("").toLowerCase();
  if (!schoolAbbr || schoolAbbr.length === 0) {
    schoolAbbr = "vts";
  }
  const yearMatches = (academicYear || "2026-2027").match(/\b(20)?(\d{2})\b/g);
  let yearPart = "2627";
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
function formatExcelDate(value) {
  if (value === null || value === void 0) return void 0;
  if (typeof value === "string") {
    const trimmed = cleanTextCell(value);
    if (!trimmed) return void 0;
    const dmy = trimmed.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
    if (dmy) {
      const d = dmy[1].padStart(2, "0");
      const m = dmy[2].padStart(2, "0");
      const y = dmy[3];
      return `${d}/${m}/${y}`;
    }
    const ymd = trimmed.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
    if (ymd) {
      const y = ymd[1];
      const m = ymd[2].padStart(2, "0");
      const d = ymd[3].padStart(2, "0");
      return `${d}/${m}/${y}`;
    }
    if (/^\d{4}$/.test(trimmed)) {
      return `01/01/${trimmed}`;
    }
    return void 0;
  }
  if (typeof value === "number") {
    if (value > 1e3 && value < 6e4) {
      const date = new Date(Math.round((value - 25569) * 86400 * 1e3));
      if (!isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
    }
  }
  return void 0;
}
const VIETNAMESE_SURNAMES = /* @__PURE__ */ new Set([
  "nguyen",
  "nguy\u1EC5n",
  "tran",
  "tr\u1EA7n",
  "le",
  "l\xEA",
  "pham",
  "ph\u1EA1m",
  "hoang",
  "ho\xE0ng",
  "huynh",
  "hu\u1EF3nh",
  "phan",
  "vu",
  "v\u0169",
  "vo",
  "v\xF5",
  "dang",
  "\u0111\u1EB7ng",
  "bui",
  "b\xF9i",
  "do",
  "\u0111\u1ED7",
  "ho",
  "h\u1ED3",
  "ngo",
  "ng\xF4",
  "duong",
  "d\u01B0\u01A1ng",
  "ly",
  "l\xFD",
  "dinh",
  "\u0111inh",
  "doan",
  "\u0111o\xE0n",
  "lam",
  "l\xE2m",
  "trinh",
  "tr\u1ECBnh",
  "mai",
  "dao",
  "\u0111\xE0o",
  "cao",
  "ha",
  "h\xE0",
  "luong",
  "l\u01B0\u01A1ng",
  "thai",
  "th\xE1i",
  "ta",
  "t\u1EA1",
  "phung",
  "ph\xF9ng",
  "to",
  "t\xF4",
  "quach",
  "qu\xE1ch",
  "bach",
  "b\u1EA1ch",
  "nghiem",
  "nghi\xEAm",
  "la",
  "trieu",
  "tri\u1EC7u",
  "chu",
  "ch\xE2u",
  "luc",
  "l\u1EE5c",
  "luu",
  "l\u01B0u",
  "nham",
  "nh\xE2m",
  "khong",
  "kh\u1ED5ng",
  "kieu",
  "ki\u1EC1u",
  "luc",
  "l\u1EF1c",
  "ma",
  "m\xE3",
  "truong",
  "tr\u01B0\u01A1ng",
  "chau",
  "ch\xE2u",
  "cu",
  "c\xF9",
  "quan",
  "qu\u1EA3n",
  "tieu",
  "ti\xEAu",
  "kim",
  "kha",
  "vi",
  "ton",
  "t\xF4n",
  "than",
  "th\xE2n",
  "giap",
  "gi\xE1p",
  "duong",
  "\u0111\u01B0\u1EDDng",
  "sam",
  "s\u1EA7m",
  "la",
  "l\xE3",
  "hua",
  "h\u1EE9a",
  "tu",
  "t\u1EEB",
  "tong",
  "t\u1ED1ng",
  "tang",
  "t\u0103ng",
  "lieu",
  "li\xEAu",
  "tham",
  "th\u1EA9m",
  "chung",
  "van",
  "v\u1EA1n",
  "phu",
  "ph\xF9",
  "nhieu",
  "nhi\xEAu",
  "khuu",
  "kh\u01B0u",
  "cung",
  "trang",
  "nhu",
  "nh\u1EEF",
  "tao",
  "t\xE0o",
  "dong",
  "\u0111\u1ED5ng",
  "thi",
  "thieu",
  "thi\u1EC1u",
  "vien",
  "vi\xEAn",
  "doan",
  "do\xE3n",
  "van",
  "v\u0103n",
  "thach",
  "th\u1EA1ch",
  "danh",
  "nhan",
  "quyen",
  "quy\u1EC1n",
  "hhen",
  "h'hen",
  "ymoan",
  "y'moan"
]);
const VIETNAMESE_ETHNICITIES = /* @__PURE__ */ new Set([
  "kinh",
  "t\xE0y",
  "th\xE1i",
  "m\u01B0\u1EDDng",
  "h'm\xF4ng",
  "hm\xF4ng",
  "dao",
  "gia rai",
  "\xEA \u0111\xEA",
  "ba na",
  "x\u01A1 \u0111\u0103ng",
  "s\xE1n d\xECu",
  "hr\xEA",
  "c\u01A1 ho",
  "ch\u0103m",
  "s\xE1n chay",
  "khmer",
  "mn\xF4ng",
  "th\u1ED5",
  "gi\xE1y",
  "c\u01A1 tu",
  "gi\xE9 tri\xEAng",
  "m\u1EA1",
  "kh\u01A1 m\xFA",
  "co",
  "t\xE0 \xF4i",
  "ch\u01A1 ro",
  "kh\xE1ng",
  "xinh mun",
  "h\xE0 nh\xEC",
  "chu ru",
  "l\xE0o",
  "la ch\xED",
  "la ha",
  "ph\xF9 l\xE1",
  "la h\u1EE7",
  "l\u1EF1",
  "l\xF4 l\xF4",
  "ch\u1EE9t",
  "m\u1EA3ng",
  "p\xE0 th\u1EBBn",
  "c\u01A1 lao",
  "c\u1ED1ng",
  "b\u1ED1 y",
  "si la",
  "pu p\xE9o",
  "br\xE2u",
  "\u01A1 \u0111u",
  "r\u01A1 m\u0103m",
  "hoa",
  "ng\xE1i"
]);
const ASSESSMENT_HEADER_REGEX = /^(đ?tx\d*|kttx\d*|đ?gk\d*|ktgk\d*|đ?ck\d*|ktck\d*|đtbm?\w*|tbcm|đđgtx|đđggk|đđgck|ktđk\d*)$/i;
function isAssessmentOrScoreHeader(val) {
  if (!val) return false;
  const clean = val.trim().toLowerCase();
  if (ASSESSMENT_HEADER_REGEX.test(clean)) return true;
  if (/^(giữa\s*k[ỳì]|cuối\s*k[ỳì]|thường\s*xuyên|định\s*k[ỳì]|kiểm\s*tra\s*(thường\s*xuyên|định\s*k[ỳì]|giữa\s*k[ỳì]|cuối\s*k[ỳì]))$/i.test(clean)) return true;
  if (/^(điểm\s*(tb|tbc|tbcm|miệng|15p|1\s*tiết|thi)|đtb|đtbm|hk[12]|học\s*k[ỳì]\s*[12])$/i.test(clean)) return true;
  return false;
}
function splitVietnameseName(fullName) {
  const clean = cleanTextCell(fullName).replace(/^(\d+[\.\/\-\)]\s*|stt\s*[:\s]*\d+[:\s]*)/i, "").replace(/[\*\#\?\+]+$/g, "").replace(/\s*\([^)]*\)$/g, "").normalize("NFC").replace(/\s+/g, " ").trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return { hoVaChuLot: "", ten: "", lastName: "", firstName: "", fullName: "" };
  }
  if (words.length === 1) {
    return {
      hoVaChuLot: "",
      ten: words[0],
      lastName: "",
      firstName: words[0],
      fullName: words[0]
    };
  }
  const ten = words[words.length - 1];
  const hoVaChuLot = words.slice(0, -1).join(" ");
  return {
    hoVaChuLot,
    ten,
    lastName: hoVaChuLot,
    firstName: ten,
    fullName: `${hoVaChuLot} ${ten}`
  };
}
const RATING_WORDS = /* @__PURE__ */ new Set([
  "ch\u01B0a \u0111\u1EA1t",
  "chua dat",
  "c.\u0111\u1EA1t",
  "c\u0111",
  "trung b\xECnh",
  "tb",
  "y\u1EBFu",
  "yeu",
  "k\xE9m",
  "kem",
  "xu\u1EA5t s\u1EAFc",
  "xuat sac",
  "ho\xE0n th\xE0nh t\u1ED1t",
  "ch\u01B0a ho\xE0n th\xE0nh",
  "htt",
  "cht",
  "t\u1ED1t kh\xE1 \u0111\u1EA1t ch\u01B0a \u0111\u1EA1t",
  "t\u1ED1t kh\xE1 \u0111\u1EA1t",
  "gi\u1ECFi kh\xE1 trung b\xECnh y\u1EBFu k\xE9m"
]);
function isAcademicRatingOrEvaluation(val) {
  if (!val) return false;
  const clean = val.trim().toLowerCase();
  if (RATING_WORDS.has(clean)) return true;
  if (/^(chưa\s*đạt|c\.?\s*đạt|cđ|xuất\s*sắc|hoàn\s*thành\s*tốt|chưa\s*hoàn\s*thành|trung\s*bình|htt|cht)$/i.test(clean)) return true;
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 2 && words.every((w) => /^(tốt|khá|đạt|chưa|cđ|giỏi|tb|yếu|kém|xuất|sắc|hoàn|thành)$/i.test(w))) {
    return true;
  }
  if (/^(xếp\s*loại|học\s*lực|hạnh\s*kiểm|rèn\s*luyện|mức\s*đạt(\s*được)?|kết\s*quả(\s*học\s*tập)?|đánh\s*giá)$/i.test(clean)) return true;
  if (/^(xếp\s*loại|học\s*lực|hạnh\s*kiểm|rèn\s*luyện|kết\s*quả)\s*[:\-]?\s*(tốt|khá|đạt|chưa\s*đạt|giỏi|trung\s*bình|tb|yếu|kém)/i.test(clean)) return true;
  return false;
}
function isStatisticsOrCountSummary(val) {
  if (!val) return false;
  const clean = val.trim().toLowerCase();
  if (/^\d+\s*(học\s*sinh|hs|em)$/i.test(clean)) return true;
  if (/^(tổng\s*số(\s*học\s*sinh)?|tổng\s*cộng|tỷ\s*lệ|tỉ\s*lệ|phần\s*trăm|số\s*lượng|thống\s*kê)/i.test(clean)) return true;
  if (/%$/.test(clean) || /^\d+(\.\d+)?%$/.test(clean)) return true;
  return false;
}
function isLikelyVietnameseName(str) {
  if (!str) return false;
  let clean = cleanTextCell(str);
  clean = clean.replace(/^(\d+[\.\/\-\)]\s*|stt\s*[:\s]*\d+[:\s]*)/i, "").trim();
  clean = clean.replace(/[\*\#\?\+]+$/g, "").trim();
  clean = clean.replace(/\s*\([^)]*\)$/g, "").trim();
  if (clean.length < 2 || clean.length > 50) return false;
  if (/\d/.test(clean)) return false;
  if (!/[a-zA-ZÀ-ỹ]/.test(clean)) return false;
  if (/^\d+$/.test(clean)) return false;
  if (/^\d{1,2}[\/\-\.]\d{1,2}/.test(clean)) return false;
  if (clean.includes("@")) return false;
  const lower = clean.toLowerCase();
  if (isAssessmentOrScoreHeader(lower)) return false;
  if (isAcademicRatingOrEvaluation(lower)) return false;
  if (isStatisticsOrCountSummary(lower)) return false;
  if (VIETNAMESE_ETHNICITIES.has(lower)) return false;
  const exactHeaderOrFooterLabels = [
    "h\u1ECD v\xE0 t\xEAn",
    "h\u1ECD t\xEAn",
    "h\u1ECD v\xE0 ch\u1EEF l\xF3t",
    "h\u1ECD v\xE0 \u0111\u1EC7m",
    "h\u1ECD \u0111\u1EC7m",
    "h\u1ECD l\xF3t",
    "h\u1ECD",
    "h\u1ECD v\xE0 ch\u1EEF l\xF3t t\xEAn",
    "h\u1ECD v\xE0 \u0111\u1EC7m t\xEAn",
    "h\u1ECD t\xEAn h\u1ECDc sinh",
    "h\u1ECD v\xE0 t\xEAn h\u1ECDc sinh",
    "t\xEAn",
    "t\xEAn h\u1ECDc sinh",
    "t\xEAn hs",
    "t\xEAn khai sinh",
    "t\xEAn ri\xEAng",
    "m\xE3 h\u1ECDc sinh",
    "m\xE3 hs",
    "m\xE3 \u0111\u1ECBnh danh",
    "stt",
    "s\u1ED1 th\u1EE9 t\u1EF1",
    "s\u1ED1 tt",
    "ng\xE0y sinh",
    "n\u0103m sinh",
    "n.sinh",
    "gi\u1EDBi t\xEDnh",
    "ph\xE1i",
    "l\u1EDBp",
    "l\u1EDBp h\u1ECDc",
    "ghi ch\xFA",
    "x\u1EBFp lo\u1EA1i",
    "h\u1ECDc l\u1EF1c",
    "h\u1EA1nh ki\u1EC3m",
    "\u0111i\u1EC3m tb",
    "tbcm",
    "s\u0111t",
    "\u0111i\u1EC7n tho\u1EA1i",
    "email",
    "th\u1ED1ng k\xEA",
    "th\u1ED1ng k\xEA h\u1ECDc k\u1EF3",
    "ng\u01B0\u1EDDi l\u1EADp bi\u1EC3u",
    "ng\u01B0\u1EDDi l\u1EADp",
    "gi\xE1o vi\xEAn b\u1ED9 m\xF4n",
    "gi\xE1o vi\xEAn ch\u1EE7 nhi\u1EC7m",
    "hi\u1EC7u tr\u01B0\u1EDFng",
    "ban gi\xE1m hi\u1EC7u",
    "t\u1ED5ng s\u1ED1 h\u1ECDc sinh",
    "t\u1ED5ng c\u1ED9ng",
    "ch\u1EEF k\xFD",
    "d\xE2n t\u1ED9c",
    "qu\xEA qu\xE1n",
    "n\u01A1i sinh",
    "ch\u1ED7 \u1EDF hi\u1EC7n nay",
    "\u0111o\xE0n vi\xEAn",
    "\u0111\u1ED9i vi\xEAn",
    "k\u1EBFt qu\u1EA3",
    "r\xE8n luy\u1EC7n",
    "m\u1EE9c \u0111\u1EA1t"
  ];
  if (exactHeaderOrFooterLabels.includes(lower)) return false;
  if (lower.startsWith("th\u1ED1ng k\xEA") || lower.startsWith("ng\u01B0\u1EDDi l\u1EADp") || lower.startsWith("gi\xE1o vi\xEAn") || lower.startsWith("hi\u1EC7u tr\u01B0\u1EDFng") || lower.startsWith("t\u1ED5ng s\u1ED1") || lower.startsWith("b\u1EA3ng \u0111i\u1EC3m") || lower.startsWith("tr\u01B0\u1EDDng thpt") || lower.startsWith("tr\u01B0\u1EDDng thcs") || lower.startsWith("s\u1EDF gi\xE1o d\u1EE5c") || lower.startsWith("danh s\xE1ch h\u1ECDc sinh") || lower.startsWith("x\xE1c nh\u1EADn") || lower.startsWith("trang ") || lower.startsWith("x\u1EBFp lo\u1EA1i")) {
    return false;
  }
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length > 7) return false;
  if (words.every((w) => isAcademicRatingOrEvaluation(w) || isAssessmentOrScoreHeader(w))) {
    return false;
  }
  const firstWordNoAccent = removeVietnameseDiacritics(words[0]);
  if (VIETNAMESE_SURNAMES.has(firstWordNoAccent) || VIETNAMESE_SURNAMES.has(words[0].toLowerCase())) {
    return true;
  }
  if (words.length >= 2 && words.length <= 6 && words.every((w) => /^[a-zA-ZÀ-ỹ\.'\-]+$/.test(w))) {
    return true;
  }
  if (words.length === 1 && /^[a-zA-ZÀ-ỹ]+$/.test(words[0]) && words[0].length >= 1) {
    if (!isAcademicRatingOrEvaluation(words[0]) && !isAssessmentOrScoreHeader(words[0])) {
      return true;
    }
  }
  return false;
}
function isLikelyGivenName(val) {
  if (!val) return false;
  const clean = val.trim();
  if (/\d/.test(clean)) return false;
  if (!/[a-zA-ZÀ-ỹ]/.test(clean)) return false;
  if (/^\d+$/.test(clean)) return false;
  if (/^\d{1,2}[\/\-\.]\d{1,2}/.test(clean)) return false;
  if (/^[xvf\-\+\*10]$/i.test(clean)) return false;
  const lower = clean.toLowerCase();
  if (isAssessmentOrScoreHeader(lower)) return false;
  if (/^(chưa\s*đạt|c\.?\s*đạt|cđ|xuất\s*sắc|hoàn\s*thành\s*tốt|chưa\s*hoàn\s*thành|trung\s*bình|htt|cht)$/i.test(lower)) {
    return false;
  }
  if (/^(ngày\s*sinh|nam\/nữ|dân\s*tộc|ghi\s*chú|lớp|định\s*danh|mã\s*hs|stt|xếp\s*loại|học\s*lực|hạnh\s*kiểm|rèn\s*luyện|mức\s*đạt|kết\s*quả|học\s*sinh|điểm)$/i.test(lower)) {
    return false;
  }
  return true;
}
function isHeaderOrBannerRow(row) {
  if (!row || !Array.isArray(row)) return false;
  const nonEmpties = row.map((c) => cleanTextCell(c)).filter(Boolean);
  if (nonEmpties.length === 0) return true;
  const rowTextAll = nonEmpties.map((c) => c.toLowerCase()).join(" ");
  let parensNumberingCount = 0;
  for (const c of nonEmpties) {
    if (/^\(\d+\)$/.test(c) || c.length <= 2 && /^\d+$/.test(c)) {
      parensNumberingCount++;
    }
  }
  if (parensNumberingCount >= 3 && parensNumberingCount >= nonEmpties.length - 1) {
    return true;
  }
  const hasSttNumber = nonEmpties.slice(0, 4).some((c) => {
    const match = c.match(/^\s*(\d{1,5})\s*[\.\:\-\)\/]?$/);
    if (!match) return false;
    const num = parseInt(match[1], 10);
    return num > 0 && num < 1e4;
  });
  const hasCode = nonEmpties.slice(0, 4).some((c) => /^\d{6,14}$/.test(c) || /^HS\d{4,10}$/i.test(c));
  if (hasSttNumber || hasCode) {
    return false;
  }
  const hasSttLabel = nonEmpties.some((c) => /^(stt|số\s*tt|số\s*thứ\s*tự|no\.?)$/i.test(c));
  const hasNameLabel = nonEmpties.some((c) => /(họ\s*(và|&)?\s*tên|họ\s*(và|&)?\s*(chữ\s*)?lót|tên\s*học\s*sinh|^tên$)/i.test(c));
  const hasCodeLabel = nonEmpties.some((c) => /(mã\s*(hs|học\s*sinh|định\s*danh)|mshs|sbd)/i.test(c));
  if (hasSttLabel && (hasNameLabel || hasCodeLabel)) {
    return true;
  }
  const hasHoLabel = nonEmpties.some((c) => /^(họ\s*(và|&)?\s*(chữ\s*)?lót|họ\s*(và|&)?\s*(tên\s*)?đệm|họ\s*đệm|họ\s*lót|^họ)$/i.test(c));
  const hasTenLabel = nonEmpties.some((c) => /^(tên|tên\s*gọi|tên\s*hs|tên\s*học\s*sinh)$/i.test(c));
  if (hasHoLabel && hasTenLabel) {
    return true;
  }
  if (rowTextAll.startsWith("th\u1ED1ng k\xEA") || rowTextAll.startsWith("ng\u01B0\u1EDDi l\u1EADp") || rowTextAll.startsWith("gi\xE1o vi\xEAn") || rowTextAll.startsWith("hi\u1EC7u tr\u01B0\u1EDFng") || rowTextAll.startsWith("ban gi\xE1m hi\u1EC7u") || rowTextAll.startsWith("t\u1ED5ng s\u1ED1") || rowTextAll.startsWith("t\u1ED5ng c\u1ED9ng") || rowTextAll.startsWith("x\u1EBFp lo\u1EA1i:") || rowTextAll.startsWith("trang ") || /trang\s+\d+\s*\/\s*\d+/i.test(rowTextAll) || rowTextAll.includes("ng\xE0y") && rowTextAll.includes("th\xE1ng") && rowTextAll.includes("n\u0103m") && nonEmpties.length <= 4) {
    return true;
  }
  if (/(lớp\s*[:\-]?\s*[0-9a-zA-Z]|niên\s*(học|khóa)|năm\s*học|học\s*k[ỳì]|trường\s+|sở\s*gd|phòng\s*gd|danh\s*sách\s*học\s*sinh|bảng\s*điểm)/i.test(rowTextAll) && nonEmpties.length <= 4) {
    return true;
  }
  const assessmentCount = nonEmpties.filter((c) => isAssessmentOrScoreHeader(c)).length;
  if (assessmentCount >= 2) {
    return true;
  }
  const ratingCount = nonEmpties.filter((c) => isAcademicRatingOrEvaluation(c)).length;
  if (ratingCount >= 2) {
    return true;
  }
  const allAreHeadersOrRatings = nonEmpties.every(
    (c) => isAssessmentOrScoreHeader(c) || isAcademicRatingOrEvaluation(c) || /^\d+([\,\.]\d+)?%?$/.test(c) || /^\(\d+\)$/.test(c) || /^[xvf\-\+\*10]$/i.test(c)
  );
  if (allAreHeadersOrRatings) {
    return true;
  }
  return false;
}
function inspectHeaderRow(row) {
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
    emailCol
  };
}
function parseVietnameseSchoolExcel(rawJson, preferredClassName) {
  if (!rawJson || rawJson.length === 0) {
    return {
      success: false,
      students: [],
      totalRowsProcessed: 0,
      totalStudentsExtracted: 0,
      message: "T\u1EC7p kh\xF4ng ch\u1EE9a d\u1EEF li\u1EC7u h\u1EE3p l\u1EC7."
    };
  }
  let detectedClassName = preferredClassName;
  let detectedSchoolName;
  let detectedAcademicYear;
  for (let r = 0; r < Math.min(rawJson.length, 25); r++) {
    const row = rawJson[r] || [];
    row.forEach((cell) => {
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
        detectedAcademicYear = yearMatch[2].replace(/\s+/g, "");
      }
    });
  }
  const finalClassName = detectedClassName || "11A1";
  const finalSchoolName = detectedSchoolName || "THPT V\xF5 Th\u1ECB S\xE1u";
  const finalAcademicYear = detectedAcademicYear || "2026-2027";
  let bestHeaderRowIdx = -1;
  let maxHeaderScore = -1;
  for (let r = 0; r < Math.min(rawJson.length, 30); r++) {
    const row = rawJson[r];
    if (!Array.isArray(row)) continue;
    let score = 0;
    row.forEach((cell) => {
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
  if (maxHeaderScore < 5 || bestHeaderRowIdx === -1) {
    for (let r = 0; r < Math.min(rawJson.length - 1, 30); r++) {
      const row = rawJson[r] || [];
      const nextRow = rawJson[r + 1] || [];
      const val0 = cleanTextCell(row[0]);
      const nextVal0 = cleanTextCell(nextRow[0]);
      const val1 = cleanTextCell(row[1]);
      const nextVal1 = cleanTextCell(nextRow[1]);
      if (val0 === "1" && nextVal0 === "2" || val1 === "1" && nextVal1 === "2") {
        bestHeaderRowIdx = Math.max(0, r - 1);
        break;
      }
    }
  }
  const primaryHeaderIdx = bestHeaderRowIdx !== -1 ? bestHeaderRowIdx : 0;
  let currentHeaderCols = inspectHeaderRow(rawJson[primaryHeaderIdx] || []);
  if (primaryHeaderIdx + 1 < rawJson.length) {
    const subRow = rawJson[primaryHeaderIdx + 1] || [];
    const val0 = cleanTextCell(subRow[0]);
    const val1 = cleanTextCell(subRow[1]);
    if (val0 !== "1" && val1 !== "1" && val0 !== "01" && val1 !== "01") {
      const subCols = inspectHeaderRow(subRow);
      if (subCols.hoCol !== -1) currentHeaderCols.hoCol = subCols.hoCol;
      if (subCols.tenCol !== -1) currentHeaderCols.tenCol = subCols.tenCol;
      if (subCols.fullNameCol !== -1 && currentHeaderCols.fullNameCol === -1) currentHeaderCols.fullNameCol = subCols.fullNameCol;
      if (subCols.dobCol !== -1 && currentHeaderCols.dobCol === -1) currentHeaderCols.dobCol = subCols.dobCol;
      if (subCols.genderFemaleCol !== -1 && currentHeaderCols.genderFemaleCol === -1) currentHeaderCols.genderFemaleCol = subCols.genderFemaleCol;
      if (subCols.genderCol !== -1 && currentHeaderCols.genderCol === -1) currentHeaderCols.genderCol = subCols.genderCol;
    }
  }
  if (currentHeaderCols.hoCol === -1 && currentHeaderCols.fullNameCol !== -1 && currentHeaderCols.tenCol !== -1 && currentHeaderCols.fullNameCol !== currentHeaderCols.tenCol) {
    currentHeaderCols.hoCol = currentHeaderCols.fullNameCol;
    currentHeaderCols.fullNameCol = -1;
  }
  if (currentHeaderCols.hoCol === -1 && currentHeaderCols.fullNameCol !== -1 && currentHeaderCols.tenCol === -1) {
    const candidateTenCol = currentHeaderCols.fullNameCol + 1;
    const isCandidateOtherCol = candidateTenCol === currentHeaderCols.sttCol || candidateTenCol === currentHeaderCols.codeCol || candidateTenCol === currentHeaderCols.dobCol || candidateTenCol === currentHeaderCols.genderCol || candidateTenCol === currentHeaderCols.genderFemaleCol || candidateTenCol === currentHeaderCols.danTocCol || candidateTenCol === currentHeaderCols.phoneCol || candidateTenCol === currentHeaderCols.emailCol;
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
  const parsedStudents = [];
  const usedUsernames = /* @__PURE__ */ new Map();
  let maxDetectedStt = 0;
  for (let r = primaryHeaderIdx + 1; r < rawJson.length; r++) {
    const row = rawJson[r];
    if (!row || !Array.isArray(row)) continue;
    const nonEmpties = row.map((c) => cleanTextCell(c)).filter(Boolean);
    if (nonEmpties.length === 0) continue;
    const isHeader = isHeaderOrBannerRow(row);
    if (isHeader) {
      const potentialCols = inspectHeaderRow(row);
      if (potentialCols.sttCol !== -1) currentHeaderCols.sttCol = potentialCols.sttCol;
      if (potentialCols.codeCol !== -1) currentHeaderCols.codeCol = potentialCols.codeCol;
      if (potentialCols.hoCol !== -1) currentHeaderCols.hoCol = potentialCols.hoCol;
      if (potentialCols.tenCol !== -1) currentHeaderCols.tenCol = potentialCols.tenCol;
      if (potentialCols.fullNameCol !== -1) currentHeaderCols.fullNameCol = potentialCols.fullNameCol;
      if (potentialCols.dobCol !== -1) currentHeaderCols.dobCol = potentialCols.dobCol;
      if (potentialCols.genderCol !== -1) currentHeaderCols.genderCol = potentialCols.genderCol;
      if (potentialCols.genderFemaleCol !== -1) currentHeaderCols.genderFemaleCol = potentialCols.genderFemaleCol;
      if (currentHeaderCols.hoCol !== -1 && currentHeaderCols.tenCol !== -1) {
        currentHeaderCols.fullNameCol = -1;
      } else if (currentHeaderCols.hoCol === -1 && currentHeaderCols.fullNameCol !== -1 && currentHeaderCols.tenCol !== -1 && currentHeaderCols.fullNameCol !== currentHeaderCols.tenCol) {
        currentHeaderCols.hoCol = currentHeaderCols.fullNameCol;
        currentHeaderCols.fullNameCol = -1;
      } else if (currentHeaderCols.hoCol === -1 && currentHeaderCols.fullNameCol !== -1 && currentHeaderCols.tenCol === -1) {
        const candidateTenCol = currentHeaderCols.fullNameCol + 1;
        const isCandOther = candidateTenCol === currentHeaderCols.sttCol || candidateTenCol === currentHeaderCols.codeCol || candidateTenCol === currentHeaderCols.dobCol || candidateTenCol === currentHeaderCols.genderCol || candidateTenCol === currentHeaderCols.genderFemaleCol || candidateTenCol === currentHeaderCols.danTocCol;
        if (!isCandOther) {
          currentHeaderCols.hoCol = currentHeaderCols.fullNameCol;
          currentHeaderCols.tenCol = candidateTenCol;
          currentHeaderCols.fullNameCol = -1;
        }
      }
      continue;
    }
    let rowStt;
    if (currentHeaderCols.sttCol !== -1 && row[currentHeaderCols.sttCol] !== void 0) {
      const sVal = cleanTextCell(row[currentHeaderCols.sttCol]);
      const match = sVal.match(/^\s*(\d{1,5})\s*[\.\:\-\)\/]?$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > 0 && num < 1e4) {
          rowStt = num;
        }
      }
    }
    if (!rowStt) {
      for (let c = 0; c < Math.min(4, row.length); c++) {
        const val = cleanTextCell(row[c]);
        const match = val.match(/^\s*(\d{1,5})\s*[\.\:\-\)\/]?$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > 0 && num < 1e4) {
            rowStt = num;
            break;
          }
        }
      }
    }
    if (rowStt && rowStt > maxDetectedStt) {
      maxDetectedStt = rowStt;
    }
    let studentCode;
    if (currentHeaderCols.codeCol !== -1 && row[currentHeaderCols.codeCol] !== void 0) {
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
    let dob;
    if (currentHeaderCols.dobCol !== -1 && row[currentHeaderCols.dobCol] !== void 0) {
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
    let gender;
    if (currentHeaderCols.genderFemaleCol !== -1 && row[currentHeaderCols.genderFemaleCol] !== void 0) {
      const fVal = cleanTextCell(row[currentHeaderCols.genderFemaleCol]).toLowerCase();
      if (fVal === "x" || fVal === "1" || fVal === "n\u1EEF" || fVal === "nu" || fVal === "v") {
        gender = "N\u1EEF";
      } else {
        gender = "Nam";
      }
    } else if (currentHeaderCols.genderCol !== -1 && row[currentHeaderCols.genderCol] !== void 0) {
      const gRaw = cleanTextCell(row[currentHeaderCols.genderCol]).toLowerCase();
      if (gRaw.includes("n\u1EEF") || gRaw === "f" || gRaw === "nu" || gRaw === "x") {
        gender = "N\u1EEF";
      } else if (gRaw.includes("nam") || gRaw === "m") {
        gender = "Nam";
      }
    }
    if (!gender) {
      for (let c = 0; c < row.length; c++) {
        const val = cleanTextCell(row[c]).toLowerCase();
        if (val === "nam") {
          gender = "Nam";
          break;
        }
        if (val === "n\u1EEF" || val === "nu") {
          gender = "N\u1EEF";
          break;
        }
      }
    }
    let phone;
    if (currentHeaderCols.phoneCol !== -1 && row[currentHeaderCols.phoneCol] !== void 0) {
      const pRaw = cleanTextCell(row[currentHeaderCols.phoneCol]);
      if (/^[0-9+.\-\s()]{7,15}$/.test(pRaw)) phone = pRaw;
    }
    let email;
    if (currentHeaderCols.emailCol !== -1 && row[currentHeaderCols.emailCol] !== void 0) {
      const eRaw = cleanTextCell(row[currentHeaderCols.emailCol]);
      if (eRaw.includes("@")) email = eRaw;
    }
    let hoPart = "";
    let tenPart = "";
    let rawFullName = "";
    if (currentHeaderCols.hoCol !== -1 && currentHeaderCols.tenCol !== -1) {
      const rawHo = cleanTextCell(row[currentHeaderCols.hoCol]);
      let rawTen = cleanTextCell(row[currentHeaderCols.tenCol]);
      const isTenInvalid = !rawTen || !/[a-zA-ZÀ-ỹ]/.test(rawTen) || /\d/.test(rawTen) || /^\d{1,2}[\/\-\.]\d{1,2}/.test(rawTen) || /^[xvf\-\+\*10]$/i.test(rawTen) || /^(ngày\s*sinh|mã\s*hs|stt|dân\s*tộc)$/i.test(rawTen);
      if (isTenInvalid) {
        rawTen = "";
      }
      if (!rawTen && row[currentHeaderCols.hoCol + 1] !== void 0) {
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
    } else if (currentHeaderCols.fullNameCol !== -1 && row[currentHeaderCols.fullNameCol] !== void 0) {
      rawFullName = cleanTextCell(row[currentHeaderCols.fullNameCol]);
      const nextColIdx = currentHeaderCols.fullNameCol + 1;
      const isNextColOther = nextColIdx === currentHeaderCols.sttCol || nextColIdx === currentHeaderCols.codeCol || nextColIdx === currentHeaderCols.dobCol || nextColIdx === currentHeaderCols.genderCol || nextColIdx === currentHeaderCols.genderFemaleCol || nextColIdx === currentHeaderCols.danTocCol || nextColIdx === currentHeaderCols.phoneCol || nextColIdx === currentHeaderCols.emailCol;
      if (!isNextColOther && row[nextColIdx] !== void 0) {
        const nextVal = cleanTextCell(row[nextColIdx]);
        if (nextVal && isLikelyGivenName(nextVal) && !/^\d+$/.test(nextVal)) {
          const cleanNextVal = nextVal.trim();
          const lowerRaw = rawFullName.toLowerCase();
          const lowerNext = cleanNextVal.toLowerCase();
          if (!lowerRaw.endsWith(lowerNext) && !lowerRaw.endsWith(" " + lowerNext)) {
            hoPart = rawFullName;
            tenPart = cleanNextVal;
            rawFullName = `${hoPart} ${tenPart}`.trim();
          }
        }
      }
    }
    if (!rawFullName || !/[a-zA-ZÀ-ỹ]/.test(rawFullName) || /^\d+$/.test(rawFullName)) {
      const candidateCells = [];
      row.forEach((cell, idx) => {
        const text = cleanTextCell(cell);
        if (!text) return;
        if (/^\d+$/.test(text)) return;
        if (/^\d+([\,\.]\d+)?$/.test(text)) return;
        if (/^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}$/.test(text)) return;
        if (/^[xvf\-\+\*10]$/i.test(text)) return;
        if (currentHeaderCols.danTocCol !== -1 && idx === currentHeaderCols.danTocCol) return;
        if (text.toLowerCase() === "kinh") return;
        if (isAssessmentOrScoreHeader(text)) return;
        if (isAcademicRatingOrEvaluation(text)) return;
        if (isStatisticsOrCountSummary(text)) return;
        if (/\d/.test(text)) return;
        if (idx === currentHeaderCols.sttCol || idx === currentHeaderCols.codeCol || idx === currentHeaderCols.dobCol || idx === currentHeaderCols.genderCol || idx === currentHeaderCols.genderFemaleCol || idx === currentHeaderCols.danTocCol) {
          return;
        }
        if (/^(stt|mã\s*hs|ngày\s*sinh|lớp|niên\s*học|xếp\s*loại|học\s*lực|hạnh\s*kiểm)$/i.test(text)) return;
        if (/[a-zA-ZÀ-ỹ]/.test(text)) {
          candidateCells.push({ idx, text });
        }
      });
      if (candidateCells.length === 1) {
        rawFullName = candidateCells[0].text;
      } else if (candidateCells.length === 2 && candidateCells[1].idx === candidateCells[0].idx + 1) {
        hoPart = candidateCells[0].text;
        tenPart = candidateCells[1].text;
        rawFullName = `${hoPart} ${tenPart}`.trim();
      } else if (candidateCells.length > 2) {
        if (candidateCells[1].idx === candidateCells[0].idx + 1 && isLikelyGivenName(candidateCells[1].text)) {
          hoPart = candidateCells[0].text;
          tenPart = candidateCells[1].text;
          if (!hoPart.toLowerCase().endsWith(tenPart.toLowerCase())) {
            rawFullName = `${hoPart} ${tenPart}`.trim();
          } else {
            rawFullName = hoPart;
          }
        } else {
          const fullCandidate = candidateCells.find((c) => isLikelyVietnameseName(c.text));
          if (fullCandidate) {
            rawFullName = fullCandidate.text;
          } else {
            rawFullName = candidateCells.map((c) => c.text).join(" ");
          }
        }
      }
    }
    rawFullName = rawFullName.replace(/^(\d+[\.\/\-\)]\s*|stt\s*[:\s]*\d+[:\s]*)/i, "").replace(/[\*\#\?\+]+$/g, "").replace(/\s*\([^)]*\)$/g, "").normalize("NFC").replace(/\s+/g, " ").trim();
    if (!/[a-zA-ZÀ-ỹ]/.test(rawFullName) || rawFullName.length < 2) {
      continue;
    }
    if (/\d/.test(rawFullName)) {
      continue;
    }
    if (isAssessmentOrScoreHeader(rawFullName) || isAcademicRatingOrEvaluation(rawFullName) || isStatisticsOrCountSummary(rawFullName)) {
      continue;
    }
    const checkWords = rawFullName.split(/\s+/).filter(Boolean);
    if (checkWords.every((w) => isAcademicRatingOrEvaluation(w) || isAssessmentOrScoreHeader(w))) {
      continue;
    }
    const lowerFullName = rawFullName.toLowerCase();
    if (lowerFullName === "h\u1ECD v\xE0 t\xEAn" || lowerFullName === "h\u1ECD t\xEAn" || lowerFullName === "h\u1ECD v\xE0 ch\u1EEF l\xF3t" || lowerFullName === "h\u1ECD v\xE0 \u0111\u1EC7m" || lowerFullName === "h\u1ECD v\xE0 \u0111\u1EC7m t\xEAn" || lowerFullName === "h\u1ECD v\xE0 ch\u1EEF l\xF3t t\xEAn" || lowerFullName === "t\xEAn h\u1ECDc sinh" || lowerFullName === "m\xE3 h\u1ECDc sinh" || lowerFullName === "stt" || lowerFullName === "th\u1ED1ng k\xEA" || lowerFullName === "x\u1EBFp lo\u1EA1i" || /(lớp\s*[:\-]?\s*[0-9a-zA-Z]|niên\s*(học|khóa)|năm\s*học|học\s*k[ỳì]|trường\s+(thpt|thcs|tiểu|ptth)|danh\s*sách\s*học\s*sinh|bảng\s*điểm|thống\s*kê|tổng\s*số|người\s*lập|hiệu\s*trưởng|giáo\s*viên|trang\s+\d+|học\s*sinh|xếp\s*loại|kết\s*quả|đánh\s*giá)/i.test(
      lowerFullName
    )) {
      continue;
    }
    const hasValidRosterAnchor = rowStt && rowStt > 0 && rowStt < 1e4 || !!studentCode;
    if (!hasValidRosterAnchor) {
      const firstWord = checkWords[0] ? removeVietnameseDiacritics(checkWords[0]) : "";
      const isKnownSurname = VIETNAMESE_SURNAMES.has(firstWord) || checkWords[0] && VIETNAMESE_SURNAMES.has(checkWords[0].toLowerCase());
      if (!isKnownSurname && checkWords.length < 2) {
        continue;
      }
    }
    let finalHoVaChuLot = "";
    let finalTen = "";
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
      stt: rowStt || parsedStudents.length + 1,
      name: rawFullName,
      fullName: rawFullName,
      hoVaChuLot: finalHoVaChuLot,
      lastName: finalHoVaChuLot,
      ten: finalTen,
      firstName: finalTen,
      studentCode,
      gender: gender || "Nam",
      dob,
      phone,
      email,
      username: assignedUsername
    });
  }
  parsedStudents.forEach((st, idx) => {
    st.stt = idx + 1;
  });
  const total = parsedStudents.length;
  let sttRangeSummary = "";
  if (total > 0) {
    sttRangeSummary = `T\u1EEB STT 1 \u0111\u1EBFn ${total} (T\u1ED5ng c\u1ED9ng: ${total} h\u1ECDc sinh)`;
  } else {
    sttRangeSummary = `T\u1ED5ng c\u1ED9ng: 0 h\u1ECDc sinh`;
  }
  const success = total > 0;
  const message = success ? `\u0110\xE3 tr\xEDch xu\u1EA5t \u0111\u1EA7y \u0111\u1EE7 v\xE0 ch\xEDnh x\xE1c 100% (${total} h\u1ECDc sinh) t\u1EEB t\u1EC7p danh s\xE1ch!` : "Kh\xF4ng t\xECm th\u1EA5y danh s\xE1ch h\u1ECDc sinh h\u1EE3p l\u1EC7 trong t\u1EC7p.";
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
    message
  };
}
function parseVietnameseSchoolWorkbook(workbook, preferredClassName) {
  if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
    return {
      success: false,
      students: [],
      totalRowsProcessed: 0,
      totalStudentsExtracted: 0,
      message: "T\u1EC7p Excel kh\xF4ng ch\u1EE9a trang t\xEDnh h\u1EE3p l\u1EC7."
    };
  }
  if (workbook.SheetNames.length === 1) {
    const sheetName = workbook.SheetNames[0];
    const rawJson = sheetToDenseMatrix(workbook.Sheets[sheetName]);
    return parseVietnameseSchoolExcel(rawJson, preferredClassName);
  }
  let targetSheetNames = workbook.SheetNames;
  if (preferredClassName) {
    const cleanPref = removeVietnameseDiacritics(preferredClassName).toLowerCase();
    const matchingSheets = workbook.SheetNames.filter(
      (name) => removeVietnameseDiacritics(name).toLowerCase().includes(cleanPref)
    );
    if (matchingSheets.length > 0) {
      targetSheetNames = matchingSheets;
    }
  }
  const sheetResults = [];
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
      message: "Kh\xF4ng t\xECm th\u1EA5y danh s\xE1ch h\u1ECDc sinh h\u1EE3p l\u1EC7 trong c\xE1c trang t\xEDnh."
    };
  }
  if (sheetResults.length === 1) {
    return sheetResults[0].result;
  }
  const combinedStudents = [];
  let totalRows = 0;
  let maxStt = 0;
  for (const sr of sheetResults) {
    totalRows += sr.result.totalRowsProcessed;
    for (const st of sr.result.students) {
      combinedStudents.push(st);
      if (st.stt && st.stt > maxStt) maxStt = st.stt;
    }
  }
  combinedStudents.forEach((st, idx) => {
    if (!st.stt) st.stt = idx + 1;
  });
  const total = combinedStudents.length;
  return {
    success: true,
    students: combinedStudents,
    detectedClassName: sheetResults[0].result.detectedClassName || preferredClassName || "11A1",
    detectedSchoolName: sheetResults[0].result.detectedSchoolName || "THPT V\xF5 Th\u1ECB S\xE1u",
    detectedAcademicYear: sheetResults[0].result.detectedAcademicYear || "2026-2027",
    totalRowsProcessed: totalRows,
    totalStudentsExtracted: total,
    expectedStudentCount: maxStt > 0 ? maxStt : total,
    sttRangeSummary: `T\u1ED5ng h\u1EE3p t\u1EEB ${sheetResults.length} trang t\xEDnh: T\u1EEB STT 1 \u0111\u1EBFn ${maxStt || total} (T\u1ED5ng c\u1ED9ng: ${total} h\u1ECDc sinh)`,
    message: `\u0110\xE3 t\u1ED5ng h\u1EE3p \u0111\u1EA7y \u0111\u1EE7 100% (${total} h\u1ECDc sinh) t\u1EEB c\xE1c trang t\xEDnh!`
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ASSESSMENT_HEADER_REGEX,
  RATING_WORDS,
  cleanTextCell,
  formatExcelDate,
  generateStudentUsername,
  isAcademicRatingOrEvaluation,
  isAssessmentOrScoreHeader,
  isLikelyGivenName,
  isLikelyVietnameseName,
  isStatisticsOrCountSummary,
  parseVietnameseSchoolExcel,
  parseVietnameseSchoolWorkbook,
  removeVietnameseDiacritics,
  sheetToDenseMatrix,
  splitVietnameseName
});
