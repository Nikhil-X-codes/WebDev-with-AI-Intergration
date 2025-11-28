import requests

BASE_URL = "http://localhost:5000"
ENDPOINT = "/api/classify/sentiment"
TIMEOUT = 30

def test_sentiment_scoring_with_text_input():
    url = BASE_URL + ENDPOINT
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "text": "I really love using this product! It has improved my workflow tremendously."
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"

    try:
        json_data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert isinstance(json_data, dict), "Response JSON is not a dictionary"

    # Expecting 'data' object containing 'label' and 'confidence'
    assert 'data' in json_data, "'data' key not found in response"
    data = json_data['data']
    assert isinstance(data, dict), "'data' is not a dictionary"

    assert 'label' in data, "'label' key not found in data"
    sentiment = data['label']
    assert isinstance(sentiment, str), "Sentiment label is not a string"
    accepted_labels = ["positive", "negative", "neutral", "very positive", "very negative"]
    assert sentiment.lower() in accepted_labels, f"Unexpected sentiment label: {sentiment}"

    assert 'confidence' in data, "'confidence' key not found in data"
    confidence = data['confidence']
    assert isinstance(confidence, (float, int)), "Confidence score is not numeric"
    assert 0 <= confidence <= 1, f"Confidence score out of range: {confidence}"


test_sentiment_scoring_with_text_input()
