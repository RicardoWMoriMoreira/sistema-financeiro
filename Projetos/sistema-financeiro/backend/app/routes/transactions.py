import csv
import datetime as dt
import io
from decimal import Decimal, InvalidOperation

from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, UploadFile, status
from fastapi.responses import StreamingResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from sqlalchemy.orm import Session

from app.dependencies import get_current_user_id, get_db
from app.rate_limiter import limiter, RATE_LIMIT_READ, RATE_LIMIT_WRITE
from app.repositories import category_repository
from app.schemas.transaction import (
    CsvImportResult,
    ProjectionResponse,
    TransactionGroupActionResponse,
    PaginatedTransactionsResponse,
    TransactionCreate,
    TransactionHistoryResponse,
    TransactionStatusCountsResponse,
    TransactionSummary,
    TransactionUpdate,
    TransactionWithCategoryResponse,
)
from app.utils.datetime import get_brazil_now, get_brazil_today
from app.services.transaction_service import (
    create_transaction,
    delete_installment_group,
    delete_transaction,
    find_transaction_by_id,
    get_financial_projection,
    get_transaction_status_counts,
    get_transactions_history,
    get_transactions_summary,
    list_transactions,
    list_transactions_paginated,
    mark_installment_group_paid,
    update_installment_group,
    update_transaction,
)


router = APIRouter(
    prefix="/transactions",
    tags=["transactions"],
)


def validate_date_range(
    start_date: dt.date | None,
    end_date: dt.date | None,
) -> None:
    if start_date is not None and end_date is not None and start_date > end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A data inicial não pode ser maior que a data final",
        )


@router.get("/export/csv")
@limiter.limit(RATE_LIMIT_READ)
def export_transactions_csv(
    request: Request,
    transaction_type: Literal["income", "expense"] | None = Query(
        default=None,
        alias="type",
    ),
    payment_status: Literal["paid", "pending"] | None = None,
    category_id: int | None = None,
    start_date: dt.date | None = None,
    end_date: dt.date | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    validate_date_range(start_date, end_date)

    transactions = list_transactions(
        db=db,
        user_id=user_id,
        transaction_type=transaction_type,
        payment_status=payment_status,
        category_id=category_id,
        start_date=start_date,
        end_date=end_date,
        search=search,
    )

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["Data", "Descrição", "Categoria", "Tipo", "Valor"])

    for transaction in transactions:
        tipo = "Receita" if transaction.type == "income" else "Despesa"
        categoria = transaction.category.name if transaction.category else ""
        valor = f"{transaction.amount:.2f}".replace(".", ",")

        writer.writerow([
            transaction.date.strftime("%d/%m/%Y"),
            transaction.description,
            categoria,
            tipo,
            valor,
        ])

    output.seek(0)

    filename = f"transacoes_{get_brazil_today().strftime('%Y%m%d')}.csv"

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
        },
    )


