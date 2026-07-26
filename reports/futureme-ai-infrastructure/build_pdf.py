#!/usr/bin/env python3
"""Build the verified PDF companion for the FutureMe AI infrastructure brief."""

from pathlib import Path

from reportlab.graphics.shapes import Circle, Drawing, Line, Polygon, Rect, String
from reportlab.lib import colors
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Flowable,
    Frame,
    KeepTogether,
    LongTable,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


OUTPUT = Path(__file__).with_name("futureme-ai-infrastructure.pdf")
FONT_REGULAR = "/System/Library/Fonts/Supplemental/Tahoma.ttf"
FONT_BOLD = "/System/Library/Fonts/Supplemental/Tahoma Bold.ttf"

pdfmetrics.registerFont(TTFont("Tahoma", FONT_REGULAR))
pdfmetrics.registerFont(TTFont("Tahoma-Bold", FONT_BOLD))


INK = HexColor("#10242F")
MUTED = HexColor("#5D707A")
SUBTLE = HexColor("#7E9099")
LINE = HexColor("#D8E4E5")
TEAL = HexColor("#087F78")
TEAL_DARK = HexColor("#065D59")
TEAL_SOFT = HexColor("#E6F5F2")
BLUE = HexColor("#3266D5")
BLUE_SOFT = HexColor("#EBF1FF")
ORANGE = HexColor("#DD7A2F")
ORANGE_SOFT = HexColor("#FFF1E5")
VIOLET = HexColor("#7859C6")
VIOLET_SOFT = HexColor("#F1EDFF")
GREEN = HexColor("#2E8B57")
GREEN_SOFT = HexColor("#EAF7EF")
RED = HexColor("#BD4A4A")
RED_SOFT = HexColor("#FFF0F0")
WHITE = colors.white


def style(name, **kwargs):
    base = {
        "fontName": "Tahoma",
        "fontSize": 9.5,
        "leading": 14.2,
        "textColor": INK,
        "wordWrap": "CJK",
        "spaceAfter": 0,
        "spaceBefore": 0,
    }
    base.update(kwargs)
    return ParagraphStyle(name, **base)


STYLES = {
    "cover_kicker": style(
        "cover_kicker",
        fontName="Tahoma-Bold",
        fontSize=9,
        leading=12,
        textColor=HexColor("#A9EEE4"),
        spaceAfter=12,
    ),
    "cover_title": style(
        "cover_title",
        fontName="Tahoma-Bold",
        fontSize=36,
        leading=42,
        textColor=WHITE,
        spaceAfter=11,
    ),
    "cover_subtitle": style(
        "cover_subtitle",
        fontName="Tahoma-Bold",
        fontSize=19,
        leading=25,
        textColor=HexColor("#BDF2EA"),
        spaceAfter=19,
    ),
    "cover_lede": style(
        "cover_lede",
        fontSize=13,
        leading=21,
        textColor=HexColor("#DDEDEC"),
    ),
    "kicker": style(
        "kicker",
        fontName="Tahoma-Bold",
        fontSize=7.8,
        leading=10,
        textColor=TEAL,
        spaceAfter=4,
    ),
    "h1": style(
        "h1",
        fontName="Tahoma-Bold",
        fontSize=23,
        leading=29,
        textColor=INK,
        spaceAfter=9,
    ),
    "h2": style(
        "h2",
        fontName="Tahoma-Bold",
        fontSize=15,
        leading=20,
        textColor=INK,
        spaceAfter=6,
    ),
    "h3": style(
        "h3",
        fontName="Tahoma-Bold",
        fontSize=11,
        leading=15,
        textColor=INK,
        spaceAfter=4,
    ),
    "intro": style(
        "intro",
        fontSize=10.6,
        leading=16.5,
        textColor=MUTED,
        spaceAfter=11,
    ),
    "body": style("body", fontSize=9.3, leading=14.5, textColor=MUTED),
    "body_small": style("body_small", fontSize=8.3, leading=12.5, textColor=MUTED),
    "body_tiny": style("body_tiny", fontSize=7.4, leading=10.4, textColor=MUTED),
    "card_title": style(
        "card_title",
        fontName="Tahoma-Bold",
        fontSize=11,
        leading=15,
        textColor=INK,
        spaceAfter=4,
    ),
    "component_title": ParagraphStyle(
        "component_title",
        fontName="Tahoma-Bold",
        fontSize=10.3,
        leading=13.5,
        textColor=INK,
        wordWrap=None,
        spaceAfter=0,
        spaceBefore=0,
    ),
    "card_body": style("card_body", fontSize=8.7, leading=13.2, textColor=MUTED),
    "table_head": style(
        "table_head",
        fontName="Tahoma-Bold",
        fontSize=7.2,
        leading=9.4,
        textColor=SUBTLE,
    ),
    "table_cell": style("table_cell", fontSize=7.3, leading=10.6, textColor=MUTED),
    "table_first": style(
        "table_first",
        fontName="Tahoma-Bold",
        fontSize=7.5,
        leading=10.6,
        textColor=INK,
    ),
    "callout": style(
        "callout",
        fontSize=10,
        leading=15.5,
        textColor=TEAL_DARK,
    ),
    "quote": style(
        "quote",
        fontName="Tahoma-Bold",
        fontSize=18,
        leading=25,
        textColor=WHITE,
        spaceAfter=10,
    ),
    "quote_body": style(
        "quote_body",
        fontSize=10.5,
        leading=17,
        textColor=HexColor("#DDEDEC"),
    ),
    "reference": style("reference", fontSize=8.2, leading=12.8, textColor=MUTED),
}


class SectionRule(Flowable):
    def __init__(self, color=LINE, width=0.6, space_before=5, space_after=11):
        super().__init__()
        self.color = color
        self.line_width = width
        self.space_before = space_before
        self.space_after = space_after
        self.height = space_before + space_after + width

    def draw(self):
        self.canv.saveState()
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(self.line_width)
        self.canv.line(0, self.space_after, self._availWidth, self.space_after)
        self.canv.restoreState()


