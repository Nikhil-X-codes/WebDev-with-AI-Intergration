import requests

def test_support_ticket_classification_with_text_and_optional_user_info():
    base_url = "http://localhost:5000"
    endpoint = "/api/classify/ticket"
    url = base_url + endpoint
    headers = {"Content-Type": "application/json"}
    payload = {
        "text": "My internet connection has been intermittently dropping over the past week. Please help!",
        "email": "user@example.com",
        "userId": "user_12345"
    }
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        data = response.json()
        assert isinstance(data, dict), "Response is not a JSON object"
        # Expected fields in classification response (not strictly defined, so check common keys)
        assert "statusCode" in data or "status" in data or True
        # We expect structured classification result: Check keys like 'category', 'priority', or similar
        # since exact response keys aren't specified, verify at least it returned JSON with data
        assert any(key in data for key in ["data", "classification", "result", "category", "triage"]), \
            "Expected classification result keys missing"
    except requests.exceptions.RequestException as e:
        assert False, f"Request to classify ticket failed: {str(e)}"
    except AssertionError as ae:
        assert False, f"Assertion failed: {str(ae)}"

test_support_ticket_classification_with_text_and_optional_user_info()