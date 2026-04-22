import boto3
from datetime import datetime
from typing import Optional
from botocore.exceptions import ClientError
from app.config import get_settings

settings = get_settings()


def get_dynamo_resource():
    return boto3.resource(
        "dynamodb",
        region_name=settings.aws_region,
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key,
    )


def get_dynamo_client():
    return boto3.client(
        "dynamodb",
        region_name=settings.aws_region,
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key,
    )


# ── Table bootstrap ───────────────────────────────────────────────────────────

def create_tables():
    client = get_dynamo_client()

    tables = [
        {
            "TableName": settings.dynamo_recipes_table,
            "KeySchema": [
                {"AttributeName": "user_id", "KeyType": "HASH"},
                {"AttributeName": "recipe_id", "KeyType": "RANGE"},
            ],
            "AttributeDefinitions": [
                {"AttributeName": "user_id", "AttributeType": "S"},
                {"AttributeName": "recipe_id", "AttributeType": "S"},
            ],
            "BillingMode": "PAY_PER_REQUEST",
        },
        {
            "TableName": settings.dynamo_prefs_table,
            "KeySchema": [
                {"AttributeName": "user_id", "KeyType": "HASH"},
            ],
            "AttributeDefinitions": [
                {"AttributeName": "user_id", "AttributeType": "S"},
            ],
            "BillingMode": "PAY_PER_REQUEST",
        },
        {
            "TableName": "easyeats-users",
            "KeySchema": [
                {"AttributeName": "email", "KeyType": "HASH"},
            ],
            "AttributeDefinitions": [
                {"AttributeName": "email", "AttributeType": "S"},
            ],
            "BillingMode": "PAY_PER_REQUEST",
        },

    ]

    for table_def in tables:
        try:
            client.create_table(**table_def)
            print(f"✅ Created table: {table_def['TableName']}")
        except ClientError as e:
            if e.response["Error"]["Code"] == "ResourceInUseException":
                print(f"ℹ️  Table already exists: {table_def['TableName']}")
            else:
                raise


# ── Recipes ───────────────────────────────────────────────────────────────────

def save_recipe(user_id: str, recipe_id: str, recipe: dict) -> dict:
    table = get_dynamo_resource().Table(settings.dynamo_recipes_table)
    item = {
        "user_id": user_id,
        "recipe_id": recipe_id,
        "recipe": recipe,
        "saved_at": datetime.utcnow().isoformat(),
    }
    table.put_item(Item=item)
    return item


def get_recipes(user_id: str) -> list[dict]:
    table = get_dynamo_resource().Table(settings.dynamo_recipes_table)
    response = table.query(
        KeyConditionExpression=boto3.dynamodb.conditions.Key("user_id").eq(user_id)
    )
    return response.get("Items", [])


def delete_recipe(user_id: str, recipe_id: str) -> bool:
    table = get_dynamo_resource().Table(settings.dynamo_recipes_table)
    try:
        table.delete_item(
            Key={"user_id": user_id, "recipe_id": recipe_id},
            ConditionExpression="attribute_exists(recipe_id)",
        )
        return True
    except ClientError as e:
        if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
            return False
        raise


# ── Preferences ───────────────────────────────────────────────────────────────

def get_preferences(user_id: str) -> Optional[dict]:
    table = get_dynamo_resource().Table(settings.dynamo_prefs_table)
    response = table.get_item(Key={"user_id": user_id})
    return response.get("Item")


def upsert_preferences(user_id: str, prefs: dict) -> dict:
    table = get_dynamo_resource().Table(settings.dynamo_prefs_table)
    item = {
        "user_id": user_id,
        "updated_at": datetime.utcnow().isoformat(),
        **prefs,
    }
    table.put_item(Item=item)
    return item

# ── Users ─────────────────────────────────────────────────────────────────

def create_user(user_id: str, name: str, email: str, hashed_password: str) -> dict:
    table = get_dynamo_resource().Table("easyeats-users")
    item = {
        "email": email,
        "user_id": user_id,
        "name": name,
        "hashed_password": hashed_password,
        "created_at": datetime.utcnow().isoformat(),
    }
    table.put_item(Item=item)
    return item


def get_user_by_email(email: str) -> Optional[dict]:
    table = get_dynamo_resource().Table("easyeats-users")
    response = table.get_item(Key={"email": email})
    return response.get("Item")


# ── Health check ──────────────────────────────────────────────────────────────

def check_dynamo_health() -> str:
    try:
        get_dynamo_client().list_tables(Limit=1)
        return "ok"
    except Exception as e:
        return f"error: {str(e)}"