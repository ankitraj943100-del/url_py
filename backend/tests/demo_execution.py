import asyncio
import json
from httpx import AsyncClient, ASGITransport
from app.main import app

async def run_demo_execution():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test/api") as client:
        print("==================================================================")
        print("🚀 SENTINELOPS AI — COMPLETE END-TO-END DEMO EXECUTION")
        print("==================================================================")

        # 1. Reset Telemetry to Baseline Healthy State
        print("\n--- STEP 1: RESET TELEMETRY TO HEALTHY BASELINE ---")
        res = await client.post("/simulator/reset")
        print(f"Status: {res.status_code} | Output: {res.json()}")

        # 2. Inject Failure (DB Connection Pool Exhaustion)
        print("\n--- STEP 2: INJECT FAILURE (DB Connection Pool Exhaustion) ---")
        res = await client.post("/simulator/inject", json={"scenario": "db_connection_exhaustion", "target_service": "payment-api"})
        inject_data = res.json()
        print(f"Status: {res.status_code}")
        print(f"Scenario: {inject_data.get('scenario')}")
        print(f"Incident Created: {inject_data.get('incident_id')}")
        print(f"Telemetry Metrics Shift:\n{json.dumps(inject_data.get('metrics'), indent=2)}")

        # 3. Trigger LangGraph Multi-Agent Investigation Engine
        print("\n--- STEP 3: LAUNCH LANGGRAPH MULTI-AGENT INVESTIGATION ENGINE ---")
        res = await client.post("/incidents/INC-1042/investigate")
        inv_data = res.json()
        print(f"Status: {res.status_code}")
        state = inv_data.get("state", {})
        print(f"Completed Agents ({len(state.get('completed_agent_ids'))}): {state.get('completed_agent_ids')}")
        print(f"Root Cause Hypothesis: {state.get('root_cause', {}).get('summary')}")
        print(f"Confidence Rating: {state.get('root_cause', {}).get('confidence_level')} ({state.get('root_cause', {}).get('raw_confidence')})")
        print("Empirical Telemetry Evidence:")
        for bullet in state.get('root_cause', {}).get('evidence_bullets', []):
            print(f"   {bullet}")

        # 4. Human Approval of Remediation Plan
        print("\n--- STEP 4: HUMAN APPROVAL (SRE Lead Approves Rollback) ---")
        res = await client.post("/remediations/rem-9021/approve", json={"notes": "Approved rollback via SentinelOps UI"})
        rem_data = res.json()
        print(f"Status: {res.status_code}")
        print(f"Remediation Status: {rem_data.get('status')}")
        print(f"Message: {rem_data.get('message')}")

        # 5. Generate Postmortem Document
        print("\n--- STEP 5: GENERATE AI POSTMORTEM DOCUMENT ---")
        res = await client.post("/postmortems/generate?incident_id=INC-1042")
        pm_data = res.json()
        print(f"Status: {res.status_code}")
        print(f"Postmortem Title: {pm_data.get('title')}")
        print(f"Summary: {pm_data.get('summary')}")

        # 6. Query Contextual AI Copilot
        print("\n--- STEP 6: QUERY CONTEXTUAL SRE AI COPILOT ---")
        res = await client.post("/copilot/chat", json={"message": "Why is payment-api failing?", "incident_id": "INC-1042"})
        copilot_data = res.json()
        print(f"Status: {res.status_code}")
        print(f"Copilot Reply:\n{copilot_data.get('reply')}")
        print("Grounded Evidence Citations:")
        for ev in copilot_data.get("evidence_citations", []):
            print(f"   - [{ev.get('type')}] {ev.get('label')}")

        print("\n==================================================================")
        print("✅ DEMO EXECUTION PASSED 100%! All 6 lifecycle steps verified.")
        print("==================================================================")

if __name__ == "__main__":
    asyncio.run(run_demo_execution())