def P(text, kind="body"):
    return Paragraph(text, STYLES[kind])


def section_header(kicker, title, intro=None):
    items = [
        P(kicker.upper(), "kicker"),
        P(title, "h1"),
    ]
    if intro:
        items.append(P(intro, "intro"))
    return items


def colored_card(title, body, accent=TEAL, background=colors.white, width=240):
    number_bar = Table(
        [[Paragraph(title, STYLES["card_title"])]],
        colWidths=[width - 24],
        style=TableStyle(
            [
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        ),
    )
    content = [[number_bar], [Paragraph(body, STYLES["card_body"])]]
    return Table(
        content,
        colWidths=[width],
        style=TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), background),
                ("BOX", (0, 0), (-1, -1), 0.8, LINE),
                ("LINEBEFORE", (0, 0), (0, -1), 4, accent),
                ("LEFTPADDING", (0, 0), (-1, -1), 12),
                ("RIGHTPADDING", (0, 0), (-1, -1), 12),
                ("TOPPADDING", (0, 0), (-1, 0), 11),
                ("BOTTOMPADDING", (0, -1), (-1, -1), 11),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        ),
    )


def callout(text, background=TEAL_SOFT, border=TEAL):
    return Table(
        [[Paragraph(text, STYLES["callout"])]],
        colWidths=[492],
        style=TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), background),
                ("BOX", (0, 0), (-1, -1), 0.8, border),
                ("LINEBEFORE", (0, 0), (0, 0), 4, border),
                ("LEFTPADDING", (0, 0), (-1, -1), 13),
                ("RIGHTPADDING", (0, 0), (-1, -1), 13),
                ("TOPPADDING", (0, 0), (-1, -1), 11),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 11),
            ]
        ),
    )


def bullet_list(items, warning=False):
    rows = []
    bullet_color = RED if warning else TEAL
    for item in items:
        bullet = Paragraph("●", style("bullet", fontSize=6.3, leading=12, textColor=bullet_color))
        rows.append([bullet, Paragraph(item, STYLES["body_small"])])
    return Table(
        rows,
        colWidths=[12, 226],
        style=TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 2),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ]
        ),
    )


def architecture_drawing():
    d = Drawing(500, 322)

    def box(x, y, w, h, fill, stroke, title, subtitle="", dashed=False):
        d.add(
            Rect(
                x,
                y,
                w,
                h,
                rx=9,
                ry=9,
                fillColor=fill,
                strokeColor=stroke,
                strokeWidth=1.1,
                strokeDashArray=[4, 3] if dashed else None,
            )
        )
        d.add(String(x + 12, y + h - 21, title, fontName="Tahoma-Bold", fontSize=8.7, fillColor=INK))
        if subtitle:
            d.add(String(x + 12, y + 12, subtitle, fontName="Tahoma", fontSize=6.5, fillColor=MUTED))

    def arrow(x1, y1, x2, y2, color=TEAL, dashed=False):
        d.add(
            Line(
                x1,
                y1,
                x2,
                y2,
                strokeColor=color,
                strokeWidth=1.4,
                strokeDashArray=[4, 3] if dashed else None,
            )
        )
        angle = 4
        if abs(x2 - x1) >= abs(y2 - y1):
            if x2 >= x1:
                pts = [x2, y2, x2 - angle, y2 + 2.5, x2 - angle, y2 - 2.5]
            else:
                pts = [x2, y2, x2 + angle, y2 + 2.5, x2 + angle, y2 - 2.5]
        elif y2 >= y1:
            pts = [x2, y2, x2 - 2.5, y2 - angle, x2 + 2.5, y2 - angle]
        else:
            pts = [x2, y2, x2 - 2.5, y2 + angle, x2 + 2.5, y2 + angle]
        d.add(Polygon(pts, fillColor=color, strokeColor=color))

    box(10, 244, 124, 54, colors.white, LINE, "ข้อมูลหลักสูตร / อาชีพ", "เกณฑ์ · แหล่งอ้างอิง")
    box(10, 164, 124, 54, colors.white, LINE, "Ingestion & Embedding", "อ่านไฟล์ · Chunk · Vector")
    box(10, 84, 124, 54, colors.white, LINE, "Knowledge Base", "Vector DB + metadata")
    arrow(72, 244, 72, 220)
    arrow(72, 164, 72, 140)

    d.add(Rect(160, 92, 198, 206, rx=13, ry=13, fillColor=HexColor("#F8FCFC"), strokeColor=HexColor("#9BCFC9"), strokeWidth=1.4))
    d.add(String(174, 275, "STUDENT INTELLIGENCE LAYER", fontName="Tahoma-Bold", fontSize=6.7, fillColor=TEAL))
    d.add(String(174, 252, "สนทนา + Profile + RAG", fontName="Tahoma-Bold", fontSize=13, fillColor=INK))
    box(174, 190, 78, 42, colors.white, LINE, "LLM", "คุย · สกัด")
    box(266, 190, 78, 42, colors.white, LINE, "Profile", "ยืนยัน · อัปเดต")
    box(174, 125, 170, 44, TEAL_SOFT, HexColor("#9BCFC9"), "RAG Retrieval", "ค้น evidence พร้อม filter")
    arrow(252, 211, 264, 211)
    arrow(213, 190, 213, 172)
    arrow(305, 190, 305, 172)
    arrow(134, 111, 171, 111)

    box(177, 25, 164, 44, colors.white, LINE, "Learner Profile DB", "interests · skills · constraints")
    arrow(252, 92, 252, 72, BLUE)
    arrow(270, 69, 270, 89, BLUE)

    box(382, 242, 108, 50, colors.white, LINE, "นักเรียน / Web App", "คุย · ยืนยัน · feedback")
    arrow(382, 264, 361, 264, BLUE)
    arrow(358, 245, 380, 245, BLUE)
    box(382, 154, 108, 58, colors.white, LINE, "Recommendation", "Scoring หลายมิติ")
    arrow(358, 181, 379, 181)
    box(382, 72, 108, 58, colors.white, LINE, "Response & Safety", "เหตุผล · citation")
    arrow(436, 154, 436, 133)
    box(10, 16, 124, 46, HexColor("#FFFAF0"), HexColor("#E5C894"), "LoRA · optional", "หลังมี dataset ที่ดี", dashed=True)
    arrow(134, 39, 171, 200, HexColor("#A88943"), dashed=True)

    return d


