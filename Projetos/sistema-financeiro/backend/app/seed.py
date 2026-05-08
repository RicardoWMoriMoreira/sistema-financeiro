from app.database import SessionLocal
from app.repositories.category_repository import (
    create_category,
    find_category_by_name_and_type,
)
from app.schemas.category import CategoryCreate


DEFAULT_CATEGORIES = [
    {
        "name": "Alimentação",
        "type": "expense",
    },
    {
        "name": "Moradia",
        "type": "expense",
    },
    {
        "name": "Transporte",
        "type": "expense",
    },
    {
        "name": "Trabalho",
        "type": "income",
    },
    {
        "name": "Investimentos",
        "type": "income",
    },
]


def seed_categories() -> None:
    db = SessionLocal()

    try:
        for category_data in DEFAULT_CATEGORIES:
            existing_category = find_category_by_name_and_type(
                db=db,
                name=category_data["name"],
                category_type=category_data["type"],
            )

            if existing_category is not None:
                print(
                    f'Categoria já existe: {category_data["name"]} '
                    f'({category_data["type"]})'
                )
                continue

            category = CategoryCreate(
                name=category_data["name"],
                type=category_data["type"],
            )

            created_category = create_category(
                db=db,
                category=category,
            )

            print(
                f'Categoria criada: {created_category.name} '
                f'({created_category.type})'
            )

    finally:
        db.close()


if __name__ == "__main__":
    seed_categories()