import os
from datetime import datetime
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

PRIMARY = RGBColor(0x2C, 0x4D, 0x7B)      # Azul oceano
ACCENT = RGBColor(0x4C, 0x9E, 0xD9)       # Azul claro
GOLD = RGBColor(0xF3, 0xA6, 0x4D)         # Dourado pôr do sol
WHITE = RGBColor(0xFF, 0xFF, 0xFF)


def add_title_slide(prs: Presentation):
    slide_layout = prs.slide_layouts[6]  # blank
    slide = prs.slides.add_slide(slide_layout)

    # Background rectangle in primary color
    bg = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height
    )
    bg.fill.solid()
    bg.fill.fore_color.rgb = PRIMARY
    bg.line.fill.background()

    # Glassmorphism card
    card = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE,
        Inches(1.0), Inches(1.0), prs.slide_width - Inches(2.0), prs.slide_height - Inches(2.0),
    )
    card.fill.solid()
    # Light translucent white
    card.fill.fore_color.rgb = WHITE
    card.fill.transparency = 0.15
    card.line.color.rgb = ACCENT
    card.line.width = Pt(1.5)

    tx = card.text_frame
    tx.clear()
    p = tx.paragraphs[0]
    run = p.add_run()
    run.text = "Guia de Turismo de Belmonte"
    p.alignment = PP_ALIGN.LEFT
    run.font.size = Pt(44)
    run.font.bold = True
    run.font.color.rgb = PRIMARY
    run.font.name = "Poppins"

    p2 = tx.add_paragraph()
    p2.text = "App com IA Bel: roteiros inteligentes, mapa offline e experiências locais."
    p2.alignment = PP_ALIGN.LEFT
    p2.font.size = Pt(18)
    p2.font.color.rgb = RGBColor(40, 40, 40)
    p2.font.name = "Montserrat"

    # CTA chip
    chip = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.2), Inches(4.7), Inches(3.1), Inches(0.8)
    )
    chip.fill.solid()
    chip.fill.fore_color.rgb = GOLD
    chip.line.fill.background()
    chip.text_frame.text = "Criar meu roteiro"
    chip.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER
    chip.text_frame.paragraphs[0].runs[0].font.bold = True
    chip.text_frame.paragraphs[0].runs[0].font.size = Pt(18)
    chip.text_frame.paragraphs[0].runs[0].font.name = "Poppins"


def add_agenda_slide(prs: Presentation):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    title = slide.shapes.add_textbox(Inches(0.8), Inches(0.6), Inches(8.0), Inches(1.0))
    tf = title.text_frame
    tf.text = "O que você verá"
    tf.paragraphs[0].runs[0].font.size = Pt(32)
    tf.paragraphs[0].runs[0].font.bold = True
    tf.paragraphs[0].runs[0].font.color.rgb = PRIMARY
    tf.paragraphs[0].runs[0].font.name = "Poppins"

    bullets = [
        "Visão geral do app e identidade visual",
        "IA Bel: a guia que personaliza sua viagem",
        "Telas-chave: Mapa, Roteiros, Gastronomia, Hospedagem, Comércio",
        "Interações: microanimações, parallax, ícones animados",
        "Uso em pitch e apresentação institucional",
    ]
    box = slide.shapes.add_textbox(Inches(0.8), Inches(1.6), Inches(8.0), Inches(4.5))
    t = box.text_frame
    t.clear()
    for idx, item in enumerate(bullets):
        p = t.add_paragraph() if idx > 0 else t.paragraphs[0]
        p.text = item
        p.level = 0
        p.font.size = Pt(20)
        p.font.color.rgb = RGBColor(50, 50, 50)
        p.font.name = "Montserrat"


def add_feature_slide(prs: Presentation, title: str, points: list[str], accent: RGBColor):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    # Accent header band
    band = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, Inches(1.2))
    band.fill.solid()
    band.fill.fore_color.rgb = accent
    band.line.fill.background()

    hdr = slide.shapes.add_textbox(Inches(0.6), Inches(0.2), Inches(8.0), Inches(0.8))
    tf = hdr.text_frame
    tf.text = title
    tf.paragraphs[0].runs[0].font.size = Pt(30)
    tf.paragraphs[0].runs[0].font.bold = True
    tf.paragraphs[0].runs[0].font.color.rgb = WHITE
    tf.paragraphs[0].runs[0].font.name = "Poppins"

    content = slide.shapes.add_textbox(Inches(0.8), Inches(1.6), Inches(8.4), Inches(4.6))
    ct = content.text_frame
    ct.clear()
    for i, pt in enumerate(points):
        p = ct.add_paragraph() if i > 0 else ct.paragraphs[0]
        p.text = pt
        p.level = 0
        p.font.size = Pt(20)
        p.font.color.rgb = RGBColor(40, 40, 40)
        p.font.name = "Montserrat"


def add_screens_overview(prs: Presentation):
    add_feature_slide(
        prs,
        "Telas do App",
        [
            "Tela Inicial – boas-vindas da IA Bel, CTA ‘Criar meu roteiro’",
            "Mapa Interativo – pontos turísticos destacados, opção offline",
            "Roteiro Inteligente – sugestões personalizadas por IA",
            "Gastronomia – restaurantes, avaliações, filtros",
            "Hospedagem – hotéis e reservas diretas",
            "Comércio Local – artesanato e produtos típicos",
            "Favoritos – salve lugares e roteiros",
            "Perfil – dados pessoais e histórico",
        ],
        ACCENT,
    )


