import React from 'react';
import katex from 'katex';

interface MathTextProps {
  content: string;
  className?: string;
  inline?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Normalizes an internal math expression to standard LaTeX commands.
 * Handles Greek letters (pi, alpha, beta...), fractions, roots, limits, powers,
 * trig functions, number sets, and standard SGK notations.
 */
export function normalizeMathExpression(math: string): string {
  if (!math) return '';
  let m = math.trim();

  // 1. Greek letters & Constants - Special care for PI
  // Handle Unicode π directly
  m = m.replace(/π/g, '\\pi ');

  // Handle forms of pi like 2pi, 3pi, kpi, k2pi, 2kpi, pi/2, -pi, +pi
  m = m.replace(/(?<![a-zA-Z\\])(2k|k2|k|\d+)?\s*pi(?![a-zA-Z])/gi, (_match, prefix) => {
    if (prefix) {
      return `${prefix}\\pi `;
    }
    return '\\pi ';
  });

  // Other standard Greek letters
  m = m.replace(/(?<![a-zA-Z\\])alpha(?![a-zA-Z])/g, '\\alpha ');
  m = m.replace(/(?<![a-zA-Z\\])beta(?![a-zA-Z])/g, '\\beta ');
  m = m.replace(/(?<![a-zA-Z\\])gamma(?![a-zA-Z])/g, '\\gamma ');
  m = m.replace(/(?<![a-zA-Z\\])theta(?![a-zA-Z])/g, '\\theta ');
  m = m.replace(/(?<![a-zA-Z\\])omega(?![a-zA-Z])/g, '\\omega ');
  m = m.replace(/(?<![a-zA-Z\\])Delta(?![a-zA-Z])/g, '\\Delta ');
  m = m.replace(/(?<![a-zA-Z\\])delta(?![a-zA-Z])/g, '\\delta ');
  m = m.replace(/(?<![a-zA-Z\\])phi(?![a-zA-Z])/g, '\\varphi ');
  m = m.replace(/(?<![a-zA-Z\\])sigma(?![a-zA-Z])/g, '\\sigma ');
  m = m.replace(/(?<![a-zA-Z\\])lambda(?![a-zA-Z])/g, '\\lambda ');
  m = m.replace(/(?<![a-zA-Z\\])mu(?![a-zA-Z])/g, '\\mu ');

  // 2. Number sets (R, N, Z, Q) and Set operations
  // Clean up any repeated or malformed backslashes / setminus like \backslash\backslash\backslash or \ \ \
  m = m.replace(/\\(?:setminus|backslash)\s*(?:\\(?:setminus|backslash))+/g, '\\setminus ');
  m = m.replace(/\\backslash\b/g, '\\setminus');
  m = m.replace(/(\\mathbb\{[RNZQ]\}|\b[RNZQ]\b)\s*(?:\\setminus|\/|\\+)\s*\\?\{/g, '$1 \\setminus \\{');

  // Repair unbalanced escaped set braces \{ ... } -> \{ ... \}
  const openEscapedBraces = (m.match(/\\\{/g) || []).length;
  const closeEscapedBraces = (m.match(/\\\}/g) || []).length;
  if (openEscapedBraces > closeEscapedBraces) {
    const diff = openEscapedBraces - closeEscapedBraces;
    for (let i = 0; i < diff; i++) {
      const lastUnescapedBrace = m.lastIndexOf('}');
      if (lastUnescapedBrace !== -1 && (lastUnescapedBrace === 0 || m[lastUnescapedBrace - 1] !== '\\')) {
        m = m.substring(0, lastUnescapedBrace) + '\\}' + m.substring(lastUnescapedBrace + 1);
      } else {
        m += '\\}';
      }
    }
  }

  m = m.replace(/(?<!\\mathbb\{)(?<![a-zA-Z\\])\b(R)\b(?![a-zA-Z])/g, '\\mathbb{R}');
  m = m.replace(/(?<!\\mathbb\{)(?<![a-zA-Z\\])\b(N)\b(?![a-zA-Z])/g, '\\mathbb{N}');
  m = m.replace(/(?<!\\mathbb\{)(?<![a-zA-Z\\])\b(Z)\b(?![a-zA-Z])/g, '\\mathbb{Z}');
  m = m.replace(/(?<!\\mathbb\{)(?<![a-zA-Z\\])\b(Q)\b(?![a-zA-Z])/g, '\\mathbb{Q}');

  // Normalize "k thuộc Z", "k in Z", "k \in Z" -> "k \in \mathbb{Z}"
  m = m.replace(/\(\s*k\s*(?:\\in|in|thuộc)\s*(?:\\mathbb\{Z\}|Z)\s*\)/gi, '(k \\in \\mathbb{Z})');
  m = m.replace(/(?<!\()\bk\s*(?:\\in|in|thuộc)\s*(?:\\mathbb\{Z\}|Z)\b(?!\))/gi, 'k \\in \\mathbb{Z}');

  // Automatic domain enhancement for sets containing periodic terms (k\pi, k2\pi, pi/2 + k2pi)
  // Ensure "k \in \mathbb{Z}" is present as required by SGK standard
  m = m.replace(/(\\setminus\s*\\\{\s*)([^\}]+?)(\s*\\\})/g, (_full, prefix, inner, suffix) => {
    // If it contains periodic k or pi, and doesn't already have Z or \in \mathbb{Z}
    if ((/k\s*\\pi|k2\\pi|2k\\pi|k\s*pi|\bk\b/i.test(inner)) && !/\\mathbb\{Z\}|k\s*\\in/i.test(inner)) {
      const cleanInner = inner.trim().replace(/,\s*$/, '');
      return `${prefix}${cleanInner}, \\, k \\in \\mathbb{Z}${suffix}`;
    }
    return _full;
  });

  m = m.replace(/(?<!\\)\b(in|thuộc)\b/g, ' \\in ');
  m = m.replace(/(?<!\\)\b(notin|không thuộc)\b/g, ' \\notin ');

  // 3. Trigonometric and standard calculus functions
  // Powers on trig functions: sin^2(x) -> \sin^2(x)
  m = m.replace(/(?<!\\)\b(tan|cot|sin|cos)\^(\d+)/g, '\\$1^{$2}');
  m = m.replace(/(?<!\\)\b(tan|cot|sin|cos)\b/g, '\\$1 ');
  m = m.replace(/(?<!\\)\b(ln|log)\b/g, '\\$1 ');

  // Limits: lim(x->2) or lim x->+\infty
  m = m.replace(/lim\s*\(?([a-zA-Z])\s*(?:->|\\to)\s*([^\)\s]+)\)?/g, '\\lim_{$1 \\to $2}');

  // 4. Infinity symbols
  m = m.replace(/-\s*(?:oo|∞)\b/g, '-\\infty ');
  m = m.replace(/\+\s*(?:oo|∞)\b/g, '+\\infty ');
  m = m.replace(/(?<!\\)\b(?:oo|∞)\b/g, '\\infty ');

  // 5. Square roots: sqrt(10) -> \sqrt{10}, sqrt(x+1) -> \sqrt{x+1}
  m = m.replace(/(?<!\\)sqrt\(([^)]+)\)/g, '\\sqrt{$1}');
  m = m.replace(/(?<!\\)sqrt([0-9a-zA-Z])/g, '\\sqrt{$1}');

  // 6. Rational fractions: (ax+b)/(cx+d) -> \frac{ax+b}{cx+d}
  m = m.replace(/\(([^)]+)\)\s*\/\s*\(([^)]+)\)/g, '\\frac{$1}{$2}');
  m = m.replace(/\(([^)]+)\)\s*\/\s*([0-9a-zA-Z\\]+)/g, '\\frac{$1}{$2}');
  m = m.replace(/([0-9a-zA-Z\\]+)\s*\/\s*\(([^)]+)\)/g, '\\frac{$1}{$2}');

  // 7. Simple fractions: 1/3, 3/\sqrt{10}, \pi/2, 2/3, 3\pi/4
  m = m.replace(/(\\pi|\d+\\pi|[0-9a-zA-Z]+)\s*\/\s*(\\sqrt\{[^{}]+\}|\\pi|[0-9a-zA-Z]+)/g, (match, n, d) => {
    if (match.includes('\\frac')) return match;
    return `\\frac{${n}}{${d}}`;
  });

  // 8. Relational, equivalence and math operators
  m = m.replace(/<=>|<==>/g, '\\iff ');
  m = m.replace(/=>|==>/g, '\\implies ');
  m = m.replace(/<=/g, '\\le ');
  m = m.replace(/>=/g, '\\ge ');
  m = m.replace(/!=/g, '\\ne ');
  m = m.replace(/\+-/g, '\\pm ');
  m = m.replace(/\s*\*\s*/g, ' \\cdot ');

  // 9. Vectors: vec(AB) -> \vec{AB}, vec(u) -> \vec{u}
  m = m.replace(/(?<!\\)vec\(([A-Za-z]+)\)/g, '\\vec{$1}');

  // 10. Powers & Subscripts: x^2 -> x^{2}, x_0 -> x_{0}
  m = m.replace(/\^([0-9a-zA-Z]+)/g, '^{$1}');
  m = m.replace(/_([0-9a-zA-Z]+)/g, '_{$1}');

  // 11. Clean up duplicate spaces inside LaTeX commands
  m = m.replace(/\\(sin|cos|tan|cot|pi|alpha|beta|gamma|theta|omega|Delta|delta|varphi|sigma|lambda|mu|le|ge|ne|pm|infty|sqrt|frac|mathbb|setminus|in|notin|iff|implies)\s+/g, '\\$1 ');

  return m.trim();
}

