import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.schemas import SaveRecipeRequest, SavedRecipe, SavedRecipesResponse
from app.services import dynamo
from app.dependencies import require_api_key
from datetime import datetime

router = APIRouter(prefix="/recipes", tags=["recipes"])


@router.get(
    "/{user_id}",
    response_model=SavedRecipesResponse,
    summary="Get all saved recipes for a user",
    dependencies=[Depends(require_api_key)],
)
async def list_recipes(user_id: str) -> SavedRecipesResponse:
    items = dynamo.get_recipes(user_id)
    recipes = [
        SavedRecipe(
            recipe_id=item["recipe_id"],
            user_id=item["user_id"],
            recipe=item["recipe"],
            saved_at=datetime.fromisoformat(item["saved_at"]),
        )
        for item in items
    ]
    return SavedRecipesResponse(recipes=recipes, count=len(recipes))


@router.post(
    "/{user_id}",
    response_model=SavedRecipe,
    status_code=status.HTTP_201_CREATED,
    summary="Save a recipe for a user",
    dependencies=[Depends(require_api_key)],
)
async def save_recipe(user_id: str, body: SaveRecipeRequest) -> SavedRecipe:
    recipe_id = str(uuid.uuid4())
    item = dynamo.save_recipe(
        user_id=user_id,
        recipe_id=recipe_id,
        recipe=body.recipe.model_dump(),
    )
    return SavedRecipe(
        recipe_id=recipe_id,
        user_id=user_id,
        recipe=body.recipe,
        saved_at=datetime.fromisoformat(item["saved_at"]),
    )


@router.delete(
    "/{user_id}/{recipe_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a saved recipe",
    dependencies=[Depends(require_api_key)],
)
async def delete_recipe(user_id: str, recipe_id: str):
    deleted = dynamo.delete_recipe(user_id=user_id, recipe_id=recipe_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recipe {recipe_id} not found for user {user_id}",
        )