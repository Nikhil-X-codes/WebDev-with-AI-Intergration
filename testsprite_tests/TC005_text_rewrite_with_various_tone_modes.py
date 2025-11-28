import requests

def test_text_rewrite_with_various_tone_modes():
    base_url = "http://localhost:5000"
    endpoint = f"{base_url}/api/generate/rewrite"
    headers = {"Content-Type": "application/json"}
    timeout = 30
    input_text = "The quick brown fox jumps over the lazy dog."
    modes = ["standard", "formal", "casual", "creative", "concise"]

    for mode in modes:
        payload = {
            "text": input_text,
            "mode": mode
        }
        try:
            response = requests.post(endpoint, json=payload, headers=headers, timeout=timeout)
            response.raise_for_status()
        except requests.RequestException as e:
            assert False, f"Request failed for mode '{mode}': {e}"

        assert response.status_code == 200, f"Expected 200 OK for mode '{mode}', got {response.status_code}"

        try:
            data = response.json()
        except ValueError:
            assert False, f"Response is not valid JSON for mode '{mode}'"

        # Expecting the rewritten text in the response; validate presence and type
        # Based on PRD, the actual schema of response body not fully detailed,
        # but the description "Rewritten output" implies that a string output should be present.
        # We'll check if there's a 'rewrittenText' or similar key or fallback validate response has text.

        # Since no explicit key name is provided, we accept any string value in response body
        # We'll assert that response JSON has at least one string value representing rewritten text.

        # Heuristic: response body should have keys and a non-empty string value(s) indicating rewritten text.
        # We'll check the first string value in the response JSON.

        def find_rewritten_text(obj):
            if isinstance(obj, dict):
                for v in obj.values():
                    result = find_rewritten_text(v)
                    if result:
                        return result
            elif isinstance(obj, list):
                for item in obj:
                    result = find_rewritten_text(item)
                    if result:
                        return result
            elif isinstance(obj, str) and len(obj.strip()) > 0:
                return obj.strip()
            return None

        rewritten_text = find_rewritten_text(data)
        assert rewritten_text is not None, f"No rewritten text found in response for mode '{mode}'"
        # Additional sanity: rewritten text should be different than input text or at least non-empty
        assert len(rewritten_text) > 0, f"Rewritten text is empty for mode '{mode}'"

test_text_rewrite_with_various_tone_modes()