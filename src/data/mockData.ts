import { Student, Lesson, Exam, Submission, GradebookRecord, LeaderboardUser, ClassRoom, TeacherProfile, ExamComplaint } from '../types';

export const INITIAL_TEACHER: TeacherProfile = {
  id: 'teacher-1',
  name: 'Thầy Trịnh Tuấn Kiệt',
  email: 'tuankiet.toan@edusmart.edu.vn',
  username: 'tuankiet',
  phone: '0908123456',
  schoolName: 'THPT Võ Thị Sáu',
  subject: 'Toán học THPT (GDPT 2018)',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
  createdAt: '2026-09-01T08:00:00Z',
};

export const INITIAL_CLASSES: ClassRoom[] = [];

const VIETNAMESE_NAME_PRESETS = [
  { hoVaChuLot: 'Trần Thái', ten: 'An', gender: 'Nam' },
  { hoVaChuLot: 'Ngô Thị Lan', ten: 'Anh', gender: 'Nữ' },
  { hoVaChuLot: 'Nguyễn Trần Lan', ten: 'Anh', gender: 'Nữ' },
  { hoVaChuLot: 'Trần Phan Văn', ten: 'Có', gender: 'Nam' },
  { hoVaChuLot: 'Huỳnh Ngọc Kim', ten: 'Yến', gender: 'Nữ' },
  { hoVaChuLot: 'Lê Minh', ten: 'Bảo', gender: 'Nam' },
  { hoVaChuLot: 'Phạm Đức', ten: 'Cường', gender: 'Nam' },
  { hoVaChuLot: 'Đỗ Thùy', ten: 'Dương', gender: 'Nữ' },
  { hoVaChuLot: 'Vũ Hoàng', ten: 'Duy', gender: 'Nam' },
  { hoVaChuLot: 'Bùi Gia', ten: 'Hân', gender: 'Nữ' },
  { hoVaChuLot: 'Dương Quốc', ten: 'Huy', gender: 'Nam' },
  { hoVaChuLot: 'Nguyễn Đình', ten: 'Khôi', gender: 'Nam' },
  { hoVaChuLot: 'Hoàng Nhật', ten: 'Linh', gender: 'Nữ' },
  { hoVaChuLot: 'Trịnh Tuấn', ten: 'Minh', gender: 'Nam' },
  { hoVaChuLot: 'Đặng Thảo', ten: 'Nguyên', gender: 'Nữ' },
  { hoVaChuLot: 'Phan Trọng', ten: 'Nhân', gender: 'Nam' },
  { hoVaChuLot: 'Mai Thanh', ten: 'Phong', gender: 'Nam' },
  { hoVaChuLot: 'Lý Hồng', ten: 'Phúc', gender: 'Nam' },
  { hoVaChuLot: 'Cao Như', ten: 'Quỳnh', gender: 'Nữ' },
  { hoVaChuLot: 'Trương Ngọc', ten: 'Sơn', gender: 'Nam' },
  { hoVaChuLot: 'Tạ Minh', ten: 'Tâm', gender: 'Nam' },
  { hoVaChuLot: 'Đinh Quốc', ten: 'Thắng', gender: 'Nam' },
  { hoVaChuLot: 'Đào Phương', ten: 'Thảo', gender: 'Nữ' },
  { hoVaChuLot: 'Lương Anh', ten: 'Thư', gender: 'Nữ' },
  { hoVaChuLot: 'Võ Minh', ten: 'Thuận', gender: 'Nam' },
  { hoVaChuLot: 'Hồ Cẩm', ten: 'Tiên', gender: 'Nữ' },
  { hoVaChuLot: 'Nguyễn Hữu', ten: 'Tín', gender: 'Nam' },
  { hoVaChuLot: 'Trần Bảo', ten: 'Trâm', gender: 'Nữ' },
  { hoVaChuLot: 'Lê Huyền', ten: 'Trang', gender: 'Nữ' },
  { hoVaChuLot: 'Phạm Thanh', ten: 'Trúc', gender: 'Nữ' },
  { hoVaChuLot: 'Ngô Quang', ten: 'Trung', gender: 'Nam' },
  { hoVaChuLot: 'Hoàng Anh', ten: 'Tuấn', gender: 'Nam' },
  { hoVaChuLot: 'Đỗ Khánh', ten: 'Tùng', gender: 'Nam' },
  { hoVaChuLot: 'Vũ Cát', ten: 'Tường', gender: 'Nữ' },
  { hoVaChuLot: 'Bùi Kim', ten: 'Xuyến', gender: 'Nữ' },
  { hoVaChuLot: 'Dương Hải', ten: 'Yến', gender: 'Nữ' },
  { hoVaChuLot: 'Nguyễn Tấn', ten: 'Đạt', gender: 'Nam' },
  { hoVaChuLot: 'Lê Thành', ten: 'Đô', gender: 'Nam' },
  { hoVaChuLot: 'Phạm Xuân', ten: 'Đức', gender: 'Nam' },
  { hoVaChuLot: 'Trần Hữu', ten: 'Hậu', gender: 'Nam' },
  { hoVaChuLot: 'Võ Thị Bích', ten: 'Huyền', gender: 'Nữ' },
  { hoVaChuLot: 'Đặng Tuấn', ten: 'Khang', gender: 'Nam' },
  { hoVaChuLot: 'Đinh Gia', ten: 'Khiêm', gender: 'Nam' },
  { hoVaChuLot: 'Lý Diệu', ten: 'Linh', gender: 'Nữ' },
  { hoVaChuLot: 'Mai Hoàng', ten: 'Nam', gender: 'Nam' }
];

