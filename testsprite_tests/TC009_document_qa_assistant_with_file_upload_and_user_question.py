import requests
import io

def test_tc009_document_qa_assistant_with_file_upload_and_user_question():
    base_url = "http://localhost:5000"
    endpoint = f"{base_url}/api/assistant/respond"
    timeout = 30
    headers = {}

    # Prepare a simple document content for upload (a small text file)
    document_content = b"Python is a high-level programming language. It is widely used for web development, data analysis, AI, and more."
    file_tuple = ('test_document.txt', io.BytesIO(document_content), 'text/plain')

    user_question = "What is Python used for?"

    try:
        files = {
            'file': file_tuple
        }
        data = {
            'user_input': user_question
        }

        response = requests.post(endpoint, files=files, data=data, headers=headers, timeout=timeout)
        assert response.status_code == 200, f"Expected status 200 but got {response.status_code}"
        json_response = response.json()

        # Validate response contains AI-generated answer related to the document content
        assert 'answer' in json_response or 'data' in json_response, "Response missing expected answer data"

        # Heuristic checks on answer presence and type
        answer_text = None
        if 'answer' in json_response:
            answer_text = json_response['answer']
        elif 'data' in json_response and isinstance(json_response['data'], dict):
            # Try to find answer inside data object
            for key in ['answer', 'response', 'content']:
                if key in json_response['data']:
                    answer_text = json_response['data'][key]
                    break

        assert answer_text is not None, "Answer text not found in response"
        assert isinstance(answer_text, str), "Answer text should be a string"
        assert len(answer_text.strip()) > 0, "Answer text is empty"

        # Check that the answer is related to the document context (basic containment check)
        # We'll check it contains the word 'Python' since that is the core content
        assert "Python" in answer_text or "python" in answer_text, "Answer does not appear grounded in document content"

    except requests.RequestException as e:
        assert False, f"Request failed: {str(e)}"


test_tc009_document_qa_assistant_with_file_upload_and_user_question()