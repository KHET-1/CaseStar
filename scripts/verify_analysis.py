import requests

url = 'http://localhost:50000/api/analyze'
payload = {
    "text": (
        "The Plaintiff, John Doe, filed a lawsuit against Acme Corp on "
        "January 1st, 2023 regarding a breach of contract."
    ),
    "case_id": "test_case_123"
}

print("Sending analysis request...")
try:
    response = requests.post(url, json=payload)

    if response.status_code == 200:
        data = response.json()
        print("\n✅ Analysis Successful!")
        print(f"Summary: {data['summary']}")
        print(f"Entities: {data['entities']}")
    else:
        print(f"❌ Analysis Failed: {response.status_code} - {response.text}")

except Exception as e:
    print(f"❌ Error: {e}")
