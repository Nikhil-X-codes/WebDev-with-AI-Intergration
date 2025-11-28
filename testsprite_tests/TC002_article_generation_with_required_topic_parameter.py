import requests

BASE_URL = "http://localhost:5000"
TIMEOUT = 30
HEADERS = {"Content-Type": "application/json"}

def test_article_generation_with_required_topic_parameter():
    url = f"{BASE_URL}/api/generate/article"
    payload = {
        "topic": "The future of artificial intelligence",
        "keywords": "AI, machine learning, technology",
        "wordCount": 1000
    }

    try:
        response = requests.post(url, json=payload, headers=HEADERS, timeout=TIMEOUT)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        assert False, f"HTTP request failed: {e}"

    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"

    try:
        data = response.json()
    except ValueError:
        assert False, "Response body is not valid JSON"

    # Validate the presence of essential parts: article content and metadata
    assert "article" in data or "content" in data or "text" in data or isinstance(data, dict), "Response JSON missing expected article content keys"

    # We do not have exact schema but check if output includes some content string roughly matching requested params
    article_text = None
    # Try common keys that might be returned for article text
    if "article" in data and isinstance(data["article"], str):
        article_text = data["article"]
    elif "content" in data and isinstance(data["content"], str):
        article_text = data["content"]
    elif "text" in data and isinstance(data["text"], str):
        article_text = data["text"]
    elif "data" in data and isinstance(data["data"], dict):
        # Nested data object heuristic
        for key in ("article", "content", "text"):
            if key in data["data"] and isinstance(data["data"][key], str):
                article_text = data["data"][key]
                break

    assert article_text is not None and isinstance(article_text, str) and len(article_text) > 0, "Article content is missing or empty in response"

    # Optionally check if word count is roughly close to requested (allow some tolerance, e.g. ±10%)
    word_count_requested = payload["wordCount"]
    article_word_count = len(article_text.split())
    lower_bound = int(word_count_requested * 0.9)
    upper_bound = int(word_count_requested * 1.1)
    assert lower_bound <= article_word_count <= upper_bound, f"Article word count ({article_word_count}) not within ±10% of requested ({word_count_requested})"

    # Check that topic or keywords appear somewhere in the article text (case insensitive)
    assert payload["topic"].lower() in article_text.lower(), "Article text does not contain the topic"
    for kw in payload["keywords"].split(","):
        kw = kw.strip()
        if kw:
            assert kw.lower() in article_text.lower(), f"Article text does not contain keyword: {kw}"

test_article_generation_with_required_topic_parameter()