@router.post("/import/csv", response_model=CsvImportResult)
@limiter.limit(RATE_LIMIT_WRITE)
async def import_transactions_csv(
    request: Request,
    file: UploadFile,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O arquivo deve ser um CSV",
        )

    content = await file.read()
    try:
        text = content.decode("utf-8")
    except UnicodeDecodeError:
        try:
            text = content.decode("latin-1")
        except UnicodeDecodeError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não foi possível decodificar o arquivo CSV",
            )

    reader = csv.DictReader(io.StringIO(text), delimiter=",")

    imported = 0
    failed = 0
    errors: list[str] = []

    categories_cache: dict[tuple[str, str], int | None] = {}

    for row_num, row in enumerate(reader, start=2):
        try:
            data_str = row.get("data", "").strip()
            descricao = row.get("descrição", row.get("descricao", "")).strip()
            valor_str = row.get("valor", "").strip()
            tipo_str = row.get("tipo", "").strip().lower()
            categoria_str = row.get("categoria", "").strip()

            if not all([data_str, descricao, valor_str, tipo_str, categoria_str]):
                errors.append(f"Linha {row_num}: campos obrigatórios faltando")
                failed += 1
                continue

            try:
                if "/" in data_str:
                    parts = data_str.split("/")
                    if len(parts[0]) == 4:
                        transaction_date = dt.datetime.strptime(data_str, "%Y/%m/%d").date()
                    else:
                        transaction_date = dt.datetime.strptime(data_str, "%d/%m/%Y").date()
                elif "-" in data_str:
                    transaction_date = dt.datetime.strptime(data_str, "%Y-%m-%d").date()
                else:
                    errors.append(f"Linha {row_num}: formato de data inválido")
                    failed += 1
                    continue
            except ValueError:
                errors.append(f"Linha {row_num}: formato de data inválido")
                failed += 1
                continue

            valor_str = valor_str.replace("R$", "").replace(" ", "")
            if "," in valor_str and "." in valor_str:
                valor_str = valor_str.replace(".", "").replace(",", ".")
            elif "," in valor_str:
                valor_str = valor_str.replace(",", ".")

            try:
                amount = Decimal(valor_str)
                if amount <= 0:
                    errors.append(f"Linha {row_num}: valor deve ser positivo")
                    failed += 1
                    continue
            except InvalidOperation:
                errors.append(f"Linha {row_num}: valor inválido")
                failed += 1
                continue

            if tipo_str in ("receita", "income", "entrada"):
                transaction_type: Literal["income", "expense"] = "income"
            elif tipo_str in ("despesa", "expense", "saída", "saida"):
                transaction_type = "expense"
            else:
                errors.append(f"Linha {row_num}: tipo deve ser 'receita' ou 'despesa'")
                failed += 1
                continue

            cache_key = (categoria_str.lower(), transaction_type)
            if cache_key in categories_cache:
                category_id = categories_cache[cache_key]
            else:
                category = category_repository.find_category_by_name_and_type(
                    db=db,
                    name=categoria_str,
                    category_type=transaction_type,
                    user_id=user_id,
                )
                category_id = category.id if category else None
                categories_cache[cache_key] = category_id

            if category_id is None:
                errors.append(
                    f"Linha {row_num}: categoria '{categoria_str}' não encontrada para tipo '{transaction_type}'"
                )
                failed += 1
                continue

            transaction_data = TransactionCreate(
                description=descricao,
                amount=amount,
                type=transaction_type,
                category_id=category_id,
                date=transaction_date,
            )

            result = create_transaction(db=db, transaction=transaction_data, user_id=user_id)
            if result is None:
                errors.append(f"Linha {row_num}: erro ao criar transação")
                failed += 1
            else:
                imported += 1

        except Exception as e:
            errors.append(f"Linha {row_num}: erro inesperado - {str(e)}")
            failed += 1

    return CsvImportResult(
        imported=imported,
        failed=failed,
        errors=errors[:20],
    )


