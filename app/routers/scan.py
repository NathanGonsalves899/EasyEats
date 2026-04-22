from fastapi import APIRouter, Depends, HTTPException, status
from app.models.schemas import ScanRequest, ScanResponse
from app.services.claude import detect_ingredients, generate_recipes
from app.dependencies import require_api_key

router = APIRouter(prefix="/scan", tags=["scan"])


@router.post(
    "",
    response_model=ScanResponse,
    summary="Scan fridge image and generate recipes",
    dependencies=[Depends(require_api_key)],
)
async def scan_fridge(body: ScanRequest) -> ScanResponse:
    if not body.image_base64:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="image_base64 is required",
        )

    ingredients = detect_ingredients(body.image_base64)

    if not ingredients:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Could not detect any ingredients. Please try a clearer photo.",
        )

    recipes = generate_recipes(
        ingredients=ingredients,
        dietary_restrictions=body.dietary_restrictions,
        cuisine=body.cuisine,
        serves=body.serves,
    )

    return ScanResponse(ingredients=ingredients, recipes=recipes)