const VIETNAMESE_PROSE_WORDS = new Set([
  'cho', 'xét', 'hàm', 'số', 'đồng', 'biến', 'nghịch', 'tại', 'điểm', 'tìm', 'tính',
  'đúng', 'sai', 'mệnh', 'đề', 'khẳng', 'định', 'là', 'có', 'thì', 'với', 'mọi',
  'thuộc', 'trên', 'khoảng', 'đoạn', 'nửa', 'nghiệm', 'phương', 'trình', 'bất',
  'đạo', 'cực', 'trị', 'đại', 'tiểu', 'tiệm', 'cận', 'đứng', 'ngang', 'giá', 'trị',
  'lớn', 'nhất', 'nhỏ', 'kết', 'quả', 'bằng', 'thỏa', 'mãn', 'nào', 'dưới', 'đây',
  'chọn', 'đáp', 'án', 'biết', 'rằng', 'và', 'hoặc', 'không', 'hiển', 'thị', 'trong',
  'bên', 'hình', 'vẽ', 'bảng', 'thống', 'kê', 'chu', 'kỳ', 'của', 'các', 'những',
  'đạt', 'khi', 'qua', 'giao', 'cắt', 'tiếp', 'tuyến', 'mặt', 'phẳng', 'không', 'gian',
  'sau', 'đây', 'xác', 'định', 'tổng', 'hiệu', 'tích', 'thương', 'thực', 'tế'
]);

