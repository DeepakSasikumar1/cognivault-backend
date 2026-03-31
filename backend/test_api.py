import requests
import time
import json

BASE_URL = "http://127.0.0.1:8001"

def test_enterprise_v230():
    # 1. Requirement 14: Health Check
    print("1. Testing Requirement 14: Health Check...")
    r = requests.get(BASE_URL + "/health")
    print(r.json())

    # 2. Requirement 1: Register
    print("\n2. Registering Employee...")
    r = requests.post(BASE_URL + "/auth/register", json={
        "name": "Employee 1",
        "email": "emp1@cogni.com",
        "role": "Employee",
        "password": "pass"
    })
    if r.status_code == 400: print("Employee already exists.")
    else: print("Employee registered.")

    # 3. Requirement 1: Login
    print("\n3. Logging in...")
    r = requests.post(BASE_URL + "/auth/login", data={"username": "emp1@cogni.com", "password": "pass"})
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 4. Requirement 3: Document Pipeline
    print("\n4. Uploading PDF (Requirement 3)...")
    with open("dummy.pdf", "rb") as f:
        r = requests.post(BASE_URL + "/documents/upload", headers=headers, files={"file": f})
    doc_id = r.json()["id"]
    print(f"Document Uploaded: ID {doc_id}")

    # 5. Requirement 12 & 9: Wait for worker
    print("Waiting for Background Indexer & Auto-tagging (Req 9 & 12)...")
    time.sleep(6)

    # 6. Requirement 8: Summary
    print("\n6. Getting Structured Summary (Requirement 8)...")
    r = requests.get(f"{BASE_URL}/documents/{doc_id}/summary", headers=headers)
    print(json.dumps(r.json(), indent=2))

    # 7. Requirement 7 & 11: Streaming RAG + Tokens
    print("\n7. Testing Streaming RAG (Req 7) & Token Analytics (Req 11)...")
    with requests.post(BASE_URL + "/chat/stream", headers=headers, json={"query": "Hello", "document_id": doc_id}, stream=True) as stream:
        for line in stream.iter_lines():
            if line:
                decoded_line = line.decode('utf-8')
                if decoded_line.startswith("data: "):
                    event_data = decoded_line[6:]
                    if event_data == "[DONE]": break
                    try:
                        payload = json.loads(event_data)
                        print(payload.get('text', ''), end='', flush=True)
                    except: pass
    
    # 8. Verify DB Economics
    print("\n\n8. Verifying Chat Economics (Requirement 11)...")
    r = requests.get(BASE_URL + "/chat/history", headers=headers)
    latest = r.json()[0]
    print(f"Latest Chat: Prompt: {latest['prompt_tokens']} | Completion: {latest['completion_tokens']} | Total: {latest['total_tokens']}")

if __name__ == "__main__":
    test_enterprise_v230()
