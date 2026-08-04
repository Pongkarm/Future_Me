import routesData from "@/data/routes.json";
import type { ChatLanguage, ChatSource } from "@/lib/chat/types";

interface LocalisedText {
  en: string;
  th: string;
}

interface KnowledgeRecord {
  id: string;
  title: LocalisedText;
  excerpt: LocalisedText;
  url?: string;
  status: string;
  keywords: string[];
  order: number;
}

export interface RetrievedKnowledge {
  source: ChatSource;
  context: string;
}

/**
 * Small, deliberately curated registry derived from the audited source list in
 * 01_Research/Data. It contains no quarantined claim and makes time-scoped
 * sources say that they must be checked again.
 */
const GENERAL_KNOWLEDGE: KnowledgeRecord[] = [
  {
    id: "ovec-voc-curriculum-2567",
    title: {
      en: "OVEC vocational curriculum 2567 catalogue",
      th: "ทะเบียนหลักสูตรอาชีวศึกษา ปวช. 2567 ของ สอศ.",
    },
    excerpt: {
      en:
        "OVEC publishes the official vocational curriculum catalogue. Programme availability, dual-study arrangements, costs and outcomes must be checked for the specific college and programme.",
      th:
        "สอศ. เผยแพร่ทะเบียนหลักสูตรอาชีวศึกษาอย่างเป็นทางการ ส่วนสถานศึกษาที่เปิดสอน รูปแบบทวิภาคี ค่าใช้จ่าย และผลลัพธ์ต้องตรวจสอบเป็นรายหลักสูตร",
    },
    url: "https://ckan.vec.go.th/th/dataset/voc_curriculum",
    status: "verified",
    keywords: [
      "ปวช",
      "ปวส",
      "อาชีว",
      "สอศ",
      "ทวิภาคี",
      "vocational",
      "ovec",
      "dve",
      "college",
      "ฝึกงาน",
    ],
    order: 0,
  },
  {
    id: "mytcas-70",
    title: { en: "Official myTCAS programme search (TCAS70)", th: "ระบบค้นหาหลักสูตร myTCAS (TCAS70)" },
    excerpt: {
      en:
        "Admission rounds and programme requirements change by institution, programme and academic year. Confirm current criteria in the official myTCAS search and the institution announcement.",
      th:
        "รอบรับและเกณฑ์สมัครเปลี่ยนตามสถาบัน หลักสูตร และปีการศึกษา จึงต้องยืนยันกับระบบ myTCAS และประกาศของสถาบันในปีที่สมัคร",
    },
    url: "https://school.mytcas.com/",
    status: "conditional",
    keywords: [
      "tcas",
      "mytcas",
      "admission",
      "university",
      "มหาวิทยาลัย",
      "คณะ",
      "สมัคร",
      "รับเข้า",
      "tgat",
      "tpat",
      "a-level",
    ],
    order: 1,
  },
  {
    id: "onet-interest-profiler-manual",
    title: { en: "O*NET Interest Profiler Manual", th: "คู่มือ O*NET Interest Profiler" },
    excerpt: {
      en:
        "The O*NET Interest Profiler uses six RIASEC interest areas for career exploration. Interests are evidence to explore, not proof of ability or a guaranteed career fit.",
      th:
        "O*NET Interest Profiler ใช้ความสนใจ 6 ด้านตามกรอบ RIASEC เพื่อสำรวจอาชีพ ความสนใจเป็นข้อมูลสำหรับทดลองสำรวจ ไม่ใช่หลักฐานความสามารถหรือคำตัดสินว่าอาชีพใดเหมาะแน่นอน",
    },
    url: "https://www.onetcenter.org/dl_files/IP_Manual.pdf",
    status: "verified",
    keywords: [
      "riasec",
      "holland",
      "interest profiler",
      "ความสนใจ",
      "แบบประเมิน",
      "อาชีพ",
      "career interest",
      "realistic",
      "investigative",
      "artistic",
      "social",
      "enterprising",
      "conventional",
    ],
    order: 2,
  },
  {
    id: "hsces-current-2026",
    title: { en: "High School Certificate Equivalency System", th: "ระบบเทียบวุฒิการศึกษาระดับมัธยมปลาย HSCES" },
    excerpt: {
      en:
        "HSCES provides current equivalency information for foreign upper-secondary credentials and GED applicants in Thailand. Institution-specific admission conditions still need confirmation.",
      th:
        "HSCES ให้ข้อมูลการเทียบวุฒิต่างประเทศและ GED สำหรับการสมัครในไทย แต่ยังต้องตรวจเงื่อนไขของแต่ละสถาบันโดยตรง",
    },
    url: "https://hsces.atc.chula.ac.th/",
    status: "conditional",
    keywords: ["ged", "hsces", "equivalency", "เทียบวุฒิ", "สอบเทียบ", "วุฒิต่างประเทศ"],
    order: 3,
  },
  {
    id: "tdri-human-capital-2025",
    title: { en: "TDRI: Thailand human-capital development", th: "TDRI: การพัฒนาทุนมนุษย์ไทย" },
    excerpt: {
      en:
        "TDRI discusses education-to-work alignment in Thailand. Any statistic must retain the population, period and source scope rather than being applied to every student.",
      th:
        "TDRI อธิบายความสอดคล้องระหว่างการศึกษากับงานในประเทศไทย การใช้สถิติต้องระบุกลุ่มประชากร ช่วงเวลา และขอบเขตของแหล่งข้อมูล ไม่ควรเหมารวมกับนักเรียนทุกคน",
    },
    url: "https://tdri.or.th/2025/09/thailand-human-capital-development/",
    status: "verified",
    keywords: [
      "tdri",
      "labour",
      "labor",
      "job market",
      "ตลาดแรงงาน",
      "งานไม่ตรงสาย",
      "ทักษะ",
      "human capital",
      "ทุนมนุษย์",
    ],
    order: 4,
  },
];