/**
 * Checks if a string represents prose/natural language rather than a pure mathematical formula
 */
function isProseText(str: string): boolean {
  const trimmed = str.trim();
  if (!trimmed) return false;
  // Clean punctuation and check words against Vietnamese vocabulary
  const words = trimmed
    .toLowerCase()
    .replace(/[,.:;?!()[\]{}]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  return words.some((w) => VIETNAMESE_PROSE_WORDS.has(w));
}

/**
 * Checks if a string (or suffix) represents a pure mathematical formula
 */
function isPureFormula(str: string): boolean {
  const trimmed = str.trim();
  if (!trimmed) return false;
  if (isProseText(trimmed)) return false;

  // Must contain math indicators
  const hasMathTokens = /(=|<|>|<=|>=|\/|\^|_|sqrt|tan|cot|sin|cos|pi|π|\+|-|\*|\(|\)|\[|\]|\\)/i.test(trimmed);
  return hasMathTokens;
}

/**
 * Formats a plain text chunk (outside existing $...$) to wrap math formulas,
 * symbols, and intervals into standard $...$
 */
function convertPlainTextMathToLatex(plainText: string): string {
  if (!plainText) return '';
  let text = plainText;

  // 1. Leading option/item markers like "a) cot a = 1/3" or "A. x = 1"
  const itemMatch = text.match(/^([a-dA-D][\.\)])\s*(.+)$/);
  if (itemMatch) {
    const prefix = itemMatch[1];
    const rest = itemMatch[2];
    if (isPureFormula(rest)) {
      return `${prefix} $${normalizeMathExpression(rest)}$`;
    }
  }

  // 2. Entire string is a pure formula (e.g. "cot a = 1/3", "2cos x - 1 = 0", "cos 2a = -0.8")
  if (isPureFormula(text)) {
    return `$${normalizeMathExpression(text)}$`;
  }

  // Helper to apply regex replacement ONLY outside existing $...$
  const replaceOutside = (pattern: RegExp, replacer: (...args: any[]) => string) => {
    text = text
      .split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g)
      .map((part) => {
        if (part.startsWith('$')) return part;
        return part.replace(pattern, replacer);
      })
      .join('');
  };

  // 3. Trigonometric equations: "tan a = 3", "2cos x - 1 = 0", "cos 2a = -0.8"
  replaceOutside(
    /(?:(?:[-+]?\d*\s*)?(?:sin|cos|tan|cot)\s*(?:2[a-zA-Z]|[a-zA-Z]|\([a-zA-Z0-9+\-/*\s\\]+\))?(?:\s*[-+*/]\s*\d+)?\s*(?:=|<|>|<=|>=)\s*[-+]?(?:[0-9a-zA-Z/().\\]+))/g,
    (m) => `$${normalizeMathExpression(m)}$`
  );

  // 4. Standard textbook intervals: [a; b], (a; b), (1; +oo), (-oo; 2), (0; pi), [0; 2pi], [0; pi/2]
  replaceOutside(
    /((\[|\()\s*[-+]?(?:[0-9]*(?:pi|π)|[0-9]+|\\[a-zA-Z]+|\\infty|∞|oo)(?:\/[0-9]+|\.[0-9]+)?\s*;\s*[-+]?(?:[0-9]*(?:pi|π)|[0-9]+|\\[a-zA-Z]+|\\infty|∞|oo)(?:\/[0-9]+|\.[0-9]+)?\s*(\]|\)))/g,
    (m) => `$${normalizeMathExpression(m)}$`
  );

  // 5. Inequalities / Angle intervals: "0 < a < pi/2", "0 <= x <= 2pi", "a < b"
  replaceOutside(
    /\b([-+]?\d*\s*(?:<|<=)\s*[a-zA-Z]\s*(?:<|<=)\s*[-+a-zA-Z0-9/().\\π]+)\b/g,
    (m) => `$${normalizeMathExpression(m)}$`
  );

  // 6. Function definitions: "y = x^3 - 3x^2 + 2", "f(x) = (2x-1)/(x+1)", "S(x) = ..."
  replaceOutside(
    /\b((?:y|f\(x\)|g\(x\)|h\(x\)|S\(x\)|S|V|P)\s*=\s*[-+a-zA-Z0-9^/().\s\\]+?)(?=[,.:;]|\s+(?:và|hoặc|với|là|có|đạt|đồng|nghịch|trên|tại|$)|$)/g,
    (m) => `$${normalizeMathExpression(m)}$`
  );

  // 7. Derivatives: "f'(x) = 0", "y' = 0", "f'(x)", "f''(x)"
  replaceOutside(/\b([fy]'*\(x\)\s*=\s*[-+a-zA-Z0-9^/().\\]+)/g, (m) => `$${normalizeMathExpression(m)}$`);
  replaceOutside(/\b([fy]'+\(x\))\b/g, (m) => `$${normalizeMathExpression(m)}$`);

  // 8. Points and Coordinates: A(1; 2), M(0; 1; -2), I(0; 2), CĐ(0; 2), CT(2; -2)
  replaceOutside(/\b([A-Z]|CĐ|CT)\s*\(\s*[-+]?\d+\s*;\s*[-+]?\d+(?:\s*;\s*[-+]?\d+)?\s*\)/g, (m) => `$${normalizeMathExpression(m)}$` );

  // 9. Real set domains: "TXĐ: D = R \ {1}", "R \ {-1}", "D = R \ {pi/2 + kpi}", "D = R"
  replaceOutside(
    /(?:(D\s*=\s*))?(?:\\mathbb\{[RNZQ]\}|\b[RNZQ]\b)\s*(?:\\setminus|\\backslash|\\+|\/)+\s*\\?\{([^}]+)\}(?:\s*,?\s*\(?(?:k\s*(?:\\in|in|thuộc)\s*(?:\\mathbb\{Z\}|Z))\)?)?/gi,
    (_m, dPrefix, setVal) => {
      let norm = normalizeMathExpression(setVal);
      if ((/k\s*\\pi|k2\\pi|2k\\pi|k\s*pi|\bk\b/i.test(norm)) && !/\\mathbb\{Z\}/.test(norm)) {
        norm = norm.replace(/,\s*$/, '') + ', \\, k \\in \\mathbb{Z}';
      }
      const prefix = dPrefix ? 'D = ' : '';
      return `$${prefix}\\mathbb{R} \\setminus \\{${norm}\\}$`;
    }
  );
  replaceOutside(/\b(D\s*=\s*(?:\\mathbb\{R\}|R))\b(?![a-zA-Z\\])/g, () => '$D = \\mathbb{R}$');

  // 10. Pi occurrences with coefficients or fractions: "2pi", "pi/2", "x = pi", "chu kỳ T = 2pi", "số pi", "bằng pi"
  replaceOutside(/(?<![a-zA-Z\\])((?:[0-9]*k|[0-9]+)?(?:pi|π)(?:\/\d+)?|\\pi)(?![a-zA-Z])/gi, (m) => `$${normalizeMathExpression(m)}$`);

  // 11. Simple equations: "x = 1", "y = -2", "m = 1", "m <= 1"
  replaceOutside(
    /\b([a-zA-Z]\s*=\s*[-+]?(?:\\frac\{[^{}]+\}\{[^{}]+\}|\d+(?:\.\d+)?|[a-zA-Z]+))\b(?=[,.:;]|\s+là|\s+và|\s+hoặc|$)/g,
    (m) => `$${normalizeMathExpression(m)}$`
  );

  return text;
}

/**
 * Converts a raw Vietnamese question or answer text containing plain-text math
 * into standardized LaTeX segments enclosed in $...$.
 * Also normalizes existing $...$ formulas.
 */
export function formatTextbookMath(rawText: string): string {
  if (!rawText) return '';

  // If text has LaTeX delimiters, split and normalize each part appropriately
  if (rawText.includes('$')) {
    const tokens = rawText.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);
    return tokens
      .map((token) => {
        if (token.startsWith('$$') && token.endsWith('$$')) {
          const inner = token.slice(2, -2);
          return `$$${normalizeMathExpression(inner)}$$`;
        }
        if (token.startsWith('$') && token.endsWith('$')) {
          const inner = token.slice(1, -1);
          return `$${normalizeMathExpression(inner)}$`;
        }
        // Text outside dollars: convert any raw formulas / pi to LaTeX
        return convertPlainTextMathToLatex(token);
      })
      .join('');
  }

  // Pure plain text: format all math phrases into LaTeX
  return convertPlainTextMathToLatex(rawText);
}

export const MathText: React.FC<MathTextProps> = ({
  content,
  className = '',
  inline = true,
  size = 'md',
}) => {
  if (!content) return null;

  // Size mapping for responsive textbook math
  const sizeClasses = {
    sm: 'text-xs sm:text-sm',
    md: 'text-sm sm:text-base',
    lg: 'text-base sm:text-lg',
    xl: 'text-lg sm:text-xl',
  }[size];

  // Render a math string with KaTeX safely
  const renderKaTeX = (mathStr: string, isBlock: boolean = false) => {
    const normalized = normalizeMathExpression(mathStr);
    try {
      const html = katex.renderToString(normalized, {
        displayMode: isBlock,
        throwOnError: false,
        strict: false,
      });
      return (
        <span
          className={`katex-wrapper ${
            isBlock
              ? 'block my-3 overflow-x-auto py-1 text-center font-normal'
              : 'inline-block mx-0.5 align-baseline font-normal'
          }`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    } catch {
      return <span className="font-mono text-emerald-800">{mathStr}</span>;
    }
  };

  // Convert raw textbook math (like "tan a = 3, 0 < a < pi/2" or "cot a = 1/3") into LaTeX
  const formattedContent = formatTextbookMath(content);

  // Parse $...$ and $$...$$
  if (formattedContent.includes('$')) {
    const parts = formattedContent.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);
    return (
      <span className={`${sizeClasses} ${className}`}>
        {parts.map((part, idx) => {
          if (part.startsWith('$$') && part.endsWith('$$')) {
            const math = part.slice(2, -2).trim();
            return <React.Fragment key={idx}>{renderKaTeX(math, true)}</React.Fragment>;
          } else if (part.startsWith('$') && part.endsWith('$')) {
            const math = part.slice(1, -1).trim();
            return (
              <span key={idx} className="inline-block whitespace-nowrap">
                {renderKaTeX(math, false)}
              </span>
            );
          }
          return <span key={idx}>{part}</span>;
        })}
      </span>
    );
  }

  return <span className={`${sizeClasses} ${className}`}>{formattedContent}</span>;
};
