import requests

def test_ai_content_detection_post_request_with_valid_text():
    base_url = "http://localhost:5000"
    endpoint = "/api/ai/detect"
    url = base_url + endpoint
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "text": (
            "Artificial intelligence (AI) is intelligence demonstrated by machines, "
            "unlike the natural intelligence displayed by humans and animals. Leading AI "
            "text classification models are designed to discern human writing from AI-generated prose "
            "with statistical probability scores."
        )
    }
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
    except requests.RequestException as e:
        assert False, f"Request to {url} failed: {e}"

    assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"
    
    json_response = response.json()
    
    # Validate the main response structure
    assert "statusCode" in json_response and isinstance(json_response["statusCode"], int), "Missing or invalid statusCode"
    assert "message" in json_response and isinstance(json_response["message"], str), "Missing or invalid message"
    assert "data" in json_response and isinstance(json_response["data"], dict), "Missing or invalid data object"

    data = json_response["data"]

    # Validate detection object properties
    detection = data.get("detection")
    assert detection is not None and isinstance(detection, dict), "Missing or invalid detection object"
    assert "aiProbability" in detection and isinstance(detection["aiProbability"], (float, int)), "Missing or invalid aiProbability"
    assert 0.0 <= detection["aiProbability"] <= 1.0, "aiProbability out of range [0,1]"
    assert "humanProbability" in detection and isinstance(detection["humanProbability"], (float, int)), "Missing or invalid humanProbability"
    assert 0.0 <= detection["humanProbability"] <= 1.0, "humanProbability out of range [0,1]"
    assert "verdict" in detection and isinstance(detection["verdict"], str) and detection["verdict"], "Missing or invalid verdict"
    assert "confidence" in detection and isinstance(detection["confidence"], str) and detection["confidence"], "Missing or invalid confidence"

    # Validate analysis object
    analysis = data.get("analysis")
    assert analysis is not None and isinstance(analysis, dict), "Missing or invalid analysis object"

    # Validate indicators is an array of strings
    indicators = data.get("indicators")
    assert indicators is not None and isinstance(indicators, list), "Missing or invalid indicators array"
    for indicator in indicators:
        assert isinstance(indicator, str), "Indicator item not a string"

    # Validate metadata is an object
    metadata = data.get("metadata")
    assert metadata is not None and isinstance(metadata, dict), "Missing or invalid metadata object"

test_ai_content_detection_post_request_with_valid_text()