export const INITIAL_STUDENTS: Student[] = [];

export const INITIAL_LESSONS: Lesson[] = [
  {
    id: 'l1',
    chapter: 'Chương 1: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số',
    title: 'Tiết 1: Tính đơn điệu của hàm số',
    order: 1,
    durationMinutes: 45,
    isLocked: false,
    videoUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk',
    videoType: 'youtube',
    overview: 'Nắm vững định lý mở rộng về dấu của đạo hàm cấp một f\'(x). Xác định chính xác các khoảng đồng biến, nghịch biến của hàm số đa thức và hàm phân thức bậc nhất.',
    learningOutcomes: [
      'Tìm tập xác định và đạo hàm cấp 1 f\'(x).',
      'Lập bảng xét dấu đạo hàm f\'(x) chuẩn xác.',
      'Kết luận khoảng đồng biến (f\'(x) >= 0) và nghịch biến (f\'(x) <= 0).'
    ],
    interactiveQuestions: [
      {
        prompt: 'Nếu hàm số f(x) có f\'(x) > 0 với mọi x thuộc khoảng (a; b) thì f(x) biến thiên như thế nào?',
        answerKey: 'Hàm số đồng biến trên khoảng (a; b).'
      },
      {
        prompt: 'Nêu sự khác nhau giữa f\'(x) > 0 và f\'(x) >= 0 trong định lý tính đơn điệu?',
        answerKey: 'Đạo hàm f\'(x) >= 0 vẫn đồng biến nếu dấu bằng chỉ xảy ra tại hữu hạn điểm.'
      }
    ],
    reinforcementQuiz: [
      {
        id: 'rq1',
        question: 'Cho hàm số y = -x^3 + 3x^2 - 1. Hàm số nghịch biến trên khoảng nào sau đây?',
        options: ['(0; 2)', '(-∞; 0) và (2; +∞)', '(-∞; 2)', '(2; +∞)'],
        correctIndex: 1,
        explanation: 'Ta có y\' = -3x^2 + 6x = -3x(x - 2). Cho y\' = 0 <=> x = 0 hoặc x = 2. Trong khoảng (0; 2) đạo hàm mang dấu dương (+), ngoài khoảng trái dấu đạo hàm âm (-). Do đó hàm số nghịch biến trên (-∞; 0) và (2; +∞).',
        xpReward: 50
      },
      {
        id: 'rq2',
        question: 'Cho hàm số y = (x - 2)/(x + 1). Khẳng định nào sau đây là ĐÚNG?',
        options: [
          'Hàm số đồng biến trên R \\ {-1}',
          'Hàm số nghịch biến trên (-∞; -1) và (-1; +∞)',
          'Hàm số đồng biến trên từng khoảng xác định (-∞; -1) và (-1; +∞)',
          'Hàm số đồng biến trên R'
        ],
        correctIndex: 2,
        explanation: 'TXĐ: D = R \\ {-1}. Ta có y\' = (1.1 - (-2).1)/(x + 1)^2 = 3/(x + 1)^2 > 0 với mọi x != -1. Do đó hàm số đồng biến trên từng khoảng (-∞; -1) và (-1; +∞). Chú ý không được dùng kí hiệu hợp hoặc dấu trừ tập hợp.',
        xpReward: 50
      },
      {
        id: 'rq3',
        question: 'Tìm tất cả các giá trị thực của tham số m để hàm số y = x^3 - 3mx^2 + 3(2m - 1)x + 1 đồng biến trên R.',
        options: ['m = 1', 'm <= 1', 'm >= 1', 'Mọi m thuộc R'],
        correctIndex: 0,
        explanation: 'y\' = 3x^2 - 6mx + 3(2m - 1). Hàm số đồng biến trên R <=> y\' >= 0 với mọi x <=> Delta\' = 9m^2 - 9(2m - 1) <= 0 <=> 9(m - 1)^2 <= 0 <=> m = 1.',
        xpReward: 100
      }
    ]
  },
  {
    id: 'l2',
    chapter: 'Chương 1: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số',
    title: 'Tiết 2: Cực trị của hàm số',
    order: 2,
    durationMinutes: 45,
    isLocked: false,
    videoUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk',
    videoType: 'youtube',
    overview: 'Khái niệm điểm cực đại, điểm cực tiểu, giá trị cực trị của hàm số. Áp dụng quy tắc 1 (bảng biến thiên) và quy tắc 2 (đạo hàm cấp 2) để tìm cực trị hàm số.',
    learningOutcomes: [
      'Phân biệt điểm cực trị của hàm số (x_0), điểm cực trị của đồ thị (x_0, y_0) và giá trị cực trị (y_0).',
      'Sử dụng thành thạo điều kiện cần và điều kiện đủ của cực trị.',
      'Giải quyết các bài toán chứa tham số m về số lượng điểm cực trị.'
    ],
    interactiveQuestions: [
      {
        prompt: 'Nếu f\'(x_0) = 0 và f\'\'(x_0) < 0 thì x_0 là điểm gì của hàm số?',
        answerKey: 'x_0 là điểm cực đại của hàm số.'
      }
    ],
    reinforcementQuiz: [
      {
        id: 'rq2_1',
        question: 'Hàm số y = x^4 - 2x^2 + 3 có bao nhiêu điểm cực trị?',
        options: ['1 điểm', '2 điểm', '3 điểm', '0 điểm'],
        correctIndex: 2,
        explanation: 'y\' = 4x^3 - 4x = 4x(x^2 - 1) = 0 <=> x = 0, x = 1, x = -1. Vì y\' đổi dấu qua 3 nghiệm đơn nên hàm số có đúng 3 điểm cực trị.',
        xpReward: 50
      },
      {
        id: 'rq2_2',
        question: 'Điểm cực đại của đồ thị hàm số y = -x^3 + 3x - 2 là:',
        options: ['(1; 0)', '(-1; -4)', 'x = 1', 'y = 0'],
        correctIndex: 0,
        explanation: 'y\' = -3x^2 + 3 = 0 <=> x = +-1. Qua x = 1, y\' đổi dấu từ dương sang âm nên x = 1 là điểm cực đại của hàm số. Tọa độ điểm cực đại của đồ thị là (1; y(1)) = (1; 0).',
        xpReward: 50
      }
    ]
  },
  {
    id: 'l3',
    chapter: 'Chương 1: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số',
    title: 'Tiết 3: Giá trị lớn nhất và nhỏ nhất của hàm số',
    order: 3,
    durationMinutes: 45,
    isLocked: false,
    videoUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk',
    videoType: 'youtube',
    overview: 'Định nghĩa max, min của hàm số trên một tập hợp. Phương pháp tìm max, min trên đoạn [a; b] không cần lập bảng biến thiên và các bài toán tối ưu hóa thực tế đời sống.',
    learningOutcomes: [
      'Tìm max f(x), min f(x) trên đoạn [a; b] bằng cách tính giá trị tại các điểm dừng và mút.',
      'Ứng dụng khảo sát bài toán thực tế: Tối ưu chi phí sản xuất, kích thước hình học lớn nhất.'
    ],
    reinforcementQuiz: [
      {
        id: 'rq3_1',
        question: 'Giá trị nhỏ nhất của hàm số f(x) = x^3 - 3x + 5 trên đoạn [0; 2] là:',
        options: ['3', '5', '7', '1'],
        correctIndex: 0,
        explanation: 'f\'(x) = 3x^2 - 3 = 0 <=> x = 1 (thuộc [0; 2]) hoặc x = -1 (loại). Ta có f(0) = 5; f(1) = 3; f(2) = 7. Vậy min = 3 tại x = 1.',
        xpReward: 50
      }
    ]
  },
  {
    id: 'l4',
    chapter: 'Chương 1: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số',
    title: 'Tiết 4: Đường tiệm cận của đồ thị hàm số',
    order: 4,
    durationMinutes: 45,
    isLocked: true,
    videoUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk',
    videoType: 'youtube',
    overview: 'Định nghĩa tiệm cận đứng, tiệm cận ngang và tiệm cận xiên. Kỹ năng bấm máy tính và phân tích giới hạn lim khi x tiến tới vô cực hoặc điểm gián đoạn.',
    learningOutcomes: [
      'Xác định nhanh số đường tiệm cận của đồ thị hàm số phân thức hữu tỉ.',
      'Đọc đồ thị và bảng biến thiên để suy ra tiệm cận.'
    ],
    reinforcementQuiz: []
  },
  {
    id: 'l5',
    chapter: 'Chương 1: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số',
    title: 'Tiết 5: Khảo sát sự biến thiên và vẽ đồ thị hàm số',
    order: 5,
    durationMinutes: 90,
    isLocked: true,
    videoUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk',
    videoType: 'youtube',
    overview: 'Quy trình tổng quát 3 bước khảo sát hàm bậc ba, hàm trùng phương và hàm nhất biến. Biện luận số nghiệm phương trình bằng phương pháp đồ thị.',
    learningOutcomes: [
      'Vẽ thành thạo các dạng đồ thị hàm số chuẩn.',
      'Vận dụng tương giao đồ thị để giải quyết bài toán tham số.'
    ],
    reinforcementQuiz: []
  }
];

