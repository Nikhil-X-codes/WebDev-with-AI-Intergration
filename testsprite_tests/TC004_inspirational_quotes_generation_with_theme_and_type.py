import requests

BASE_URL = "http://localhost:5000"
TIMEOUT_SECONDS = 30
HEADERS = {
    "Content-Type": "application/json"
}

def test_inspirational_quotes_generation_with_theme_and_type():
    url = f"{BASE_URL}/api/generate/quotes"
    test_cases = [
        {"theme": "motivation", "type": "quote", "count": 3},
        {"theme": "success", "type": "tagline", "count": 5},
        {"theme": "happiness", "type": "quote", "count": 1},
        {"theme": "teamwork", "type": "tagline", "count": 2},
    ]

    for case in test_cases:
        payload = {
            "theme": case["theme"],
            "type": case["type"],
            "count": case["count"]
        }
        try:
            response = requests.post(url, headers=HEADERS, json=payload, timeout=TIMEOUT_SECONDS)
        except requests.RequestException as e:
            assert False, f"Request failed: {e}"

        assert response.status_code == 200, f"Expected status 200 but got {response.status_code}"
        
        try:
            data = response.json()
        except ValueError:
            assert False, "Response is not valid JSON"

        # The response should include generated quotes/taglines, assume in data field holding a list
        # Since API doc description is brief, check for a field with list of quotes/taglines
        # Heuristics: response JSON keys might be { "quotes": [...]} or similar
        # So check common patterns or fallback to keys with list and count matching

        # Try to find a list in response JSON with length matching 'count'
        list_found = False
        for key, value in data.items():
            if isinstance(value, list):
                list_found = True
                assert len(value) == case["count"], (
                    f"Expected {case['count']} items but got {len(value)} for key '{key}'"
                )
                # Further check non-empty string elements
                for item in value:
                    assert isinstance(item, str) and item.strip(), "Generated item should be non-empty string"
                break
        
        assert list_found, "Response JSON does not contain a list of generated quotes or taglines"


test_inspirational_quotes_generation_with_theme_and_type()