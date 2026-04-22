from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ── Scan ──────────────────────────────────────────────────────────────────────

class ScanRequest(BaseModel):
    image_base64: str = Field(..., description="Base64 encoded fridge image")
    user_id: str
    dietary_restrictions: list[str] = Field(default_factory=list)
    cuisine: str = "Any"
    serves: int = Field(default=2, ge=1, le=10)


class Ingredient(BaseModel):
    name: str
    days_left: int
    category: str


class Nutrition(BaseModel):
    calories: str
    protein: str
    carbs: str
    fat: str


class Recipe(BaseModel):
    name: str
    time: str
    serves: str
    difficulty: str
    cuisine: str
    meal_type: str
    urgency_score: int = Field(ge=0, le=100)
    urgent_ingredients: list[str]
    urgency_reasoning: str
    steps: list[str]
    nutrition: Nutrition


class ScanResponse(BaseModel):
    ingredients: list[Ingredient]
    recipes: list[Recipe]
    scanned_at: datetime = Field(default_factory=datetime.utcnow)


# ── Saved Recipes ─────────────────────────────────────────────────────────────

class SaveRecipeRequest(BaseModel):
    recipe: Recipe


class SavedRecipe(BaseModel):
    recipe_id: str
    user_id: str
    recipe: Recipe
    saved_at: datetime


class SavedRecipesResponse(BaseModel):
    recipes: list[SavedRecipe]
    count: int


# ── Preferences ───────────────────────────────────────────────────────────────

class UserPreferences(BaseModel):
    dietary_restrictions: list[str] = Field(default_factory=list)
    cuisine: str = "Any"
    serves: int = Field(default=2, ge=1, le=10)


class PreferencesResponse(UserPreferences):
    user_id: str
    updated_at: Optional[datetime] = None

# ── Health ────────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str = "ok"
    dynamo: str = "unknown"
    anthropic: str = "configured"