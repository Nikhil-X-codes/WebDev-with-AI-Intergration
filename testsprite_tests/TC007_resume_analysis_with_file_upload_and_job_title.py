import requests
import io

BASE_URL = "http://localhost:5000"
TIMEOUT = 30

def test_resume_analysis_with_file_upload_and_job_title():
    endpoint = f"{BASE_URL}/api/classify/resume"
    headers = {}
    job_title = "Software Engineer"
    
    # Prepare a sample resume file content (basic resume text in bytes)
    sample_resume_content = (
        "John Doe\n"
        "Software Engineer\n"
        "Experience:\n"
        "- Developed scalable web applications\n"
        "- Worked with Python, JavaScript, and Node.js\n"
        "Education:\n"
        "BSc Computer Science\n"
    ).encode('utf-8')
    
    file_like = io.BytesIO(sample_resume_content)
    file_like.name = "sample_resume.txt"
    files = {'file': (file_like.name, file_like, 'text/plain')}
    data = {'jobTitle': job_title}
    
    response = requests.post(endpoint, headers=headers, files=files, data=data, timeout=TIMEOUT)
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    resp_json = response.json()
    
    # Validate keys in response
    assert "statusCode" in resp_json and resp_json["statusCode"] == 200
    assert "message" in resp_json
    assert "data" in resp_json and isinstance(resp_json["data"], dict)
    
    data_field = resp_json["data"]
    # Expect some kind of insights in data
    assert any(k in data_field for k in ("resumeInsights", "analysis", "score", "match", "details")) or len(data_field) > 0


test_resume_analysis_with_file_upload_and_job_title()