// Helper to generate isomorphic variants for all 45 students with 3 complete parts
export function buildDefaultVariants(baseExamId: string, count: number = 45): Record<string, any> {
  const variants: Record<string, any> = {};

  for (let i = 0; i < count; i++) {
    const code = String(101 + i);
    const delta = (i % 6) - 2; // -2, -1, 0, 1, 2, 3
    const a = 2 + (i % 3);
    const c = 2 + delta;
    const intervalMax = 2 + (i % 2);

    variants[code] = {
      code,
      title: `Kiểm tra ĐTX1 - Khảo sát Hàm số & Thống kê (Mã đề ${code})`,
      baseExamId,
      questions: [
        // --- PHẦN I: TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN (A, B, C, D) ---
        {
          id: `code-${code}-q1`,
          type: 'multiple_choice',
          partNumber: 1,
          sectionTitle: 'Phần I: Câu hỏi Trắc nghiệm nhiều phương án lựa chọn',
          content: `Cho đồ thị hàm số $y = x^3 - 3x^2 + ${c}$ trong hệ trục tọa độ $Oxy$ như hình vẽ bên dưới. Tọa độ điểm cực tiểu của đồ thị hàm số là:`,
          difficulty: 'NB',
          points: 1.0,
          stimulus: {
            type: 'graph',
            data: `y = x^3 - 3x^2 + ${c}`,
            caption: `Hình 1. Đồ thị hàm số bậc 3 tương ứng Mã đề #${code}`
          },
          options: [
            `A. $(2; ${c - 4})$`,
            `B. $(0; ${c})$`,
            `C. $(2; ${c})$`,
            `D. $(0; ${c - 4})$`
          ],
          correctAnswer: 0,
          explanation: `Quan sát đồ thị hàm số, tại điểm có hoành độ $x = 2$, đồ thị đạt cực tiểu với tung độ $y(2) = 2^3 - 3(2^2) + ${c} = ${c - 4}$. Tọa độ điểm cực tiểu là $(2; ${c - 4})$.`
        },
        {
          id: `code-${code}-q2`,
          type: 'multiple_choice',
          partNumber: 1,
          sectionTitle: 'Phần I: Câu hỏi Trắc nghiệm nhiều phương án lựa chọn',
          content: `Cho hàm số $y = f(x)$ có bảng biến thiên như hình bên dưới. Khẳng định nào sau đây là ĐÚNG?`,
          difficulty: 'NB',
          points: 1.0,
          stimulus: {
            type: 'variation_table',
            data: `cubic`,
            caption: `Bảng biến thiên hàm số f(x) cho Mã đề #${code}`
          },
          options: [
            'A. Hàm số đồng biến trên các khoảng $(-\\infty; 0)$ và $(2; +\\infty)$',
            'B. Hàm số nghịch biến trên khoảng $(0; +\\infty)$',
            'C. Hàm số đồng biến trên khoảng $(0; 2)$',
            'D. Giá trị cực đại của hàm số bằng 0'
          ],
          correctAnswer: 0,
          explanation: `Dựa vào hàng $y'$ trong bảng biến thiên: $y' > 0$ trên $(-\\infty; 0)$ và $(2; +\\infty)$, do đó hàm số đồng biến trên các khoảng $(-\\infty; 0)$ và $(2; +\\infty)$.`
        },
        {
          id: `code-${code}-q3`,
          type: 'multiple_choice',
          partNumber: 1,
          sectionTitle: 'Phần I: Câu hỏi Trắc nghiệm nhiều phương án lựa chọn',
          content: `Cho góc lượng giác $\\alpha$ thỏa mãn $\\tan \\alpha = 3$ với $0 < \\alpha < \\frac{\\pi}{2}$. Giá trị của $\\cot \\alpha$ và chu kỳ tuần hoàn $T$ của hàm số $y = \\cos(2x)$ lần lượt là:`,
          difficulty: 'TH',
          points: 1.0,
          options: [
            'A. $\\cot \\alpha = \\frac{1}{3}$ và $T = \\pi$',
            'B. $\\cot \\alpha = 3$ và $T = 2\\pi$',
            'C. $\\cot \\alpha = \\frac{1}{3}$ và $T = 2\\pi$',
            'D. $\\cot \\alpha = -\\frac{1}{3}$ và $T = \\pi$'
          ],
          correctAnswer: 0,
          explanation: `Ta có $\\cot \\alpha = \\frac{1}{\\tan \\alpha} = \\frac{1}{3}$. Hàm số $y = \\cos(2x)$ có chu kỳ tuần hoàn là $T = \\frac{2\\pi}{|2|} = \\pi$. Do đó phương án A là chính xác.`
        },

        // --- PHẦN II: TRẮC NGHIỆM ĐÚNG / SAI (GỒM 4 Ý a, b, c, d) ---
        {
          id: `code-${code}-q4`,
          type: 'true_false',
          partNumber: 2,
          sectionTitle: 'Phần II: Câu hỏi Trắc nghiệm Đúng / Sai',
          content: `Cho hàm số $f(x) = x^3 - 3x + ${c}$ có bảng xét dấu đạo hàm $f'(x)$ như hình vẽ. Xét tính Đúng hoặc Sai của các khẳng định sau:`,
          difficulty: 'TH',
          points: 4.0,
          stimulus: {
            type: 'sign_table',
            caption: `Bảng xét dấu đạo hàm f'(x) cho Mã đề #${code}`
          },
          trueFalseItems: [
            {
              id: 'a',
              label: 'a)',
              content: `Hàm số $f(x)$ nghịch biến trên khoảng $(-1; 1)$.`,
              correctAnswer: true,
              explanation: `Từ bảng xét dấu, $f'(x) < 0$ với mọi $x \\in (-1; 1)$ nên hàm số nghịch biến trên khoảng $(-1; 1)$. Khẳng định ĐÚNG.`
            },
            {
              id: 'b',
              label: 'b)',
              content: `Điểm cực đại của đồ thị hàm số là $(1; ${c - 2})$.`,
              correctAnswer: false,
              explanation: `Điểm cực đại của hàm số là $x = -1$ với $f(-1) = ${c + 2}$, điểm $(1; ${c - 2})$ là điểm cực tiểu. Khẳng định SAI.`
            },
            {
              id: 'c',
              label: 'c)',
              content: `Hàm số $f(x)$ đạt cực trị tại 2 điểm phân biệt $x_1 = -1$ và $x_2 = 1$.`,
              correctAnswer: true,
              explanation: `Đạo hàm $f'(x) = 3x^2 - 3 = 0 \\iff x = \\pm 1$ và đổi dấu qua cả hai nghiệm nên có 2 điểm cực trị. Khẳng định ĐÚNG.`
            },
            {
              id: 'd',
              label: 'd)',
              content: `Giá trị nhỏ nhất của hàm số trên đoạn $[0; 2]$ bằng ${c - 2}$.`,
              correctAnswer: true,
              explanation: `Trên đoạn $[0; 2]$, $f(0) = ${c}, f(1) = ${c - 2}, f(2) = ${c + 2}$. Vậy $\\min_{[0; 2]} f(x) = ${c - 2}$. Khẳng định ĐÚNG.`
            }
          ],
          explanation: `Barem Đúng / Sai Phần II: a) Đúng, b) Sai, c) Đúng, d) Đúng.`
        },

        // --- PHẦN III: TRẢ LỜI NGẮN / TỰ LUẬN ---
        {
          id: `code-${code}-q5`,
          type: 'short_answer',
          partNumber: 3,
          sectionTitle: 'Phần III: Câu hỏi Trả lời ngắn / Tự luận',
          content: `Bảng thống kê ghép nhóm bên dưới ghi lại thời gian tự học (phút/ngày) của các học sinh. Hãy tính số trung bình đại diện $\\bar{x}$ của mẫu số liệu ghép nhóm này (làm tròn đến hàng phần mười).`,
          difficulty: 'VD',
          points: 1.5,
          stimulus: {
            type: 'statistics',
            caption: `Bảng thống kê ghép nhóm thời gian tự học - Mã đề #${code}`
          },
          correctAnswerText: '62.7',
          explanation: `Cỡ mẫu $n = 5 + 12 + 18 + 8 + 2 = 45$. Số trung bình $\\bar{x} = \\frac{5 \\times 45 + 12 \\times 55 + 18 \\times 65 + 8 \\times 75 + 2 \\times 85}{45} = \\frac{2825}{45} \\approx 62.78$. Làm tròn đến hàng phần mười được 62.7 (hoặc 62.8).`
        },
        {
          id: `code-${code}-q6`,
          type: 'essay',
          partNumber: 3,
          sectionTitle: 'Phần III: Câu hỏi Trả lời ngắn / Tự luận',
          content: `Một người nông dân muốn rào một khu vườn hình chữ nhật có một cạnh giáp bờ tường thẳng (không cần rào cạnh này). Tổng chiều dài lưới rào có sẵn là ${100 + i * 4} mét. Hãy lập hàm số tính diện tích khu vườn theo chiều rộng $x$, tìm $x$ để diện tích khu vườn đạt giá trị lớn nhất và tính diện tích lớn nhất đó. (Học sinh giải chi tiết trên giấy rồi chụp ảnh bài làm để nộp).`,
          difficulty: 'VDC',
          points: 1.5,
          rubric: `Điểm tối đa: 1.5 điểm.
- Bước 1 (0.5đ): Gọi $x$ (m) là chiều rộng ($0 < x < ${50 + i * 2}$). Chiều dài cạnh song song bờ tường là $L = ${100 + i * 4} - 2x$.
- Bước 2 (0.5đ): Lập hàm diện tích $S(x) = x(${100 + i * 4} - 2x) = -2x^2 + (${100 + i * 4})x$. Tính đạo hàm $S'(x) = -4x + (${100 + i * 4}) = 0 \\iff x = ${(100 + i * 4) / 4}$.
- Bước 3 (0.5đ): Lập luận hoặc bảng biến thiên kết luận hàm đạt cực đại tại $x = ${(100 + i * 4) / 4}$ m và diện tích lớn nhất $S_{\\max} = ${(100 + i * 4) / 4 * ((100 + i * 4) / 2)} \\text{ m}^2$.`,
          explanation: `Lời giải chuẩn SGK GDPT 2018 (Đáp án chuẩn):
1. Gọi $x$ (m) là chiều rộng của khu vườn, điều kiện $0 < x < ${50 + i * 2}$. Chiều dài cạnh song song bờ tường là $L = ${100 + i * 4} - 2x$ (m).
2. Diện tích khu vườn theo $x$ là: $S(x) = x \\cdot L = x(${100 + i * 4} - 2x) = -2x^2 + ${100 + i * 4}x$ (m²).
3. Tính đạo hàm: $S'(x) = -4x + ${100 + i * 4}$. Cho $S'(x) = 0 \\iff x = ${(100 + i * 4) / 4}$ (thỏa mãn điều kiện).
4. Khảo sát cực trị: Vì hệ số $a = -2 < 0$, đồ thị hàm số là parabol có bề lõm quay xuống dưới, do đó $S(x)$ đạt giá trị lớn nhất tại $x = ${(100 + i * 4) / 4}$ m.
Diện tích lớn nhất cần tìm là $S_{\\max} = S(${(100 + i * 4) / 4}$) = ${(100 + i * 4) / 4 * ((100 + i * 4) / 2)} \\text{ m}^2$.`
        }
      ]
    };
  }

  return variants;
}

