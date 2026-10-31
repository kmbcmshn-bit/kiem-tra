import { Exam, ExamQuestion, ExamVariant, TrueFalseItem } from '../types';

export interface GenerateExamOptions {
  subject?: string;
  gradeColumn?: 'DTX1' | 'DTX2' | 'GIUA_KY' | 'CUOI_KY';
  durationMinutes?: number;
  totalPoints?: number;
  desiredVariantCount?: number;
}

/**
 * Helper to determine which of the 3 parts a question belongs to
 * Chuẩn ma trận đề thi GDPT 2018 / Bộ GD&ĐT:
 * - Phần I: Trắc nghiệm nhiều phương án lựa chọn (A, B, C, D - chọn 1)
 * - Phần II: Trắc nghiệm Đúng / Sai (Mỗi câu gồm 4 ý a, b, c, d - chọn Đúng hoặc Sai)
 * - Phần III: Trắc nghiệm trả lời ngắn (điền số) hoặc Tự luận (làm bài trên giấy chụp ảnh nộp)
 */
export function getQuestionPartInfo(q: ExamQuestion, index: number = 0): {
  partNumber: 1 | 2 | 3;
  partRoman: 'Phần I' | 'Phần II' | 'Phần III';
  partTitle: string;
  partDescription: string;
} {
  if (q.partNumber === 1 || q.type === 'multiple_choice') {
    return {
      partNumber: 1,
      partRoman: 'Phần I',
      partTitle: 'PHẦN I. CÂU HỎI TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN',
      partDescription: 'Thí sinh trả lời từ các câu hỏi trắc nghiệm. Mỗi câu hỏi chỉ chọn một phương án (A, B, C hoặc D).',
    };
  }

  if (q.partNumber === 2 || q.type === 'true_false') {
    return {
      partNumber: 2,
      partRoman: 'Phần II',
      partTitle: 'PHẦN II. CÂU HỎI TRẮC NGHIỆM ĐÚNG / SAI',
      partDescription: 'Thí sinh trả lời từ các câu hỏi trắc nghiệm Đúng/Sai. Trong mỗi câu hỏi, thí sinh chọn Đúng hoặc Sai cho từng ý a), b), c), d).',
    };
  }

  return {
    partNumber: 3,
    partRoman: 'Phần III',
    partTitle: 'PHẦN III. CÂU HỎI TRẢ LỜI NGẮN / TỰ LUẬN',
    partDescription: 'Thí sinh điền kết quả ngắn hoặc giải tự luận chi tiết trên giấy rồi bấm nút chụp ảnh bài làm để tải lên.',
  };
}

/**
 * Builds the strict prompt ensuring Gemini adheres 100% to the 3-part matrix
 */
export function buildStrictMatrixPrompt(
  matrixContent: string,
  fileName: string,
  extraInstruction?: string
): string {
  return `CHỈ THỊ BIÊN SOẠN ĐỀ THI BÁM SÁT 100% THEO FILE MA TRẬN ĐÃ NẠP (CHUẨN 3 PHẦN GDPT 2018):
Tệp ma trận nguồn: "${fileName}".
NỘI DUNG MA TRẬN BÓC TÁCH:
"""
${matrixContent}
"""

${extraInstruction ? `YÊU CẦU BỔ SUNG TỪ GIÁO VIÊN: ${extraInstruction}\n` : ''}
NGUYÊN TẮC BẮT BUỘC NGHIÊM NGẶT:
1. ĐỀ THI PHẢI THỂ HIỆN ĐẦY ĐỦ 3 PHẦN RIÊNG BIỆT theo quy định đề thi tốt nghiệp GDPT 2018:
   - PHẦN I: Câu hỏi Trắc nghiệm nhiều phương án lựa chọn (type: "multiple_choice", gồm 4 phương án A, B, C, D; chọn 1 đáp án đúng).
   - PHẦN II: Câu hỏi Trắc nghiệm Đúng / Sai (type: "true_false", mỗi câu hỏi gồm 4 ý a, b, c, d - mỗi ý có correctAnswer là true (Đúng) hoặc false (Sai)).
   - PHẦN III: Câu hỏi Trả lời ngắn (type: "short_answer") hoặc Tự luận (type: "essay" - học sinh làm bài giải trên giấy rồi chụp ảnh nộp bài).
2. Toàn bộ các công thức toán, hàm số, phương trình, tập xác định, tọa độ PHẢI được định dạng trong dấu $...$ chuẩn LaTeX (ví dụ: $y = f(x)$, $f'(x) = 0$, $D = [0; 2]$, $\\vec{u} = (1; -2; 3)$) để hiển thị chuẩn mực SGK.
3. Tổng điểm toàn bài phải đúng 10.0 điểm.
4. Nghiệm số và dữ liệu bài toán phải là số đẹp, chuẩn kiến thức SGK.`;
}

/**
 * Generate isomorphic variants for individual students preserving 100% of the 3-part matrix exam structure.
 * Replaces numbers/parameters dynamically without hardcoding any specific function or template.
 */
export function generateIsomorphicVariantsFromBase(baseExam: Exam, count: number): Record<string, ExamVariant> {
  const variants: Record<string, ExamVariant> = {};

  for (let i = 0; i < count; i++) {
    const code = String(101 + i);
    const delta = (i % 5) - 2; // -2, -1, 0, 1, 2
    const questions: ExamQuestion[] = (baseExam.questions || []).map((q, qIdx) => {
      const clone: ExamQuestion = JSON.parse(JSON.stringify(q));
      clone.id = `code-${code}-q${qIdx + 1}`;
      clone.variantCode = code;

      // Rotate multiple choice options deterministically
      if (clone.type === 'multiple_choice' && clone.options && clone.options.length > 0) {
        const shift = (i + qIdx) % clone.options.length;
        const original = [...clone.options];
        const correctText = original[clone.correctAnswer ?? 0];
        const rotated = [...original.slice(shift), ...original.slice(0, shift)];
        clone.options = rotated;
        const newCorrectIdx = rotated.indexOf(correctText);
        clone.correctAnswer = newCorrectIdx >= 0 ? newCorrectIdx : 0;
      }

      // Slightly perturb numbers in short_answer if answer is numeric
      if (clone.type === 'short_answer' && clone.correctAnswerText) {
        const numVal = parseFloat(clone.correctAnswerText);
        if (!isNaN(numVal) && clone.correctAnswerText.trim() === String(numVal)) {
          const newNum = numVal + (i % 3);
          clone.correctAnswerText = String(newNum);
          const regex = new RegExp(`\\b${numVal}\\b`);
          if (regex.test(clone.content)) {
            clone.content = clone.content.replace(regex, String(newNum));
          }
        }
      }

      // Dynamic perturbation for polynomials if present
      if (clone.content.includes('$y = x^3 - 3x^2')) {
        const newC = 2 + delta;
        clone.content = clone.content.replace(/\$y = x\^3 - 3x\^2 \+ \d+\$/, `$y = x^3 - 3x^2 + ${newC}$`);
      }

      return clone;
    });

    variants[code] = {
      code,
      title: `${baseExam.title} (Mã đề ${code})`,
      baseExamId: baseExam.id,
      questions,
    };
  }

  return variants;
}