const ROUTE_KEYWORDS: Record<string, string[]> = {
  "sci-math-engineering": [
    "engineering",
    "engineer",
    "science maths",
    "sci math",
    "วิทย์คณิต",
    "วิศวกรรม",
    "วิศวะ",
    "ฟิสิกส์",
  ],
  "vocational-digital": [
    "digital",
    "information technology",
    "computer",
    "coding",
    "software",
    "ไอที",
    "ดิจิทัล",
    "คอมพิวเตอร์",
    "เขียนโปรแกรม",
    "ซอฟต์แวร์",
  ],
  "dve-dual": ["dual", "dve", "ทวิภาคี", "ฝึกงาน", "work based", "work-based"],
  "arts-design": ["art", "design", "creative", "portfolio", "ศิลปะ", "ออกแบบ", "สร้างสรรค์", "พอร์ต"],
  "business-admin": ["business", "administration", "marketing", "บัญชี", "ธุรกิจ", "บริหาร", "การตลาด"],
  "health-care": [
    "health",
    "healthcare",
    "nursing",
    "medical",
    "สุขภาพ",
    "พยาบาล",
    "แพทย์",
    "ดูแลผู้ป่วย",
  ],
};

const ROUTE_KNOWLEDGE: KnowledgeRecord[] = routesData.routes.map((route, index) => ({
  id: `route-${route.id}`,
  title: {
    en: `FutureMe demo route: ${route.name.en}`,
    th: `ตัวอย่างเส้นทาง FutureMe: ${route.name.th}`,
  },
  excerpt: {
    en: `${route.summary.en} Next exploration: ${route.nextExperiment.en} Catalogue status: ${route.provenance.status}.`,
    th: `${route.summary.th} สิ่งที่ลองทำต่อได้: ${route.nextExperiment.th} สถานะข้อมูล: ${route.provenance.status}`,
  },
  url: route.provenance.sourceUrl ?? undefined,
  status: route.provenance.status,
  keywords: ROUTE_KEYWORDS[route.id] ?? [],
  order: 100 + index,
}));

const KNOWLEDGE = [...GENERAL_KNOWLEDGE, ...ROUTE_KNOWLEDGE];

const STOP_WORDS = new Set([
  "about",
  "and",
  "are",
  "can",
  "for",
  "from",
  "have",
  "help",
  "how",
  "the",
  "this",
  "that",
  "those",
  "these",
  "one",
  "ones",
  "it",
  "its",
  "is",
  "was",
  "where",
  "should",
  "what",
  "with",
  "you",
  "your",
  "ฉัน",
  "อยาก",
  "อะไร",
  "อย่างไร",
  "เกี่ยวกับ",
  "ช่วย",
  "เรียน",
  "และ",
  "หรือ",
]);

function normalize(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase("en").replace(/[–—]/g, "-");
}

function tokens(value: string): string[] {
  return (normalize(value).match(/[\p{L}\p{N}]+/gu) ?? []).filter(
    (token) => token.length >= 3 && !STOP_WORDS.has(token),
  );
}

function scoreRecord(record: KnowledgeRecord, query: string): number {
  const normalizedQuery = normalize(query);
  const queryTokens = new Set(tokens(query));
  const searchable = normalize(
    `${record.title.en} ${record.title.th} ${record.excerpt.en} ${record.excerpt.th}`,
  );
  const searchableTokens = new Set(tokens(searchable));
  let score = 0;

  for (const keyword of record.keywords) {
    const normalizedKeyword = normalize(keyword);
    const keywordTokens = tokens(keyword);
    const isAsciiKeyword = /^[a-z0-9\s-]+$/.test(normalizedKeyword);
    const exactMatch = isAsciiKeyword
      ? keywordTokens.length > 0 && keywordTokens.every((token) => queryTokens.has(token))
      : normalizedQuery.includes(normalizedKeyword);
    if (exactMatch) score += 5;
    else if (keywordTokens.some((token) => queryTokens.has(token))) score += 2;
  }

  for (const token of queryTokens) {
    const matches = /^[a-z0-9]+$/.test(token)
      ? searchableTokens.has(token)
      : searchable.includes(token);
    if (matches) score += 1;
  }

  return score;
}

export function retrieveKnowledge(
  query: string,
  language: ChatLanguage,
  limit = 4,
): RetrievedKnowledge[] {
  if (!query.trim() || limit <= 0) return [];

  return KNOWLEDGE.map((record) => ({ record, score: scoreRecord(record, query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.record.order - b.record.order)
    .slice(0, limit)
    .map(({ record }) => {
      const title = record.title[language];
      const excerpt = record.excerpt[language];
      return {
        source: {
          id: record.id,
          title,
          excerpt,
          ...(record.url ? { url: record.url } : {}),
          status: record.status,
        },
        context: [
          `SOURCE_ID: ${record.id}`,
          `STATUS: ${record.status}`,
          `TITLE: ${title}`,
          `CONTENT: ${excerpt}`,
          record.url ? `URL: ${record.url}` : "URL: none (demo catalogue entry)",
        ].join("\n"),
      };
    });
}
