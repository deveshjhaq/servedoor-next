"""
Invoice PDF generation service using ReportLab
Generates styled HTML-like PDF invoices for serveDoor orders
"""
import io
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm, cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER
from reportlab.graphics.shapes import Drawing, Rect, String
from reportlab.graphics import renderPDF
import logging

logger = logging.getLogger(__name__)

# Brand colors
ORANGE = colors.HexColor('#FF5200')
DARK = colors.HexColor('#1C1C1C')
GRAY = colors.HexColor('#686B78')
LIGHT_GRAY = colors.HexColor('#F5F5F5')
GREEN = colors.HexColor('#008000')
WHITE = colors.white


def generate_invoice_pdf(order: dict, customer: dict) -> bytes:
    """
    Generate a styled PDF invoice for an order.
    Returns PDF as bytes.
    """
    buffer = io.BytesIO()
    
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=20*mm,
        leftMargin=20*mm,
        topMargin=20*mm,
        bottomMargin=20*mm
    )
    
    styles = getSampleStyleSheet()
    story = []

    # ── Header: Logo + Title ──────────────────────────────────────────────────
    header_style = ParagraphStyle(
        'HeaderBrand',
        parent=styles['Heading1'],
        textColor=ORANGE,
        fontSize=28,
        fontName='Helvetica-Bold',
        spaceAfter=2
    )
    sub_style = ParagraphStyle(
        'Sub',
        parent=styles['Normal'],
        textColor=GRAY,
        fontSize=9,
        fontName='Helvetica',
        spaceAfter=0
    )
    
    header_data = [
        [Paragraph('<b>serveDoor</b>', header_style),
         Paragraph('<b>TAX INVOICE</b>', ParagraphStyle(
             'TaxInvoice', parent=styles['Heading2'],
             textColor=DARK, fontSize=16, fontName='Helvetica-Bold', alignment=TA_RIGHT
         ))]
    ]
    header_table = Table(header_data, colWidths=[90*mm, 90*mm])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(header_table)
    story.append(Paragraph('Fast food delivery, delivered with care', sub_style))
    story.append(Spacer(1, 4*mm))

    # ── Orange divider ────────────────────────────────────────────────────────
    story.append(HRFlowable(width='100%', thickness=3, color=ORANGE, spaceAfter=6*mm))

    # ── Invoice Meta + Bill To ─────────────────────────────────────────────────
    order_date = order.get('createdAt', datetime.utcnow())
    if isinstance(order_date, str):
        try:
            order_date = datetime.fromisoformat(order_date.replace('Z', '+00:00'))
        except Exception:
            order_date = datetime.utcnow()

    meta_style = ParagraphStyle('Meta', parent=styles['Normal'], fontSize=9, fontName='Helvetica')
    bold_meta = ParagraphStyle('BoldMeta', parent=styles['Normal'], fontSize=9, fontName='Helvetica-Bold')
    
    delivery_address = order.get('deliveryAddress', {})
    address_str = delivery_address.get('fullAddress', '') if isinstance(delivery_address, dict) else str(delivery_address)
    city_str = delivery_address.get('city', 'Mumbai') if isinstance(delivery_address, dict) else ''

    meta_left = [
        [Paragraph('<b>Bill To:</b>', bold_meta)],
        [Paragraph(customer.get('name', 'Customer'), meta_style)],
        [Paragraph(customer.get('phone', ''), meta_style)],
        [Paragraph(address_str[:60] + ('...' if len(address_str) > 60 else ''), meta_style)],
        [Paragraph(city_str, meta_style)],
    ]
    meta_right = [
        [Paragraph('<b>Invoice No:</b>', bold_meta), Paragraph(f"INV-{order.get('orderId', 'N/A')[-8:].upper()}", meta_style)],
        [Paragraph('<b>Order ID:</b>', bold_meta), Paragraph(order.get('orderId', 'N/A'), meta_style)],
        [Paragraph('<b>Date:</b>', bold_meta), Paragraph(order_date.strftime('%d %b %Y, %I:%M %p'), meta_style)],
        [Paragraph('<b>Payment:</b>', bold_meta), Paragraph(order.get('paymentMethod', 'COD').upper(), meta_style)],
        [Paragraph('<b>Status:</b>', bold_meta), Paragraph(order.get('status', 'placed').upper(), meta_style)],
    ]

    left_table = Table(meta_left, colWidths=[85*mm])
    left_table.setStyle(TableStyle([
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ('TOPPADDING', (0, 0), (-1, -1), 1),
    ]))

    right_table = Table(meta_right, colWidths=[30*mm, 55*mm])
    right_table.setStyle(TableStyle([
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ('TOPPADDING', (0, 0), (-1, -1), 1),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
    ]))

    meta_outer = Table([[left_table, right_table]], colWidths=[90*mm, 90*mm])
    meta_outer.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(meta_outer)
    story.append(Spacer(1, 6*mm))

    # ── Restaurant Name ───────────────────────────────────────────────────────
    rest_style = ParagraphStyle(
        'RestName', parent=styles['Normal'],
        fontSize=11, fontName='Helvetica-Bold',
        textColor=WHITE,
        backColor=DARK,
        borderPad=5,
        leading=16
    )
    story.append(Paragraph(f"  {order.get('restaurantName', 'Restaurant')}", rest_style))
    story.append(Spacer(1, 4*mm))

    # ── Items Table ───────────────────────────────────────────────────────────
    item_header_style = ParagraphStyle('IH', parent=styles['Normal'], fontSize=9,
                                        fontName='Helvetica-Bold', textColor=WHITE)
    item_style = ParagraphStyle('IS', parent=styles['Normal'], fontSize=9, fontName='Helvetica')
    item_sub_style = ParagraphStyle('ISS', parent=styles['Normal'], fontSize=8,
                                    fontName='Helvetica', textColor=GRAY)

    table_data = [
        [
            Paragraph('#', item_header_style),
            Paragraph('Item', item_header_style),
            Paragraph('Type', item_header_style),
            Paragraph('Qty', item_header_style),
            Paragraph('Rate', item_header_style),
            Paragraph('Amount', item_header_style),
        ]
    ]

    items = order.get('items', [])
    for i, item in enumerate(items, 1):
        is_veg = item.get('isVeg', True)
        veg_indicator = '[V]' if is_veg else '[NV]'
        veg_color = colors.HexColor('#00AA00') if is_veg else colors.HexColor('#CC0000')
        veg_para = Paragraph(
            f'<font color="{"#00AA00" if is_veg else "#CC0000"}">{veg_indicator}</font>',
            item_style
        )
        qty = item.get('quantity', 1)
        price = item.get('price', 0)
        amount = qty * price
        
        customizations = item.get('customizations', [])
        item_name = item.get('menuItemName', '')
        if customizations:
            item_name_para = Paragraph(
                f'{item_name}<br/><font color="#686B78" size="8">{", ".join(customizations)}</font>',
                item_style
            )
        else:
            item_name_para = Paragraph(item_name, item_style)

        table_data.append([
            Paragraph(str(i), item_style),
            item_name_para,
            veg_para,
            Paragraph(str(qty), item_style),
            Paragraph(f'₹{price:.2f}', item_style),
            Paragraph(f'₹{amount:.2f}', item_style),
        ])

    col_widths = [8*mm, 75*mm, 12*mm, 12*mm, 20*mm, 22*mm]
    items_table = Table(table_data, colWidths=col_widths, repeatRows=1)
    items_table.setStyle(TableStyle([
        # Header row
        ('BACKGROUND', (0, 0), (-1, 0), DARK),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
        ('TOPPADDING', (0, 0), (-1, 0), 6),
        # Data rows alternating
        ('BACKGROUND', (0, 1), (-1, -1), WHITE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, LIGHT_GRAY]),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 5),
        ('TOPPADDING', (0, 1), (-1, -1), 5),
        # Alignment
        ('ALIGN', (0, 0), (0, -1), 'CENTER'),
        ('ALIGN', (2, 0), (2, -1), 'CENTER'),
        ('ALIGN', (3, 0), (3, -1), 'CENTER'),
        ('ALIGN', (4, 0), (4, -1), 'RIGHT'),
        ('ALIGN', (5, 0), (5, -1), 'RIGHT'),
        # Grid
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E0E0E0')),
        ('LINEBELOW', (0, 0), (-1, 0), 1.5, ORANGE),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(items_table)
    story.append(Spacer(1, 4*mm))

    # ── Price Summary ─────────────────────────────────────────────────────────
    subtotal = order.get('subtotal', 0)
    delivery_fee = order.get('deliveryFee', 0)
    discount = order.get('discount', 0)
    taxes = order.get('taxes', 0)
    total = order.get('total', 0)

    right_style = ParagraphStyle('RS', parent=styles['Normal'], fontSize=9,
                                  fontName='Helvetica', alignment=TA_RIGHT)
    right_bold = ParagraphStyle('RB', parent=styles['Normal'], fontSize=11,
                                 fontName='Helvetica-Bold', alignment=TA_RIGHT, textColor=DARK)
    left_label = ParagraphStyle('LL', parent=styles['Normal'], fontSize=9,
                                  fontName='Helvetica', textColor=GRAY)

    summary_data = [
        [Paragraph('Subtotal', left_label), Paragraph(f'₹{subtotal:.2f}', right_style)],
        [Paragraph('Delivery Fee', left_label), Paragraph(f'₹{delivery_fee:.2f}', right_style)],
    ]
    if discount > 0:
        summary_data.append([
            Paragraph('Discount', ParagraphStyle('Disc', parent=styles['Normal'], fontSize=9,
                                                   fontName='Helvetica', textColor=GREEN)),
            Paragraph(f'-₹{discount:.2f}', ParagraphStyle('DiscV', parent=styles['Normal'],
                                                             fontSize=9, fontName='Helvetica',
                                                             alignment=TA_RIGHT, textColor=GREEN))
        ])
    summary_data.append([Paragraph('Taxes & Charges', left_label), Paragraph(f'₹{taxes:.2f}', right_style)])

    total_data = [
        [Paragraph('<b>Total Amount</b>', right_bold), Paragraph(f'<b>₹{total:.2f}</b>', right_bold)]
    ]

    # Position summary table to right
    summary_left = Table([['']], colWidths=[100*mm])
    summary_table = Table(summary_data, colWidths=[55*mm, 25*mm])
    summary_table.setStyle(TableStyle([
        ('BOTTOMPADDING', (0, 0), (-1, -2), 3),
        ('TOPPADDING', (0, 0), (-1, -2), 3),
        ('LINEABOVE', (0, 0), (-1, 0), 0.5, colors.HexColor('#E0E0E0')),
        ('LINEBELOW', (0, -1), (-1, -1), 0.5, colors.HexColor('#E0E0E0')),
    ]))

    total_table = Table(total_data, colWidths=[55*mm, 25*mm])
    total_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), ORANGE),
        ('TEXTCOLOR', (0, 0), (-1, -1), WHITE),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (0, -1), 8),
        ('RIGHTPADDING', (1, 0), (1, -1), 8),
    ]))

    outer_summary = Table(
        [[summary_left, summary_table]],
        colWidths=[100*mm, 80*mm]
    )
    outer_summary.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP')]))
    story.append(outer_summary)
    story.append(Spacer(1, 2*mm))

    outer_total = Table(
        [['', total_table]],
        colWidths=[100*mm, 80*mm]
    )
    outer_total.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP')]))
    story.append(outer_total)
    story.append(Spacer(1, 8*mm))

    # ── Footer ────────────────────────────────────────────────────────────────
    story.append(HRFlowable(width='100%', thickness=1, color=LIGHT_GRAY, spaceAfter=4*mm))
    footer_style = ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8,
                                   fontName='Helvetica', textColor=GRAY, alignment=TA_CENTER)
    story.append(Paragraph(
        'Thank you for ordering with <b>serveDoor</b>! '
        'For support: support@servedoor.com | This is a computer generated invoice.',
        footer_style
    ))

    # ── Build ────────────────────────────────────────────────────────────────
    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
