import httpx
import asyncio
import json
import time
import os
import uuid
from typing import List, Dict, Any

BASE_URL = "http://127.0.0.1:8001"
DUMMY_PDF = "dummy.pdf"

class QATestResult:
    def __init__(self, name: str, passed: bool, details: str = ""):
        self.name, self.passed, self.details = name, passed, details

class CognivaultQA:
    def __init__(self):
        self.client = httpx.AsyncClient(base_url=BASE_URL, timeout=30.0)
        self.results: List[QATestResult] = []

    def log(self, name: str, passed: bool, details: str = ""):
        self.results.append(QATestResult(name, passed, details))
        status = "PASS" if passed else "FAIL"
        print(f"[{status}] {name}")
        if details: print(f"      Details: {details}")

    async def run_auth_tests(self):
        print("\n--- 1. AUTHENTICATION ---")
        u1 = {"email": f"qa_u1_{uuid.uuid4().hex[:4]}@test.com", "name": "QA User 1", "role": "Employee", "password": "password123"}
        u2 = {"email": f"qa_u2_{uuid.uuid4().hex[:4]}@test.com", "name": "QA User 2", "role": "Employee", "password": "password123"}
        
        r1 = await self.client.post("/auth/register", json=u1)
        r2 = await self.client.post("/auth/register", json=u2)
        self.log("Register Multiple Users", r1.status_code == 200 and r2.status_code == 200, f"U1: {r1.status_code}, U2: {r2.status_code}")
        
        r3 = await self.client.post("/auth/login", data={"username": u1["email"], "password": u1["password"]})
        self.log("Login Correct Credentials", r3.status_code == 200, f"Token: {r3.reason_phrase}")
        
        token = r3.json().get("access_token")
        return token, u1, u2

    async def run_isolation_tests(self, token_u1, u1, u2):
        print("\n--- 2. MULTI-TENANT ISOLATION ---")
        headers_u1 = {"Authorization": f"Bearer {token_u1}"}
        
        # Doc 1 for User A
        with open(DUMMY_PDF, "rb") as f:
            ru = await self.client.post("/documents/upload", headers=headers_u1, files={"file": f})
        doc_id_a = ru.json()["id"]
        
        # Log in User B
        login_u2 = await self.client.post("/auth/login", data={"username": u2["email"], "password": u2["password"]})
        token_u2 = login_u2.json()["access_token"]
        headers_u2 = {"Authorization": f"Bearer {token_u2}"}
        
        # User B Access Violation attempt
        ra = await self.client.get(f"/documents/{doc_id_a}/summary", headers=headers_u2)
        rl = await self.client.get("/documents", headers=headers_u2)
        doc_in_list = any(d["id"] == doc_id_a for d in rl.json())
        
        self.log("Tenant Isolation: Cross-data Blocked", ra.status_code == 403 and not doc_in_list, f"Summary Attempt: {ra.status_code}")
        return doc_id_a, headers_u1

    async def run_document_tests(self, headers, doc_id):
        print("\n--- 3. DOCUMENT SYSTEM ---")
        # Invalid PDF
        with open("uvicorn_8001.txt", "rb") as f:
            ri = await self.client.post("/documents/upload", headers=headers, files={"file": ("test.txt", f)})
        self.log("Upload Invalid File Type (Reject)", ri.status_code == 400, f"Status: {ri.status_code}")

    async def run_performance_tests(self, headers):
        print("\n--- 8. PERFORMANCE & CONCURRENCY ---")
        start = time.time()
        # 50 concurrent requests to health endpoint
        tasks = [self.client.get("/health", headers=headers) for _ in range(50)]
        rss = await asyncio.gather(*tasks)
        dur = (time.time() - start) * 1000
        passed = all(r.status_code == 200 for r in rss)
        self.log(f"Load Simulation (50 Concurrent Req)", passed, f"Total Dur: {dur:.2f}ms | Avg: {dur/50:.2f}ms")

    async def run_security_smoke(self, headers):
        print("\n--- 7. SECURITY SMOKE ---")
        # Invalid JWT
        r_inv = await self.client.get("/documents", headers={"Authorization": "Bearer INVALID"})
        self.log("Invalid JWT Rejection", r_inv.status_code == 401)
        
        # Path traversal
        try:
            r_pt = await self.client.get("/documents/%2e%2e%2fmain.py/summary", headers=headers)
            self.log("Path Traversal Protection", r_pt.status_code in [404, 403, 422])
        except: pass

    async def finalize(self):
        print("\n" + "="*50)
        print("QA SUMMARY: Cognivault v2.3.0")
        passed = sum(1 for r in self.results if r.passed)
        print(f"PASSED: {passed} | FAILED: {len(self.results)-passed}")
        print("="*50)
        await self.client.aclose()

async def execute():
    qa = CognivaultQA()
    try:
        t, u1, u2 = await qa.run_auth_tests()
        did, h = await qa.run_isolation_tests(t, u1, u2)
        await qa.run_document_tests(h, did)
        await qa.run_security_smoke(h)
        await qa.run_performance_tests(h)
    finally:
        await qa.finalize()

if __name__ == "__main__":
    asyncio.run(execute())