const defaultVariantsMap = buildDefaultVariants('exam-1', 45);
const defaultAssignedCodes: Record<string, string> = {};
for (let i = 1; i <= 45; i++) {
  const pad = String(i).padStart(2, '0');
  defaultAssignedCodes[`st-${pad}`] = String(100 + i);
}

export const INITIAL_EXAM: Exam = {
  id: 'exam-1',
  title: 'Kiểm tra ĐTX1 - Khảo sát Sự biến thiên và Đồ thị Hàm số (Chuẩn GDPT 2018 - 3 Phần)',
  subject: 'Toán học 12',
  gradeColumn: 'DTX1',
  durationMinutes: 45,
  isPublished: true,
  dueDate: '2026-10-30T23:59:59Z',
  totalPoints: 10,
  createdAt: '2026-09-10T08:00:00Z',
  questions: defaultVariantsMap['101'] ? defaultVariantsMap['101'].questions : [],
  variants: defaultVariantsMap,
  assignedCodes: defaultAssignedCodes,
  targetAssignment: {
    type: 'class',
    targetClassId: 'class-11a1',
    targetClassName: '11A1',
    studentIds: Array.from({ length: 45 }, (_, i) => `st-${String(i + 1).padStart(2, '0')}`),
    assignedAt: '2026-09-10T08:00:00Z',
    dueDate: '2026-10-30T23:59:59Z',
  },
};

