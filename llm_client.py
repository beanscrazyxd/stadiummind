"""
Thin LLM wrapper used by every route in this app.

Cost-control features:
- PROVIDER=mock in .env returns smart canned answers with zero API calls (use this while coding / for a zero-risk demo)
- In-memory cache: identical (system_prompt, user_prompt) pairs are never billed twice
- Cheap model + small max_tokens by default
- The LLM is only ever asked to "explain/summarize" data that Python already computed.
  It never needs to be asked to "fetch" anything -> shorter prompts, fewer tokens.

Switch providers with ONE variable in .env:  PROVIDER = mock | anthropic | gemini | groq
Paste whichever key you're using into the matching *_API_KEY variable in .env.
See .env.example for the exact spot.
"""

import os
import hashlib
import random
from dotenv import load_dotenv

load_dotenv()

PROVIDER = os.getenv("PROVIDER", "mock").lower()  # mock | anthropic | gemini | groq
MAX_TOKENS = int(os.getenv("MAX_TOKENS", "250"))

# Per-provider model defaults (override in .env with MODEL=... if you want)
_DEFAULT_MODELS = {
    "anthropic": "claude-haiku-4-5-20251001",
    "gemini": "gemini-2.5-flash",
    "groq": "llama-3.3-70b-versatile",
}
MODEL = os.getenv("MODEL", _DEFAULT_MODELS.get(PROVIDER, ""))

_client = None
_cache: dict[str, str] = {}


def _cache_key(system_prompt: str, user_prompt: str) -> str:
    return hashlib.sha256(f"{PROVIDER}||{system_prompt}||{user_prompt}".encode()).hexdigest()


# ---------------------------------------------------------------------------
# Mock mode - route-aware canned answers so a demo doesn't look like a stub
# ---------------------------------------------------------------------------

def _mock_fan_response(user_prompt: str) -> str:
    templates = [
        "Based on current stadium data, the nearest option with the shortest wait is just a short walk away. "
        "Staff are on hand near every gate if you need directions.",
        "Here's what I found for you: wait times are moderate right now, so you shouldn't have any trouble. "
        "Let me know if you'd like directions to a specific gate.",
    ]
    return random.choice(templates) + f"\n\n(You asked: \"{user_prompt[:120]}\")"


def _mock_ops_response(user_prompt: str) -> str:
    return (
        "Current metrics look within normal range across most gates, with one zone trending toward "
        "higher density. Recommended action: shift two additional staff to the busiest gate and monitor "
        "for the next 10 minutes.\n\n"
        f"(Question: \"{user_prompt[:120]}\")"
    )


def _mock_incident_response(user_prompt: str) -> str:
    return (
        "Situation: elevated density/queue detected at the flagged gate, consistent with the reported incident.\n"
        "1. Dispatch nearest medical/security resource to the location.\n"
        "2. Open an adjacent gate or lane to redirect crowd flow.\n"
        "3. Post a staff member to actively manage the queue.\n"
        "4. Reassess in 5 minutes.\n\n"
        f"(Incident context: \"{user_prompt[:120]}\")"
    )


def _mock_answer(system_prompt: str, user_prompt: str) -> str:
    sp = system_prompt.lower()
    if "safety coordinator" in sp or "incident" in sp:
        return _mock_incident_response(user_prompt)
    if "operations assistant" in sp:
        return _mock_ops_response(user_prompt)
    return _mock_fan_response(user_prompt)


# ---------------------------------------------------------------------------
# Live providers
# ---------------------------------------------------------------------------

def _get_client():
    """Lazily build the right client for PROVIDER. Only imports the SDK it needs."""
    global _client
    if _client is not None:
        return _client

    if PROVIDER == "anthropic":
        import anthropic
        key = os.getenv("ANTHROPIC_API_KEY")
        if not key:
            raise RuntimeError("ANTHROPIC_API_KEY is missing in .env")
        _client = anthropic.Anthropic(api_key=key)

    elif PROVIDER == "gemini":
        from openai import OpenAI
        key = os.getenv("GEMINI_API_KEY")
        if not key:
            raise RuntimeError("GEMINI_API_KEY is missing in .env")
        _client = OpenAI(
            api_key=key,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        )

    elif PROVIDER == "groq":
        from openai import OpenAI
        key = os.getenv("GROQ_API_KEY")
        if not key:
            raise RuntimeError("GROQ_API_KEY is missing in .env")
        _client = OpenAI(
            api_key=key,
            base_url="https://api.groq.com/openai/v1",
        )

    else:
        raise RuntimeError(f"Unknown PROVIDER '{PROVIDER}' - use mock, anthropic, gemini, or groq")

    return _client


def _call_anthropic(system_prompt: str, user_prompt: str, max_tokens: int) -> str:
    client = _get_client()
    resp = client.messages.create(
        model=MODEL,
        max_tokens=max_tokens,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}],
    )
    return "".join(block.text for block in resp.content if block.type == "text")


def _call_openai_compatible(system_prompt: str, user_prompt: str, max_tokens: int) -> str:
    """Used for both Gemini and Groq - they both speak the OpenAI-compatible chat API."""
    client = _get_client()
    resp = client.chat.completions.create(
        model=MODEL,
        max_tokens=max_tokens,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    )
    return resp.choices[0].message.content


# ---------------------------------------------------------------------------
# Public entry point - this is the only function the rest of the app calls
# ---------------------------------------------------------------------------

def ask_llm(system_prompt: str, user_prompt: str, max_tokens: int = MAX_TOKENS) -> str:
    key = _cache_key(system_prompt, user_prompt)
    if key in _cache:
        return _cache[key]

    if PROVIDER == "mock":
        answer = _mock_answer(system_prompt, user_prompt)
    elif PROVIDER == "anthropic":
        answer = _call_anthropic(system_prompt, user_prompt, max_tokens)
    elif PROVIDER in ("gemini", "groq"):
        answer = _call_openai_compatible(system_prompt, user_prompt, max_tokens)
    else:
        raise RuntimeError(f"Unknown PROVIDER '{PROVIDER}' - use mock, anthropic, gemini, or groq")

    _cache[key] = answer
    return answer
