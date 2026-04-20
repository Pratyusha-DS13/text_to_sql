import time

import requests

API_BASE = "http://127.0.0.1:8000"

query = "total amount per user"
print(f"Testing query: '{query}'")
print("=" * 60)

try:
    print("\n1. Sending query to backend...")
    start = time.time()

    res = requests.post(
        f"{API_BASE}/query/query",
        json={"query": query},
        timeout=10,
    )

    query_time = time.time() - start
    print(f"Query response ({query_time:.2f}s): {res.status_code}")

    if res.status_code != 200:
        print(f"Error: {res.text}")
        raise SystemExit(1)

    result = res.json()

    print("\nSQL Generated:")
    print(f"   {result['sql']}")

    print(f"\nData Returned ({len(result['data'])} rows):")
    for row in result["data"]:
        print(f"   {row}")

    print("\n2. Generating insight...")
    start = time.time()

    res = requests.post(
        f"{API_BASE}/generate-insight",
        json={
            "question": query,
            "sql": result["sql"],
            "data": result["data"],
        },
        timeout=10,
    )

    insight_time = time.time() - start
    print(f"Insight response ({insight_time:.2f}s): {res.status_code}")

    if res.status_code != 200:
        print(f"Error: {res.text}")
        raise SystemExit(1)

    insight = res.json()

    print("\nGenerated Insight:")
    print(f"   {insight['insight']}")

    print("\n" + "=" * 60)
    print("FULL FLOW TEST PASSED!")
    print(f"   Total time: {query_time + insight_time:.2f}s")
    print("=" * 60)

except Exception as e:
    print(f"Error: {e}")
    import traceback

    traceback.print_exc()
    raise SystemExit(1)