@router.get("/report/pdf")
@limiter.limit(RATE_LIMIT_READ)
def generate_transactions_pdf(
    request: Request,
    transaction_type: Literal["income", "expense"] | None = Query(
        default=None,
        alias="type",
    ),
    payment_status: Literal["paid", "pending"] | None = None,
    category_id: int | None = None,
    start_date: dt.date | None = None,
    end_date: dt.date | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    validate_date_range(start_date, end_date)

    transactions = list_transactions(
        db=db,
        user_id=user_id,
        transaction_type=transaction_type,
        payment_status=payment_status,
        category_id=category_id,
        start_date=start_date,
        end_date=end_date,
        search=search,
    )

    summary = get_transactions_summary(
        db=db,
        user_id=user_id,
        payment_status=payment_status,
        category_id=category_id,
        start_date=start_date,
        end_date=end_date,
    )

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=1.5 * cm,
        leftMargin=1.5 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )

    elements = []
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "CustomTitle",
        parent=styles["Heading1"],
        fontSize=18,
        spaceAfter=20,
        alignment=1,
    )

    if start_date and end_date:
        periodo = f"{start_date.strftime('%d/%m/%Y')} a {end_date.strftime('%d/%m/%Y')}"
    elif start_date:
        periodo = f"A partir de {start_date.strftime('%d/%m/%Y')}"
    elif end_date:
        periodo = f"Até {end_date.strftime('%d/%m/%Y')}"
    else:
        periodo = "Todas as transações"

    title = Paragraph(f"Relatório Financeiro - {periodo}", title_style)
    elements.append(title)
    elements.append(Spacer(1, 0.5 * cm))

    summary_style = ParagraphStyle(
        "SummaryStyle",
        parent=styles["Normal"],
        fontSize=11,
        spaceAfter=6,
    )

    summary_data = [
        ["Resumo Financeiro", ""],
        ["Total de Receitas:", f"R$ {summary.total_income:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")],
        ["Total de Despesas:", f"R$ {summary.total_expense:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")],
        ["Saldo:", f"R$ {summary.balance:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")],
    ]

    summary_table = Table(summary_data, colWidths=[6 * cm, 5 * cm])
    summary_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e293b")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("ALIGN", (1, 1), (1, -1), "RIGHT"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 10),
        ("TOPPADDING", (0, 0), (-1, 0), 10),
        ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#f1f5f9")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#94a3b8")),
        ("SPAN", (0, 0), (1, 0)),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 1 * cm))

    table_data = [["Data", "Descrição", "Categoria", "Tipo", "Valor"]]

    for transaction in transactions:
        tipo = "Receita" if transaction.type == "income" else "Despesa"
        categoria = transaction.category.name if transaction.category else "-"
        valor = f"R$ {transaction.amount:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")

        descricao = transaction.description
        if len(descricao) > 40:
            descricao = descricao[:37] + "..."

        table_data.append([
            transaction.date.strftime("%d/%m/%Y"),
            descricao,
            categoria,
            tipo,
            valor,
        ])

    col_widths = [2.5 * cm, 7 * cm, 3.5 * cm, 2 * cm, 3 * cm]
    transactions_table = Table(table_data, colWidths=col_widths, repeatRows=1)

    table_style = TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e293b")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("ALIGN", (4, 0), (4, -1), "RIGHT"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
        ("TOPPADDING", (0, 0), (-1, 0), 8),
        ("BOTTOMPADDING", (0, 1), (-1, -1), 5),
        ("TOPPADDING", (0, 1), (-1, -1), 5),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#94a3b8")),
    ])

    for i in range(1, len(table_data)):
        if i % 2 == 0:
            table_style.add("BACKGROUND", (0, i), (-1, i), colors.HexColor("#f1f5f9"))
        else:
            table_style.add("BACKGROUND", (0, i), (-1, i), colors.white)

    transactions_table.setStyle(table_style)
    elements.append(Paragraph(f"Transações ({len(transactions)} registros)", styles["Heading3"]))
    elements.append(Spacer(1, 0.3 * cm))
    elements.append(transactions_table)
    elements.append(Spacer(1, 1 * cm))

    footer_style = ParagraphStyle(
        "FooterStyle",
        parent=styles["Normal"],
        fontSize=8,
        textColor=colors.HexColor("#64748b"),
        alignment=2,
    )
    footer = Paragraph(
        f"Relatório gerado em {get_brazil_now().strftime('%d/%m/%Y às %H:%M')}",
        footer_style,
    )
    elements.append(footer)

    doc.build(elements)
    buffer.seek(0)

    filename = f"relatorio_financeiro_{get_brazil_today().strftime('%Y%m%d')}.pdf"

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
        },
    )