def pipeline_drawing():
    d = Drawing(500, 126)
    items = [
        ("1", "Source files", "PDF · Word · HTML", BLUE_SOFT, BLUE),
        ("2", "Extract", "อ่านข้อความ · OCR", TEAL_SOFT, TEAL),
        ("3", "Clean & Chunk", "แยก claim", ORANGE_SOFT, ORANGE),
        ("4", "Embedding", "ข้อความ → ตัวเลข", VIOLET_SOFT, VIOLET),
        ("5", "Vector DB", "vector + metadata", GREEN_SOFT, GREEN),
        ("6", "Retrieval", "ค้น + filter", TEAL_SOFT, TEAL),
    ]
    x = 4
    for index, (num, title, subtitle, fill, accent) in enumerate(items):
        width = 75 if index < 5 else 84
        d.add(Rect(x, 28, width, 78, rx=9, ry=9, fillColor=colors.white, strokeColor=LINE, strokeWidth=1))
        d.add(Circle(x + width / 2, 89, 10, fillColor=fill, strokeColor=None))
        d.add(String(x + width / 2, 86, num, fontName="Tahoma-Bold", fontSize=7, fillColor=accent, textAnchor="middle"))
        d.add(String(x + width / 2, 61, title, fontName="Tahoma-Bold", fontSize=7.1, fillColor=INK, textAnchor="middle"))
        d.add(String(x + width / 2, 44, subtitle, fontName="Tahoma", fontSize=5.8, fillColor=MUTED, textAnchor="middle"))
        if index < len(items) - 1:
            start = x + width
            end = start + 9
            d.add(Line(start + 1, 67, end - 1, 67, strokeColor=TEAL, strokeWidth=1.2))
            d.add(Polygon([end, 67, end - 4, 69.5, end - 4, 64.5], fillColor=TEAL, strokeColor=TEAL))
            x = end + 2
        else:
            x += width
    return d