def add_bel_ai_slide(prs: Presentation):
    add_feature_slide(
        prs,
        "IA Bel – sua guia pessoal",
        [
            "Mascote digital minimalista, tom tropical e amigável",
            "Sugere restaurantes, passeios e cultura local",
            "Balões de fala leves, com glassmorphism",
            "Presença contextual em todas as telas-chave",
        ],
        PRIMARY,
    )


def add_interactions_slide(prs: Presentation):
    add_feature_slide(
        prs,
        "Interações e Motion",
        [
            "Microanimações suaves em botões e transições",
            "Leve parallax em imagens de destaque",
            "CTAs dourados com hover em azul",
            "Ícones flat coloridos com animação sutil",
        ],
        GOLD,
    )


def add_branding_slide(prs: Presentation):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    title = slide.shapes.add_textbox(Inches(0.8), Inches(0.6), Inches(8.0), Inches(1.0))
    tf = title.text_frame
    tf.text = "Identidade Visual"
    tf.paragraphs[0].runs[0].font.size = Pt(32)
    tf.paragraphs[0].runs[0].font.bold = True
    tf.paragraphs[0].runs[0].font.color.rgb = PRIMARY
    tf.paragraphs[0].runs[0].font.name = "Poppins"

    # Palette chips
    chips = [
        ("Azul oceano #2C4D7B", PRIMARY),
        ("Azul claro #4C9ED9", ACCENT),
        ("Dourado pôr do sol #F3A64D", GOLD),
        ("Branco #FFFFFF", WHITE),
    ]
    x = 0.8
    for label, color in chips:
        rect = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(1.7), Inches(2.3), Inches(0.9))
        rect.fill.solid()
        rect.fill.fore_color.rgb = color
        rect.line.fill.background()
        tb = slide.shapes.add_textbox(Inches(x), Inches(2.7), Inches(2.3), Inches(0.5))
        t = tb.text_frame
        t.text = label
        t.paragraphs[0].runs[0].font.size = Pt(12)
        t.paragraphs[0].runs[0].font.color.rgb = RGBColor(40, 40, 40)
        t.paragraphs[0].runs[0].font.name = "Montserrat"
        x += 2.5

    # Typography
    ty = slide.shapes.add_textbox(Inches(0.8), Inches(3.5), Inches(8.5), Inches(2.0))
    tty = ty.text_frame
    tty.clear()
    p1 = tty.paragraphs[0]
    p1.text = "Títulos: Poppins Bold"
    p1.font.size = Pt(18)
    p1.font.color.rgb = RGBColor(40, 40, 40)
    p1.font.name = "Montserrat"
    p2 = tty.add_paragraph()
    p2.text = "Textos: Montserrat Regular"
    p2.font.size = Pt(18)
    p2.font.color.rgb = RGBColor(40, 40, 40)
    p2.font.name = "Montserrat"


def add_closing_slide(prs: Presentation):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    box = slide.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(8.0), Inches(2.5))
    tf = box.text_frame
    tf.text = "Obrigado!"
    tf.paragraphs[0].runs[0].font.size = Pt(40)
    tf.paragraphs[0].runs[0].font.bold = True
    tf.paragraphs[0].runs[0].font.color.rgb = PRIMARY
    tf.paragraphs[0].runs[0].font.name = "Poppins"
    p = tf.add_paragraph()
    p.text = "Pronto para pitch, apresentação e divulgação."
    p.font.size = Pt(20)
    p.font.color.rgb = RGBColor(60, 60, 60)
    p.font.name = "Montserrat"


def build_presentation(output_dir: str) -> str:
    prs = Presentation()
    prs.slide_height = Inches(7.5)
    prs.slide_width = Inches(13.333)  # 16:9

    add_title_slide(prs)
    add_agenda_slide(prs)
    add_branding_slide(prs)
    add_screens_overview(prs)
    add_bel_ai_slide(prs)
    add_interactions_slide(prs)
    add_closing_slide(prs)

    os.makedirs(output_dir, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M")
    pptx_path = os.path.join(output_dir, f"Belmonte_Turismo_Premium_{timestamp}.pptx")
    prs.save(pptx_path)
    return pptx_path


def try_export_pdf(pptx_path: str) -> str | None:
    # Attempt export via LibreOffice headless
    try:
        out_dir = os.path.dirname(pptx_path)
        exit_code = os.system(
            f"libreoffice --headless --convert-to pdf --outdir '{out_dir}' '{pptx_path}' >/dev/null 2>&1"
        )
        if exit_code == 0:
            base = os.path.splitext(os.path.basename(pptx_path))[0]
            pdf_path = os.path.join(out_dir, f"{base}.pdf")
            return pdf_path if os.path.exists(pdf_path) else None
        return None
    except Exception:
        return None


def main():
    output_dir = os.environ.get("OUTPUT_DIR", "/workspace/output")
    pptx_path = build_presentation(output_dir)
    pdf_path = try_export_pdf(pptx_path)
    print(f"PPTX:\t{pptx_path}")
    print(f"PDF:\t{pdf_path if pdf_path else 'PDF export not available'}")


if __name__ == "__main__":
    main()

