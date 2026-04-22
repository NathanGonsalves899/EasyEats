import json
import anthropic
from app.config import get_settings
from app.models.schemas import Ingredient, Recipe

settings = get_settings()
_client = None


def get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        _client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    return _client


# ── Vision: detect ingredients ────────────────────────────────────────────────

VISION_PROMPT = """You are a computer vision system analysing a fridge photo for EasyEats.
Identify all visible food ingredients, produce, drinks, condiments and leftovers.
For each item estimate how many days until it expires based on typical shelf life.

Return ONLY valid JSON, no explanation, no markdown:
{"ingredients":[{"name":"string","days_left":number,"category":"produce|dairy|meat|leftover|condiment|other"}]}"""


def detect_ingredients(image_base64: str) -> list[Ingredient]:
    client = get_client()

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1000,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/jpeg",
                            "data": image_base64,
                        },
                    },
                    {"type": "text", "text": VISION_PROMPT},
                ],
            }
        ],
    )

    raw = "".join(b.text for b in message.content if hasattr(b, "text"))

    try:
        data = json.loads(raw.strip())
        ingredients = data.get("ingredients", [])
    except json.JSONDecodeError:
        ingredients = []

    ingredients.sort(key=lambda x: x.get("days_left", 99))
    return [Ingredient(**i) for i in ingredients]


# ── Recipe generation ─────────────────────────────────────────────────────────

RECIPE_PROMPT = """You are a professional chef and nutritionist for EasyEats, an app that reduces food waste.
Generate exactly 3 recipes using the ingredients provided.
ALWAYS prioritise ingredients marked URGENT or USE SOON.
Return ONLY valid JSON, no explanation, no markdown:
{{
  "recipes": [{{
    "name": "string",
    "time": "25 mins",
    "serves": "2 people",
    "difficulty": "Easy|Medium|Hard",
    "cuisine": "string",
    "meal_type": "Breakfast|Lunch|Dinner|Snack",
    "urgency_score": 85,
    "urgent_ingredients": ["item1"],
    "urgency_reasoning": "one sentence explaining why this uses urgent items",
    "steps": ["step 1", "step 2", "step 3", "step 4"],
    "nutrition": {{"calories": "450kcal", "protein": "22g", "carbs": "38g", "fat": "18g"}}
  }}]
}}"""


def generate_recipes(
    ingredients: list[Ingredient],
    dietary_restrictions: list[str],
    cuisine: str,
    serves: int,
) -> list[Recipe]:
    client = get_client()

    ing_lines = []
    for ing in ingredients:
        if ing.days_left <= 2:
            flag = "URGENT"
        elif ing.days_left <= 5:
            flag = "USE SOON"
        else:
            flag = "OK"
        ing_lines.append(f"- {ing.name} ({ing.days_left} days left) [{flag}]")

    dietary = ", ".join(dietary_restrictions) if dietary_restrictions else "None"
    ingredient_list = "\n".join(ing_lines)

    user_message = f"""Ingredients:\n{ingredient_list}

Dietary restrictions: {dietary}
Preferred cuisine: {cuisine}
Serves: {serves} people

{RECIPE_PROMPT}"""

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1000,
        messages=[{"role": "user", "content": user_message}],
    )

    raw = "".join(b.text for b in message.content if hasattr(b, "text"))

    try:
        data = json.loads(raw.strip())
        recipes = data.get("recipes", [])
    except json.JSONDecodeError:
        recipes = []

    recipes.sort(key=lambda r: r.get("urgency_score", 0), reverse=True)
    return [Recipe(**r) for r in recipes]