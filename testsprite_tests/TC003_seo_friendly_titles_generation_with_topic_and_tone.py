import requests

BASE_URL = "http://localhost:5000"
TIMEOUT = 30

def test_seo_friendly_titles_generation_with_topic_and_tone():
    url = f"{BASE_URL}/api/generate/titles"
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "topic": "sustainable gardening",
        "tone": "professional",
        "count": 5
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 200, f"Unexpected status code: {response.status_code}"

    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    # Expecting a list of titles - as per PRD, response shape is not explicitly detailed for this endpoint,
    # so infer that the response returns the list directly, or under a property.
    # We'll check common expected keys or assume simple list returned.

    # If the response is a dictionary containing the titles list, try common keys first:
    if isinstance(data, dict):
        # Try common keys where titles could be found
        titles = None
        if "titles" in data:
            titles = data["titles"]
        elif "data" in data and isinstance(data["data"], dict):
            # perhaps data object contains titles list
            titles = data["data"].get("titles", None)
        else:
            # fallback: check if top-level keys contain list of strings
            for v in data.values():
                if isinstance(v, list) and all(isinstance(i, str) for i in v):
                    titles = v
                    break
    elif isinstance(data, list):
        titles = data
    else:
        titles = None

    assert titles is not None, "Response does not contain titles list"
    assert isinstance(titles, list), "Titles should be returned as a list"
    assert len(titles) == payload["count"], f"Expected {payload['count']} titles, got {len(titles)}"
    for title in titles:
        assert isinstance(title, str), "Each title should be a string"
        assert len(title) > 0, "Title should not be empty"

test_seo_friendly_titles_generation_with_topic_and_tone()