from fastapi import APIRouter, Depends
from app.models.schemas import UserPreferences, PreferencesResponse
from app.services import dynamo
from app.dependencies import require_api_key
from datetime import datetime

router = APIRouter(prefix="/preferences", tags=["preferences"])


@router.get(
    "/{user_id}",
    response_model=PreferencesResponse,
    summary="Get preferences for a user",
    dependencies=[Depends(require_api_key)],
)
async def get_preferences(user_id: str) -> PreferencesResponse:
    item = dynamo.get_preferences(user_id)
    if not item:
        return PreferencesResponse(user_id=user_id)

    return PreferencesResponse(
        user_id=item["user_id"],
        dietary_restrictions=item.get("dietary_restrictions", []),
        cuisine=item.get("cuisine", "Any"),
        serves=int(item.get("serves", 2)),
        updated_at=datetime.fromisoformat(item["updated_at"]) if item.get("updated_at") else None,
    )


@router.put(
    "/{user_id}",
    response_model=PreferencesResponse,
    summary="Update preferences for a user",
    dependencies=[Depends(require_api_key)],
)
async def update_preferences(user_id: str, body: UserPreferences) -> PreferencesResponse:
    item = dynamo.upsert_preferences(
        user_id=user_id,
        prefs=body.model_dump(),
    )
    return PreferencesResponse(
        user_id=user_id,
        dietary_restrictions=item["dietary_restrictions"],
        cuisine=item["cuisine"],
        serves=int(item["serves"]),
        updated_at=datetime.fromisoformat(item["updated_at"]),
    )