@router.get("", response_model=list[TransactionWithCategoryResponse])
@limiter.limit(RATE_LIMIT_READ)
def get_transactions(
    request: Request,
    transaction_type: Literal["income", "expense"] | None = Query(
        default=None,
        alias="type",
    ),
    payment_status: Literal["paid", "pending"] | None = None,
    category_id: int | None = None,
    start_date: dt.date | None = None,
    end_date: dt.date | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    validate_date_range(start_date, end_date)

    return list_transactions(
        db=db,
        user_id=user_id,
        transaction_type=transaction_type,
        payment_status=payment_status,
        category_id=category_id,
        start_date=start_date,
        end_date=end_date,
        search=search,
    )


@router.get("/paginated", response_model=PaginatedTransactionsResponse)
@limiter.limit(RATE_LIMIT_READ)
def get_transactions_paginated(
    request: Request,
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=10, ge=1, le=100),
    transaction_type: Literal["income", "expense"] | None = Query(
        default=None,
        alias="type",
    ),
    payment_status: Literal["paid", "pending"] | None = None,
    category_id: int | None = None,
    start_date: dt.date | None = None,
    end_date: dt.date | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    validate_date_range(start_date, end_date)

    return list_transactions_paginated(
        db=db,
        user_id=user_id,
        page=page,
        per_page=per_page,
        transaction_type=transaction_type,
        payment_status=payment_status,
        category_id=category_id,
        start_date=start_date,
        end_date=end_date,
        search=search,
    )


@router.get("/summary", response_model=TransactionSummary)
@limiter.limit(RATE_LIMIT_READ)
def get_summary(
    request: Request,
    payment_status: Literal["paid", "pending"] | None = None,
    category_id: int | None = None,
    start_date: dt.date | None = None,
    end_date: dt.date | None = None,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    validate_date_range(start_date, end_date)

    return get_transactions_summary(
        db=db,
        user_id=user_id,
        payment_status=payment_status,
        category_id=category_id,
        start_date=start_date,
        end_date=end_date,
    )


@router.get("/status-counts", response_model=TransactionStatusCountsResponse)
@limiter.limit(RATE_LIMIT_READ)
def get_status_counts(
    request: Request,
    transaction_type: Literal["income", "expense"] | None = Query(
        default=None,
        alias="type",
    ),
    category_id: int | None = None,
    start_date: dt.date | None = None,
    end_date: dt.date | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    validate_date_range(start_date, end_date)

    return get_transaction_status_counts(
        db=db,
        user_id=user_id,
        transaction_type=transaction_type,
        category_id=category_id,
        start_date=start_date,
        end_date=end_date,
        search=search,
    )


@router.get("/projection", response_model=ProjectionResponse)
@limiter.limit(RATE_LIMIT_READ)
def get_projection(
    request: Request,
    history_months: int = Query(default=3, ge=1, le=12),
    projection_months: int = Query(default=3, ge=1, le=6),
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    return get_financial_projection(
        db=db,
        user_id=user_id,
        history_months=history_months,
        projection_months=projection_months,
    )


@router.get("/history", response_model=TransactionHistoryResponse)
@limiter.limit(RATE_LIMIT_READ)
def get_history(
    request: Request,
    period: Literal["6m", "12m", "ytd", "all"] = Query(default="6m"),
    group_by: Literal["day", "week", "month"] = Query(default="month"),
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    return get_transactions_history(
        db=db,
        user_id=user_id,
        period=period,
        group_by=group_by,
    )


@router.get("/{transaction_id}", response_model=TransactionWithCategoryResponse)
@limiter.limit(RATE_LIMIT_READ)
def get_transaction(
    request: Request,
    transaction_id: int,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    transaction = find_transaction_by_id(
        db=db,
        transaction_id=transaction_id,
        user_id=user_id,
    )

    if transaction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transação não encontrada",
        )

    return transaction


@router.post(
    "",
    response_model=TransactionWithCategoryResponse,
    status_code=status.HTTP_201_CREATED,
)
@limiter.limit(RATE_LIMIT_WRITE)
def post_transaction(
    request: Request,
    transaction: TransactionCreate,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    try:
        new_transaction = create_transaction(
            db=db,
            transaction=transaction,
            user_id=user_id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    if new_transaction is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Categoria não encontrada ou incompatível com o tipo da transação",
        )

    return new_transaction


@router.put("/{transaction_id}", response_model=TransactionWithCategoryResponse)
@limiter.limit(RATE_LIMIT_WRITE)
def put_transaction(
    request: Request,
    transaction_id: int,
    transaction_data: TransactionUpdate,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    try:
        transaction = update_transaction(
            db=db,
            transaction_id=transaction_id,
            transaction_data=transaction_data,
            user_id=user_id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    if transaction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transação não encontrada",
        )

    return transaction


@router.delete("/{transaction_id}", response_model=TransactionWithCategoryResponse)
@limiter.limit(RATE_LIMIT_WRITE)
def remove_transaction(
    request: Request,
    transaction_id: int,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    transaction = delete_transaction(
        db=db,
        transaction_id=transaction_id,
        user_id=user_id,
    )

    if transaction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transação não encontrada",
        )

    return transaction


@router.put("/installments/{group_id}", response_model=TransactionGroupActionResponse)
@limiter.limit(RATE_LIMIT_WRITE)
def put_installment_group(
    request: Request,
    group_id: str,
    transaction_data: TransactionUpdate,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    try:
        result = update_installment_group(
            db=db,
            group_id=group_id,
            transaction_data=transaction_data,
            user_id=user_id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Grupo de parcelas não encontrado",
        )

    return result


@router.patch("/installments/{group_id}/mark-paid", response_model=TransactionGroupActionResponse)
@limiter.limit(RATE_LIMIT_WRITE)
def patch_installment_group_paid(
    request: Request,
    group_id: str,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    result = mark_installment_group_paid(
        db=db,
        group_id=group_id,
        user_id=user_id,
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Grupo de parcelas não encontrado",
        )

    return result


@router.delete("/installments/{group_id}", response_model=TransactionGroupActionResponse)
@limiter.limit(RATE_LIMIT_WRITE)
def delete_installment_group_route(
    request: Request,
    group_id: str,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    result = delete_installment_group(
        db=db,
        group_id=group_id,
        user_id=user_id,
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Grupo de parcelas não encontrado",
        )

    return result