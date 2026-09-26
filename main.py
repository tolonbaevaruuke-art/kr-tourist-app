import json
import os
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory
from openai import OpenAI


BASE_DIR = Path(__file__).resolve().parent
ASSETS_DIR = BASE_DIR / "attached_assets"


def load_config():
    """Load assistant settings from the project config or attached assets."""
    config_paths = (BASE_DIR / "config.json", ASSETS_DIR / "config.json")
    for config_path in config_paths:
        if not config_path.is_file():
            continue

        try:
            with config_path.open("r", encoding="utf-8") as config_file:
                config = json.load(config_file)
        except (OSError, json.JSONDecodeError) as error:
            raise RuntimeError(f"Не удалось прочитать {config_path}: {error}") from error

        if not isinstance(config, dict):
            raise RuntimeError(f"Файл {config_path} должен содержать JSON-объект")
        return config

    raise RuntimeError("Не найден config.json в корне проекта или в attached_assets")


CONFIG = load_config()
SYSTEM_INSTRUCTIONS = str(CONFIG.get("assistant_instructions", "")).strip()
MODEL = str(CONFIG.get("model") or "gpt-4o-mini")

if not SYSTEM_INSTRUCTIONS:
    raise RuntimeError("В config.json отсутствует assistant_instructions")

app = Flask(__name__, static_folder=str(ASSETS_DIR), static_url_path="/assets")


def get_openai_client():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY не настроен в Replit Secrets")
    return OpenAI(api_key=api_key)


def normalize_messages(payload):
    """Accept either a full messages array or a single message from the UI."""
    raw_messages = payload.get("messages")
    if raw_messages is None and isinstance(payload.get("message"), str):
        raw_messages = [{"role": "user", "content": payload["message"]}]

    if not isinstance(raw_messages, list) or not raw_messages:
        raise ValueError("Ожидается непустой массив messages или поле message")

    messages = []
    for item in raw_messages[-20:]:
        if not isinstance(item, dict):
            continue

        role = item.get("role")
        content = item.get("content")
        if role not in {"user", "assistant"} or not isinstance(content, str):
            continue

        content = content.strip()
        if content:
            messages.append({"role": role, "content": content})

    if not messages:
        raise ValueError("В сообщениях должны быть непустые user/assistant сообщения")
    return messages


@app.post("/api/chat")
def chat():
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"error": "Тело запроса должно быть JSON-объектом"}), 400

    try:
        user_messages = normalize_messages(payload)
    except ValueError as error:
        return jsonify({"error": str(error)}), 400

    try:
        response = get_openai_client().chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_INSTRUCTIONS},
                *user_messages,
            ],
        )
        reply = response.choices[0].message.content
        if not reply:
            raise RuntimeError("OpenAI вернул пустой ответ")
        return jsonify({"reply": reply})
    except RuntimeError as error:
        return jsonify({"error": str(error)}), 503
    except Exception:
        app.logger.exception("OpenAI chat request failed")
        return jsonify({"error": "Не удалось получить ответ от ИИ. Попробуйте ещё раз."}), 502


@app.get("/")
def index():
    return send_from_directory(ASSETS_DIR, "index.html")


@app.get("/favicon.ico")
def favicon():
    return "", 204


@app.get("/<path:filename>")
def static_files(filename):
    return send_from_directory(ASSETS_DIR, filename)


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", "5000")),
        debug=False,
    )