export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-st-01-initial',
    examId: 'exam-1',
    examTitle: 'Kiểm tra ĐTX1 - Khảo sát Sự biến thiên và Đồ thị Hàm số (Chuẩn GDPT 2018 - 3 Phần)',
    studentId: 'st-01',
    studentName: 'Trần Thái An',
    studentAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80',
    variantCode: '101',
    submittedAt: '2026-09-12T09:15:00Z',
    violationsCount: 0,
    violationLogs: [],
    mcqScore: 7.0,
    essayScore: 1.25,
    totalScore: 8.25,
    status: 'ai_graded',
    answers: {
      'code-101-q1': { questionId: 'code-101-q1', type: 'multiple_choice', value: 0 },
      'code-101-q2': { questionId: 'code-101-q2', type: 'multiple_choice', value: 0 },
      'code-101-q3': { questionId: 'code-101-q3', type: 'true_false', value: { 'tf-1': true, 'tf-2': false, 'tf-3': true, 'tf-4': false } },
      'code-101-q4': { questionId: 'code-101-q4', type: 'short_answer', value: '2' },
      'code-101-q5': { questionId: 'code-101-q5', type: 'short_answer', value: '62.7' },
      'code-101-q6': {
        questionId: 'code-101-q6',
        type: 'essay',
        value: `Gọi x (m) là chiều rộng của mảnh vườn chữ nhật (đk: 0 < x < 50).
Do một cạnh giáp bờ tường nên chiều dài là L = 100 - 2x (m).
Diện tích mảnh vườn là: S(x) = x * (100 - 2x) = -2x^2 + 100x (m2).
Lấy đạo hàm: S'(x) = -4x + 100.
Cho S'(x) = 0 <=> -4x = -100 <=> x = 25 (thỏa mãn điều kiện).
Vì hệ số a = -2 < 0 nên đồ thị hàm số đạt cực đại tại x = 25.
Vậy diện tích lớn nhất là S_max = S(25) = 25 * 50 = 1250 (m2).`,
        images: ['https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80']
      }
    },
    essayGrading: {
      score: 1.25,
      maxPoints: 1.5,
      percentage: 83.3,
      comparisonWithKey: 'Đối chiếu với đáp án chuẩn SGK: Bài làm đạt 83.3% yêu cầu chuẩn. Thí sinh đặt ẩn và điều kiện đúng (0 < x < 50), lập hàm diện tích S(x) = -2x^2 + 100x chính xác, tính đạo hàm S\'(x) = -4x + 100 và giải tìm nghiệm x = 25 chuẩn xác. Phần lập luận cực đại có nêu tính chất parabol nhưng chưa vẽ bảng biến thiên đầy đủ theo mẫu chuẩn.',
      detailedComment: 'Em đã hiểu rất đúng bản chất bài toán khảo sát cực trị và bám sát các bước của đáp án chuẩn SGK. Đạo hàm và nghiệm x = 25 hoàn toàn chính xác. Để đạt điểm tối đa, em cần bổ sung thêm bảng biến thiên ngắn gọn theo mẫu SGK để khẳng định giá trị lớn nhất.',
      teacherRemarks: 'Bài làm tốt, tư duy toán học mạch lạc và bám sát đáp án chuẩn. Cần vẽ bảng biến thiên đầy đủ hơn.',
      breakdown: [
        { criterion: 'Điều kiện xác định & Thiết lập mô hình bài toán', score: 0.5, maxScore: 0.5, comment: 'Nêu đúng điều kiện và biểu diễn hàm diện tích chuẩn xác.' },
        { criterion: 'Các bước biến đổi đạo hàm & Khảo sát cực trị', score: 0.5, maxScore: 0.5, comment: 'Tính đúng đạo hàm S\'(x) và tìm nghiệm cực trị chính xác.' },
        { criterion: 'Đối chiếu điều kiện & Kết luận đáp số bài toán', score: 0.25, maxScore: 0.5, comment: 'Tìm đúng giá trị x = 25 và S_max = 1250 m², cần vẽ bảng biến thiên hoàn chỉnh.' }
      ],
      strengths: [
        'Nắm vững phương pháp thiết lập hàm số tối ưu',
        'Tính đạo hàm chính xác và giải tìm nghiệm chuẩn xác'
      ],
      weaknesses: [
        'Thiếu bảng biến thiên hoàn chỉnh để khẳng định điểm cực đại'
      ],
      suggestions: [
        'Luôn vẽ nhanh bảng biến thiên để khẳng định giá trị lớn nhất',
        'Ghi chú rõ ràng đơn vị đo thực tế ở câu kết luận'
      ],
      source: 'gemini_vision'
    }
  },
  {
    id: 'sub-st-02-initial',
    examId: 'exam-1',
    examTitle: 'Kiểm tra ĐTX1 - Khảo sát Sự biến thiên và Đồ thị Hàm số (Chuẩn GDPT 2018 - 3 Phần)',
    studentId: 'st-02',
    studentName: 'Ngô Thị Lan Anh',
    studentAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80',
    variantCode: '102',
    submittedAt: '2026-09-12T09:20:00Z',
    violationsCount: 0,
    violationLogs: [],
    mcqScore: 7.5,
    essayScore: 0,
    totalScore: 7.5,
    status: 'pending_ai',
    answers: {
      'code-102-q1': { questionId: 'code-102-q1', type: 'multiple_choice', value: 0 },
      'code-102-q2': { questionId: 'code-102-q2', type: 'multiple_choice', value: 0 },
      'code-102-q3': { questionId: 'code-102-q3', type: 'true_false', value: { 'tf-1': true, 'tf-2': false, 'tf-3': true, 'tf-4': false } },
      'code-102-q4': { questionId: 'code-102-q4', type: 'short_answer', value: '2' },
      'code-102-q5': { questionId: 'code-102-q5', type: 'short_answer', value: '62.7' },
      'code-102-q6': {
        questionId: 'code-102-q6',
        type: 'essay',
        value: `Gọi x là chiều rộng hình chữ nhật. Chiều dài là 104 - 2x.
Diện tích là S = x*(104 - 2x) = -2x^2 + 104x.
Đạo hàm: S' = -4x + 104 = 0 => x = 26.
Diện tích lớn nhất là S(26) = 26 * 52 = 1352 m2.`,
        images: ['https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80']
      }
    }
  }
];