def component_row(number, title, description, output, accent):
    num = Table(
        [[Paragraph(str(number), style(f"num{number}", fontName="Tahoma-Bold", fontSize=10, leading=12, textColor=WHITE, alignment=TA_CENTER))]],
        colWidths=[25],
        rowHeights=[25],
        style=TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), accent),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        ),
    )
    output_box = Table(
        [[Paragraph(output, STYLES["body_tiny"])]],
        colWidths=[118],
        style=TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), HexColor("#F4F8F8")),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        ),
    )
    return Table(
        [[num, Paragraph(title, STYLES["component_title"]), Paragraph(description, STYLES["body_small"]), output_box]],
        colWidths=[31, 114, 224, 123],
        style=TableStyle(
            [
                ("BOX", (0, 0), (-1, -1), 0.7, LINE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        ),
    )


def make_table(headers, rows, widths):
    data = [[Paragraph(h, STYLES["table_head"]) for h in headers]]
    for row in rows:
        data.append(
            [
                Paragraph(str(value), STYLES["table_first"] if col == 0 else STYLES["table_cell"])
                for col, value in enumerate(row)
            ]
        )
    table = LongTable(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), HexColor("#F2F7F7")),
                ("BOX", (0, 0), (-1, -1), 0.7, LINE),
                ("INNERGRID", (0, 0), (-1, -1), 0.35, LINE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    return table


def draw_cover(canvas, doc):
    width, height = A4
    canvas.saveState()
    canvas.setFillColor(HexColor("#073E40"))
    canvas.rect(0, 0, width, height, fill=1, stroke=0)
    canvas.setFillColor(HexColor("#0B5D59"))
    canvas.circle(width + 35, height - 95, 180, fill=1, stroke=0)
    canvas.setStrokeColor(HexColor("#3B8985"))
    canvas.setLineWidth(0.8)
    canvas.circle(width + 35, height - 95, 230, fill=0, stroke=1)
    canvas.circle(width + 35, height - 95, 280, fill=0, stroke=1)
    canvas.setFillColor(HexColor("#156E68"))
    canvas.roundRect(width - 190, 35, 155, 155, 25, fill=1, stroke=0)
    canvas.setFillColor(HexColor("#A9EEE4"))
    canvas.setFont("Tahoma-Bold", 9)
    canvas.drawString(42, 38, "VERSION 1.0  ·  26 JULY 2026")
    canvas.restoreState()


def draw_body(canvas, doc):
    width, height = A4
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.55)
    canvas.line(42, height - 31, width - 42, height - 31)
    canvas.setFont("Tahoma-Bold", 7)
    canvas.setFillColor(TEAL_DARK)
    canvas.drawString(42, height - 23, "FUTUREME AI INFRASTRUCTURE")
    canvas.setFont("Tahoma", 7)
    canvas.setFillColor(SUBTLE)
    canvas.drawRightString(width - 42, height - 23, "สรุปสำหรับทีม")
    canvas.line(42, 31, width - 42, 31)
    canvas.setFont("Tahoma", 7)
    canvas.drawString(42, 20, "FutureMe AI · Team Brief")
    canvas.drawRightString(width - 42, 20, f"{canvas.getPageNumber()}")
    canvas.restoreState()


def build_pdf():
    doc = BaseDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        leftMargin=42,
        rightMargin=42,
        topMargin=42,
        bottomMargin=38,
        title="FutureMe AI Infrastructure - สรุปสำหรับทีม",
        author="FutureMe AI",
        subject="AI infrastructure, RAG, learner profile, recommendation, text to vector",
    )

    cover_frame = Frame(42, 48, A4[0] - 84, A4[1] - 92, id="cover-frame", showBoundary=0)
    body_frame = Frame(42, 38, A4[0] - 84, A4[1] - 80, id="body-frame", showBoundary=0)
    doc.addPageTemplates(
        [
            PageTemplate(id="cover", frames=[cover_frame], onPage=draw_cover),
            PageTemplate(id="body", frames=[body_frame], onPage=draw_body),
        ]
    )

    story = []

    story.extend(
        [
            Spacer(1, 142),
            P("FUTUREME AI · TECHNICAL & PRODUCT BRIEF", "cover_kicker"),
            P("FutureMe AI<br/>Infrastructure", "cover_title"),
            P("สรุปสำหรับทีม", "cover_subtitle"),
            P(
                "ระบบไม่ได้ให้ AI ทายว่าเด็ก “ควรเป็นอะไร” แต่ช่วยเก็บหลักฐานจากตัวนักเรียน "
                "เชื่อมหลักฐานนั้นกับข้อมูลอาชีพและหลักสูตรที่ตรวจสอบได้ "
                "แล้วเสนอหลายเส้นทางพร้อมเหตุผล ข้อจำกัด และแหล่งอ้างอิง",
                "cover_lede",
            ),
            Spacer(1, 34),
            Table(
                [[P("<b>แกนของระบบ</b>", "cover_lede"), P("สนทนาและสร้าง Profile → ค้นหลักฐานด้วย RAG → ให้คะแนนแบบอธิบายได้ → ตอบอย่างปลอดภัย", "cover_lede")]],
                colWidths=[86, 390],
                style=TableStyle(
                    [
                        ("LINEABOVE", (0, 0), (-1, 0), 0.8, HexColor("#4F918D")),
                        ("LEFTPADDING", (0, 0), (-1, -1), 0),
                        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                        ("TOPPADDING", (0, 0), (-1, -1), 12),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
                        ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ]
                ),
            ),
            NextPageTemplate("body"),
            PageBreak(),
        ]
    )

    # Executive summary
    story.extend(
        section_header(
            "Executive Summary",
            "สี่เรื่องที่ทุกคนในทีมต้องเข้าใจตรงกัน",
            "FutureMe ไม่ใช่โมเดลก้อนเดียว แต่เป็นระบบหลายส่วนที่แบ่งหน้าที่กันชัดเจน "
            "ถ้าส่วนใดส่วนหนึ่งรับผิดชอบมากเกินไป คำแนะนำจะตรวจสอบยากและเสี่ยงชี้นำเด็ก",
        )
    )
    left_cards = [
        colored_card(
            "1. Base LLM เป็นตัวสนทนา ไม่ใช่ฐานข้อมูล",
            "ใช้คุยกับนักเรียน สกัดข้อมูลเป็นโครงสร้าง และเรียบเรียงคำอธิบาย "
            "แต่ไม่ควรใช้จำเกณฑ์รับสมัครหรือคิดคะแนนความเหมาะสมเอง",
            TEAL,
            width=240,
        ),
        colored_card(
            "3. Recommendation Engine เป็นคนให้คะแนน",
            "คำนวณจากกติกาที่ทีมกำหนด แยกความสนใจ ทักษะ บริบทงาน ข้อจำกัด "
            "และความพร้อมทางการศึกษา เพื่อย้อนตรวจเหตุผลได้",
            VIOLET,
            width=240,
        ),
    ]
    right_cards = [
        colored_card(
            "2. RAG มีหน้าที่ค้นหลักฐาน",
            "ค้นข้อมูลอาชีพ หลักสูตร เกณฑ์รับสมัคร และแหล่งอ้างอิงที่เกี่ยวข้อง "
            "โดยกรองปี จังหวัด ระดับวุฒิ และสถานะข้อมูลก่อน",
            BLUE,
            width=240,
        ),
        colored_card(
            "4. LoRA เป็นงานหลัง validation",
            "ใช้เมื่อมีตัวอย่างบทสนทนาคุณภาพสูงและพบว่า prompt ยังไม่พอ "
            "ไม่ใช้สอนข้อเท็จจริงที่เปลี่ยนตามปี และไม่ใช่ตัวกรองคำตอบชั้นสุดท้าย",
            ORANGE,
            width=240,
        ),
    ]
    story.append(
        Table(
            [[left_cards[0], right_cards[0]], [left_cards[1], right_cards[1]]],
            colWidths=[246, 246],
            style=TableStyle(
                [
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 0),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                    ("TOPPADDING", (0, 0), (-1, -1), 3),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                ]
            ),
        )
    )
    story.append(Spacer(1, 11))
    story.append(
        callout(
            "<b>ประโยคเดียวสำหรับเล่าให้คนอื่นฟัง:</b> FutureMe คุยกับนักเรียนเพื่อสร้าง Learner Profile "
            "จากข้อมูลที่เด็กยืนยัน เชื่อม Profile เข้ากับหลักสูตรและอาชีพผ่าน RAG "
            "แล้วเสนอหลายเส้นทางด้วยคะแนน เหตุผล และหลักฐานที่ตรวจสอบได้"
        )
    )
    story.append(PageBreak())

    # Architecture
    story.extend(
        section_header(
            "System Architecture",
            "ภาพรวมระบบที่สั้นที่สุดและยังถูกต้อง",
            "Student Intelligence Layer เป็นก้อนเดียวในมุมของผลิตภัณฑ์ "
            "ภายในมี LLM สำหรับสนทนา ตัวจัดการ Learner Profile และ RAG สำหรับค้นข้อมูล "
            "ส่วนการตัดสินใจเชิงคะแนนแยกออกมาเพื่อให้ตรวจสอบได้",
        )
    )
    story.append(Spacer(1, 4))
    story.append(architecture_drawing())
    story.append(Spacer(1, 7))
    story.append(
        callout(
            "<b>วิธีอ่านภาพ:</b> RAG ส่ง “หลักฐาน” ให้ Recommendation Engine "
            "ไม่ได้เป็นผู้เลือกเส้นทางแทนนักเรียน ส่วน LoRA เป็น adapter ทางเลือกหลังมี dataset ที่ดีแล้ว"
        )
    )
    story.append(PageBreak())

    # Components
    story.extend(
        section_header(
            "Component Responsibilities",
            "แต่ละส่วนรับผิดชอบอะไร และส่งอะไรต่อ",
            "การกำหนด input และ output ให้ชัดตั้งแต่แรก ช่วยให้ทีมพัฒนาแยกกันได้ "
            "และลดปัญหาที่ LLM รับทุกหน้าที่จนทดสอบไม่ได้",
        )
    )
    components = [
        (
            1,
            "Student / Web App",
            "หน้าจอสนทนา แสดง Profile ให้เด็กตรวจ แสดงหลายเส้นทาง เหตุผล แหล่งอ้างอิง และรับ feedback",
            "<b>ส่ง:</b> ข้อความ การยืนยัน Profile ข้อจำกัด และ feedback",
            TEAL,
        ),
        (
            2,
            "Student Intelligence Layer",
            "คุยกับนักเรียน สร้างและอัปเดต Profile ตรวจข้อมูลที่ยังขาด แล้วเรียก RAG เพื่อหาหลักฐาน",
            "<b>ส่ง:</b> Profile + Constraints + Evidence + Confidence",
            BLUE,
        ),
        (
            3,
            "Base LLM",
            "เข้าใจภาษาธรรมชาติ ถามต่อ สกัดบทสนทนาเป็น JSON และเรียบเรียงคำอธิบายจากข้อมูลที่เตรียมให้",
            "<b>ไม่ควรทำ:</b> จำข้อมูลล่าสุด คิดคะแนน หรือฟันธงอาชีพ",
            VIOLET,
        ),
        (
            4,
            "Learner Profile DB",
            "เก็บความสนใจ หลักฐานทักษะ บริบทงาน ข้อจำกัด เป้าหมาย confidence และสถานะการยืนยัน",
            "<b>ส่ง:</b> Profile ที่มี version และเฉพาะ field ที่จำเป็น",
            ORANGE,
        ),
        (
            5,
            "Knowledge Base + RAG",
            "เก็บข้อความเป็น claim/chunk พร้อม Vector และ metadata ค้นทั้งความหมายและคำตรง แล้วกรองปี จังหวัด ระดับวุฒิ และสถานะ",
            "<b>ส่ง:</b> Evidence ID, เนื้อหา, source, date และ retrieval score",
            GREEN,
        ),
        (
            6,
            "Recommendation & Scoring",
            "จับคู่ Profile กับเส้นทางที่พบ คำนวณคะแนนหลายมิติ ตรวจเงื่อนไขบังคับ และสร้าง ranking",
            "<b>ส่ง:</b> หลายเส้นทาง + score breakdown + reasons + gaps",
            HexColor("#3E6172"),
        ),
        (
            7,
            "Response & Safety",
            "เรียบเรียงผล ตรวจว่าข้อความสำคัญมีหลักฐาน ลดการฟันธงและการตีตรา พร้อมยอมรับเมื่อข้อมูลไม่พอ",
            "<b>ส่ง:</b> คำตอบหลายทางเลือกพร้อม citation",
            RED,
        ),
        (
            8,
            "LoRA Adapter",
            "ส่วนเสริมสำหรับปรับบทสนทนา การสกัด schema หรือการอธิบายตาม rubric เมื่อมีตัวอย่างคุณภาพสูง",
            "<b>MVP:</b> ยังไม่จำเป็น เริ่มจาก prompt + evaluation ก่อน",
            HexColor("#867843"),
        ),
    ]
    for index, component in enumerate(components):
        story.append(component_row(*component))
        story.append(Spacer(1, 6))

    story.append(PageBreak())

    # Text to vector
    story.extend(
        section_header(
            "Text → Vector → Retrieval",
            "ข้อมูลกลายเป็น Vector ได้อย่างไร",
            "Vector Database ไม่ได้แปลงข้อความ ตัวที่ทำหน้าที่นั้นคือ Embedding Model "
            "ส่วน Vector Database มีหน้าที่เก็บ Vector และค้นชิ้นข้อความที่ความหมายใกล้กับคำถาม",
        )
    )
    story.append(pipeline_drawing())
    story.append(Spacer(1, 8))
    process_rows = [
        ("1. เก็บต้นฉบับ", "เก็บไฟล์แบบไม่แก้ไข พร้อม URL วันที่ดึง checksum และเงื่อนไขการใช้งาน"),
        ("2. อ่านข้อความ", "ใช้ parser ตามชนิดไฟล์ ถ้าเป็น PDF สแกนจึงค่อยใช้ OCR และตรวจลำดับการอ่าน"),
        ("3. จัดโครงสร้าง", "แยกชื่อหลักสูตร วิชาที่เรียน อาชีพปลายทาง ค่าใช้จ่าย และเกณฑ์สมัคร"),
        ("4. แบ่ง Chunk", "ใช้หัวข้อและความหมายเป็นหลัก ไม่ตัดกฎครึ่งประโยคหรือรวมหลายปีในก้อนเดียว"),
        ("5. ตรวจแหล่ง", "กำหนด verified, conditional หรือ unverified และไม่ index ข้อมูล unverified"),
        ("6. สร้าง Embedding", "ใช้ Embedding Model เดียวกันกับ chunk และคำค้น"),
        ("7. เก็บ Vector", "เก็บ Vector คู่กับข้อความ Evidence ID ปี จังหวัด ระดับวุฒิ และวันหมดอายุ"),
        ("8. ทดสอบ Retrieval", "ใช้คำถามไทยเหมือนภาษานักเรียนจริง แล้ววัด source recall และ citation precision"),
    ]
    story.append(
        make_table(
            ["ขั้นตอน", "สิ่งที่ต้องทำ"],
            process_rows,
            [112, 380],
        )
    )
    story.append(Spacer(1, 10))
    story.append(
        Table(
            [
                [
                    colored_card(
                        "ค่าตั้งต้นสำหรับทดลอง",
                        "Chunk ราว 300-600 tokens และ overlap 50-100 tokens "
                        "กฎรับสมัครควรแบ่งตามหนึ่งเงื่อนไข ดึง candidate 15-20 ชิ้น แล้ว rerank เหลือ 5-8 ชิ้น",
                        TEAL,
                        TEAL_SOFT,
                        240,
                    ),
                    colored_card(
                        "Metadata ที่ห้ามหาย",
                        "ชื่อเอกสาร ผู้เผยแพร่ URL เลขหน้า ปีการศึกษา รอบรับสมัคร วันหมดอายุ "
                        "ขอบเขต claim สถานะข้อมูล และผู้ตรวจ",
                        RED,
                        RED_SOFT,
                        240,
                    ),
                ]
            ],
            colWidths=[246, 246],
            style=TableStyle(
                [
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 0),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ]
            ),
        )
    )
    story.append(PageBreak())

    # Stack
    story.extend(
        section_header(
            "Recommended MVP Stack",
            "โปรแกรมที่แนะนำสำหรับเวอร์ชันแรก",
            "ชุดนี้เน้นทำเดโมได้เร็ว แต่ยังต่อยอดเป็น production ได้ "
            "โปรแกรมเปลี่ยนภายหลังได้ ตราบใดที่สัญญาข้อมูลระหว่างแต่ละส่วนยังเหมือนเดิม",
        )
    )
    stack_rows = [
        ("Frontend", "Next.js", "หน้าแชต Profile editor ผลลัพธ์ และแหล่งอ้างอิง", "ทำตอนนี้"),
        ("Backend API", "Python + FastAPI", "ควบคุม session, profile, RAG, scoring และ model call", "ทำตอนนี้"),
        ("Document parsing", "Unstructured + PyMuPDF", "อ่านข้อความจาก PDF, Word, HTML และ OCR เมื่อจำเป็น", "ทำตอนนี้"),
        ("RAG orchestration", "LlamaIndex หรือ Python ตรง ๆ", "จัด ingestion, chunking, retrieval และ context", "เลือกหนึ่งทาง"),
        ("Embedding", "BGE-M3 + Sentence Transformers", "แปลงข้อความไทย/อังกฤษเป็น Vector", "ทดลองก่อน"),
        ("Vector Database", "Qdrant", "เก็บ Dense/Sparse Vector, payload และ hybrid search", "ทำตอนนี้"),
        ("Relational DB", "PostgreSQL", "เก็บ Profile ข้อมูลโครงสร้าง กฎ และคะแนน", "ทำตอนนี้"),
        ("Raw file storage", "S3-compatible / MinIO", "เก็บต้นฉบับแบบ immutable พร้อม checksum", "ทำตอนนี้"),
        ("Base LLM", "Model API + structured output", "สนทนา สกัด Profile และอธิบายจาก evidence", "ใช้ API ก่อน"),
        ("Deployment", "Docker Compose", "รันในเครื่องก่อนย้ายขึ้น managed containers", "เริ่มง่ายก่อน"),
        ("LoRA / Graph", "เพิ่มหลัง baseline", "แก้เฉพาะปัญหาที่พิสูจน์แล้ว", "ทำภายหลัง"),
    ]
    story.append(make_table(["ส่วน", "ตัวเลือก", "หน้าที่", "สถานะ"], stack_rows, [86, 124, 210, 72]))
    story.append(Spacer(1, 11))
    story.append(
        callout(
            "<b>ถ้าต้องการลดจำนวนระบบในเดโม:</b> ใช้ PostgreSQL + pgvector แทน Qdrant ได้ "
            "แต่หากต้องการ Dense + Sparse + Hybrid Search ตั้งแต่แรก Qdrant จะจัดการ retrieval ได้ตรงกว่า"
        )
    )
    story.append(PageBreak())

    # Data placement and runtime
    story.extend(
        section_header(
            "Data Placement",
            "อะไรควรเก็บเป็น Vector และอะไรไม่ควร",
            "ข้อมูลที่ต้องค้นจากความหมายเหมาะกับ Vector Database "
            "ส่วนข้อมูลที่ต้องกรอง เปรียบเทียบ คำนวณ หรือควบคุม version เหมาะกับฐานข้อมูลเชิงโครงสร้าง",
        )
    )
    placement_rows = [
        ("คำอธิบายอาชีพ", "Vector DB", "ค้นจากภาษาของนักเรียนที่ไม่ตรงกับชื่อทางการ", "occupation_id, source"),
        ("คำอธิบายหลักสูตร", "Vector DB", "ค้นจากความสนใจและทักษะ", "program_id, level, province"),
        ("เกณฑ์รับสมัคร", "Vector + PostgreSQL", "ค้นข้อความ แต่ตรวจเงื่อนไขและปีด้วย field", "cycle, valid_until, status"),
        ("ค่าเทอม / คะแนน / จังหวัด", "PostgreSQL", "กรองและเปรียบเทียบค่าที่แน่นอน", "year, unit, currency"),
        ("Learner Profile / consent", "PostgreSQL แยกสิทธิ์", "แก้ ลบ ทำ version และควบคุมสิทธิ์", "confirmed_at, retention"),
        ("PDF ต้นฉบับ", "Object Storage", "หลักฐานต้นทางแบบ immutable", "checksum, retrieved_at"),
    ]
    story.append(make_table(["ข้อมูล", "ตำแหน่ง", "เหตุผล", "Metadata"], placement_rows, [102, 106, 198, 86]))
    story.append(Spacer(1, 16))
    story.append(P("ตอนนักเรียนคุยหนึ่งรอบ ข้อมูลไหลอย่างไร", "h2"))
    runtime_rows = [
        ("1", "รับข้อความ", "รับข้อความและ session โดยไม่ส่ง identity เกินจำเป็น"),
        ("2", "สกัด Profile", "LLM คืน structured output และข้อมูลที่ยังขาด"),
        ("3", "ให้เด็กยืนยัน", "ข้อมูลตีความต้องแก้ไขได้ก่อนใช้"),
        ("4", "สร้างคำค้น", "เลือก index และ metadata filter จาก Profile"),
        ("5", "ค้น Evidence", "RAG คืน source, date, status และ score"),
        ("6", "คำนวณคะแนน", "Scoring ให้คะแนนและตรวจเงื่อนไขบังคับ"),
        ("7", "เรียบเรียง", "LLM รับ Profile ที่จำเป็น ผลคะแนน และ evidence"),
        ("8", "ตรวจและเรียนรู้", "Safety ตรวจ citation แล้ว feedback ย้อนเข้า Profile"),
    ]
    story.append(make_table(["รอบ", "ขั้น", "สิ่งที่เกิดขึ้น"], runtime_rows, [35, 104, 353]))
    story.append(PageBreak())

    # Scoring and safety
    story.extend(
        section_header(
            "Explainable Recommendation",
            "คะแนนต้องบอกได้ว่าเกิดจากอะไร",
            "ตัวเลขด้านล่างเป็นตัวอย่างสำหรับเริ่มออกแบบ ไม่ใช่ค่าน้ำหนักที่ล็อกแล้ว "
            "ก่อนใช้จริงต้องทดสอบกับ counselor และนักเรียนหลายกลุ่ม",
        )
    )
    score_rows = [
        ("Interest fit", "30%", "ความสนใจที่เด็กยืนยันและเหตุการณ์ตัวอย่าง"),
        ("Evidence-backed skill fit", "25%", "ทักษะที่มีผลงานหรือหลักฐานรองรับ"),
        ("Constraint feasibility", "20%", "งบประมาณ พื้นที่ เวลา สุขภาพ และภาษา"),
        ("Work-context fit", "15%", "ลักษณะงานและสภาพแวดล้อมที่ชอบ"),
        ("Education readiness", "10%", "พื้นฐานวิชา คุณสมบัติ และเกณฑ์รับสมัคร"),
    ]
    story.append(make_table(["มิติ", "ตัวอย่างน้ำหนัก", "หลักฐานที่ใช้"], score_rows, [154, 96, 242]))
    story.append(Spacer(1, 10))
    story.append(
        callout(
            "<b>คะแนนไม่ใช่คำตัดสิน:</b> ควรเขียนว่า “จากข้อมูลที่ให้มา เส้นทางนี้ควรทดลองสำรวจต่อ” "
            "ไม่ใช่ “AI รู้ว่าคุณเหมาะกับอาชีพนี้” และต้องแสดงทั้ง reasons, gaps และ evidence IDs",
            ORANGE_SOFT,
            ORANGE,
        )
    )
    story.append(Spacer(1, 16))
    story.append(P("เพราะผู้ใช้เป็นนักเรียน ความปลอดภัยต้องอยู่ในโครงสร้าง", "h2"))
    safety_rows = [
        [
            colored_card("Data minimization", "เก็บเฉพาะข้อมูลจำเป็นต่อการแนะแนว", TEAL, colors.white, 156),
            colored_card("Identity separation", "แยก identity ออกจาก Learner Profile", BLUE, colors.white, 156),
            colored_card("Consent & control", "มี export แก้ไข และลบข้อมูล", VIOLET, colors.white, 156),
        ],
        [
            colored_card("No implicit training", "ไม่นำบทสนทนาไปฝึกโดยอัตโนมัติ", ORANGE, colors.white, 156),
            colored_card("Evidence-first", "ข้อเสนอสำคัญต้องมีหลักฐาน", GREEN, colors.white, 156),
            colored_card("Human review", "เปิดทางให้ครูหรือผู้เชี่ยวชาญทบทวน", RED, colors.white, 156),
        ],
    ]
    story.append(
        Table(
            safety_rows,
            colWidths=[164, 164, 164],
            style=TableStyle(
                [
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 0),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                    ("TOPPADDING", (0, 0), (-1, -1), 3),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                ]
            ),
        )
    )
    story.append(PageBreak())

    # Roadmap
    story.extend(
        section_header(
            "MVP Build Order",
            "ลำดับสร้างที่ช่วยลดความเสี่ยง",
            "อย่าเริ่มจาก LoRA หรือโมเดลใหญ่ที่สุด ให้เริ่มจากข้อมูลที่ตรวจสอบได้ "
            "แล้วค่อยพิสูจน์ว่า retrieval และ recommendation มีประโยชน์จริง",
        )
    )
    phases = [
        ("PHASE 1", "Data foundation", "ล็อก schema และสร้าง source registry กับ quarantine", "ผ่านเมื่อทุก edge มี source, status และวันที่ตรวจ"),
        ("PHASE 2", "Guided discovery", "ทำบทสนทนาและ Profile แบบ structured ที่เด็กแก้ไขได้", "ผ่านเมื่อแยกสิ่งที่รู้กับสิ่งที่คาดได้"),
        ("PHASE 3", "RAG + scoring", "index ข้อมูล verified ให้คะแนนห้ามิติ และส่งหลายเส้นทาง", "ผ่านเมื่อคำแนะนำย้อนถึง Profile และ evidence ได้"),
        ("PHASE 4", "Evaluation & trial", "ทดสอบ retrieval, mapping, safety และ usefulness หลายบริบท", "ผ่านเมื่อเด็กเข้าใจเหตุผลและรู้ก้าวทดลองต่อ"),
        ("PHASE 5", "Optimization", "เพิ่ม reranker, LoRA, graph หรือ autoscaling จากปัญหาที่วัดได้", "ผ่านเมื่อ metric ดีขึ้นเหนือ baseline"),
    ]
    for label, title, body, done in phases:
        phase_table = Table(
            [[P(label, "kicker"), Paragraph(title, STYLES["h3"]), Paragraph(body, STYLES["body_small"]), Paragraph(done, STYLES["body_tiny"])]],
            colWidths=[58, 105, 208, 121],
            style=TableStyle(
                [
                    ("BOX", (0, 0), (-1, -1), 0.7, LINE),
                    ("BACKGROUND", (3, 0), (3, 0), GREEN_SOFT),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 8),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                    ("TOPPADDING", (0, 0), (-1, -1), 9),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
                ]
            ),
        )
        story.append(KeepTogether([phase_table, Spacer(1, 7)]))

    story.append(Spacer(1, 12))
    story.append(P("หกอย่างที่ทีมควรหลีกเลี่ยงตั้งแต่ต้น", "h2"))
    story.append(
        Table(
            [
                [
                    bullet_list(
                        [
                            "ใส่ทุกอย่างลง Vector DB จนกรองค่าเทอม ปี และเงื่อนไขไม่ได้",
                            "รวมหลายหัวข้อหรือหลายปีไว้ใน Chunk เดียว",
                            "นำข้อมูล unverified หรือหมดอายุเข้า production",
                        ],
                        warning=True,
                    ),
                    bullet_list(
                        [
                            "ปล่อยให้ LLM คิดคะแนนหรือสร้างเหตุผลที่ไม่มีใน evidence",
                            "ใช้ LoRA จำหลักสูตรและเกณฑ์ที่เปลี่ยนทุกปี",
                            "ให้ผลลัพธ์เป็นคำตอบเดียวจนดูเหมือน AI ตัดสินชีวิตแทน",
                        ],
                        warning=True,
                    ),
                ]
            ],
            colWidths=[246, 246],
            style=TableStyle(
                [
                    ("BOX", (0, 0), (-1, -1), 0.7, LINE),
                    ("BACKGROUND", (0, 0), (-1, -1), RED_SOFT),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 8),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                    ("TOPPADDING", (0, 0), (-1, -1), 8),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ]
            ),
        )
    )
    story.append(PageBreak())

    # Closing and references
    closing_box = Table(
        [
            [
                Paragraph(
                    "ระบบที่ดีไม่ได้ตอบเร็วที่สุด แต่ช่วยให้เด็กตัดสินใจจากข้อมูลที่เห็นและโต้แย้งได้",
                    STYLES["quote"],
                )
            ],
            [
                Paragraph(
                    "เป้าหมายของ MVP จึงไม่ใช่ทำให้ AI ดูฉลาดที่สุด แต่คือพิสูจน์ว่า Profile ถูกสร้างอย่างไม่ชี้นำ "
                    "RAG ค้นหลักฐานได้ตรง คะแนนอธิบายได้ และเด็กมองเห็นก้าวทดลองถัดไปของตัวเอง",
                    STYLES["quote_body"],
                )
            ],
            [Paragraph("<b>Build evidence first. Optimize the model later.</b>", STYLES["quote_body"])],
        ],
        colWidths=[492],
        style=TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), TEAL_DARK),
                ("LEFTPADDING", (0, 0), (-1, -1), 24),
                ("RIGHTPADDING", (0, 0), (-1, -1), 24),
                ("TOPPADDING", (0, 0), (-1, 0), 25),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
                ("TOPPADDING", (0, 1), (-1, -1), 6),
                ("BOTTOMPADDING", (0, -1), (-1, -1), 24),
            ]
        ),
    )
    story.append(closing_box)
    story.append(Spacer(1, 28))
    story.extend(section_header("References", "เอกสารอ้างอิงสำหรับทีม"))
    references = [
        "<b>FutureMe AI - RAG Data Specification.</b> เอกสารภายในโปรเจกต์ <font name='Tahoma-Bold'>Data/RAG_DATA_SPEC.md</font>",
        "<b>FutureMe AI - AIS Cloud Architecture and Deployment.</b> เอกสารภายในโปรเจกต์ <font name='Tahoma-Bold'>Data/06_AIS_Cloud_and_Infrastructure/01_AIS_Cloud_Architecture_and_Deployment.md</font>",
        "<link href='https://docs.unstructured.io/open-source/core-functionality/partitioning' color='#065D59'>Unstructured - Document Partitioning</link> สำหรับการอ่านเอกสารและ OCR",
        "<link href='https://huggingface.co/BAAI/bge-m3' color='#065D59'>BAAI - BGE-M3 Model Card</link> สำหรับ Embedding แบบ multilingual",
        "<link href='https://qdrant.tech/documentation/search/text-search/hybrid-search/' color='#065D59'>Qdrant - Hybrid Search</link> สำหรับ Dense + Sparse retrieval",
        "<link href='https://github.com/pgvector/pgvector' color='#065D59'>pgvector</link> ทางเลือกสำหรับค้น Vector ใน PostgreSQL",
    ]
    ref_rows = []
    for index, reference in enumerate(references, 1):
        ref_rows.append([P(str(index), "table_first"), Paragraph(reference, STYLES["reference"])])
    story.append(
        Table(
            ref_rows,
            colWidths=[22, 470],
            style=TableStyle(
                [
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LINEBELOW", (0, 0), (-1, -2), 0.4, LINE),
                    ("LEFTPADDING", (0, 0), (-1, -1), 0),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                    ("TOPPADDING", (0, 0), (-1, -1), 7),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
                ]
            ),
        )
    )
    story.append(Spacer(1, 20))
    story.append(
        callout(
            "<b>เอกสารนี้เป็น design brief</b> โปรแกรมและค่าน้ำหนักเป็นจุดเริ่มต้นสำหรับ MVP "
            "ทีมต้องยืนยันด้วย retrieval evaluation, counselor review, student testing และข้อกำหนดข้อมูลของบริการที่เลือกก่อนขึ้น production"
        )
    )

    doc.build(story)
    print(OUTPUT)


if __name__ == "__main__":
    build_pdf()