export const INITIAL_GRADEBOOK: GradebookRecord[] = [];

export const INITIAL_COMPLAINTS: ExamComplaint[] = [
  {
    id: 'complaint-demo-1',
    submissionId: 'sub-st-01-initial',
    examId: 'exam-1',
    examTitle: 'Kiểm tra ĐTX1 - Khảo sát Sự biến thiên và Đồ thị Hàm số (Chuẩn GDPT 2018 - 3 Phần)',
    studentId: 'st-01',
    studentName: 'Trần Thái An',
    studentAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80',
    className: '11A1',
    variantCode: '101',
    createdAt: '2026-09-12T10:30:00Z',
    questionId: 'code-101-q6',
    questionNumber: 'Câu 6 (Tự luận)',
    questionType: 'essay',
    complaintReason: 'Em đã lập luận parabol có bề lõm quay xuống dưới (hệ số a = -2 < 0) nên đạt GTLN tại đỉnh x = 25. Em xin Thầy xem xét chấm thêm 0.25 điểm cho bước giải thích này.',
    studentEvidence: 'Theo tính chất hàm bậc hai ở lớp 10, đỉnh parabol I(25; 1250) là điểm cực đại và cũng là GTLN trên R nên không nhất thiết phải vẽ lại toàn bộ bảng biến thiên.',
    status: 'pending',
    originalScore: 8.25,
  }
];

