import csv
import json
import httpx
import asyncio
from datetime import datetime
import re
import os
import sys

# Ensure UTF-8 output on Windows console
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if sys.stderr and hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

EVAL_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_FILE = os.path.join(EVAL_DIR, 'golden_set.csv')
OUT_FILE = os.path.join(EVAL_DIR, 'results.csv')
BASE_URL = 'http://localhost:8000'

async def evaluate_row(row, client, run_id):
    execution_mode = row['execution_mode']
    lesson_id = row['lesson_id']
    current_slide = int(row['current_slide'])
    prompt = row['prompt']
    
    observed_output = ""
    observed_agent_order = ""
    
    try:
        if execution_mode == 'chat':
            payload = {
                "student_id": "S1024",
                "lesson_id": lesson_id,
                "current_slide": current_slide,
                "messages": [],
                "user_input": prompt
            }
            response = await client.post(f"{BASE_URL}/api/chat", json=payload, timeout=60.0)
            data = response.json()
            
            responses = data.get("ordered_responses", [])
            output_texts = []
            agents = []
            
            for res in responses:
                sender = res.get("sender", "unknown")
                text = res.get("text", "")
                
                # Map sender back to expected format roughly
                if "Thầy" in sender or "Tuấn" in sender or "instructor" in sender.lower() or "tuan" in sender.lower():
                    agent_name = "prof-tuan"
                elif "Thảo" in sender or "ta" in sender.lower() or "thao" in sender.lower():
                    agent_name = "ta-thao"
                else:
                    agent_name = "peer-minh"
                    
                agents.append(agent_name)
                output_texts.append(f"{sender}: {text}")
                
            observed_output = " | ".join(output_texts)
            observed_agent_order = ";".join(agents)
            
        elif execution_mode == 'track-slide':
            payload = {
                "student_id": "S1024",
                "lesson_id": lesson_id,
                "slide_number": current_slide,
                "time_spent_seconds": 15,
                "force_trigger": True
            }
            response = await client.post(f"{BASE_URL}/api/track-slide", json=payload, timeout=60.0)
            data = response.json()
            
            if data.get("should_intervene") and data.get("intervention"):
                interv = data["intervention"]
                sender = interv.get("sender", "unknown")
                text = interv.get("text", "")
                
                if "Thầy" in sender or "Tuấn" in sender:
                    agent_name = "prof-tuan"
                elif "Thảo" in sender:
                    agent_name = "ta-thao"
                else:
                    agent_name = "peer-minh"
                    
                observed_agent_order = agent_name
                observed_output = f"{sender}: {text}"
            else:
                observed_output = "No intervention triggered"
                observed_agent_order = "none"
                
        # Basic check to put something in pass_fail
        # User should manually verify the output vs expected_behavior later
        row['observed_output'] = observed_output
        row['observed_agent_order'] = observed_agent_order
        
        # Simple citation extraction for observed_citation column
        citations = re.findall(r'\[T\d{2}-\d{3}\]', observed_output)
        if citations:
            row['observed_citation'] = ";".join(citations)
            
        row['run_id'] = run_id
        
        print(f"✅ Evaluated {row['case_id']}")
    except Exception as e:
        row['observed_output'] = f"ERROR: {str(e)}"
        row['run_id'] = run_id
        print(f"❌ Failed {row['case_id']}: {str(e)}")
        
    return row

async def main():
    print("Starting evaluation...")
    run_id = f"auto-{datetime.now().strftime('%Y%m%d-%H%M')}"
    
    rows = []
    with open(CSV_FILE, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        for row in reader:
            rows.append(row)
            
    async with httpx.AsyncClient() as client:
        # Run one by one to avoid rate limits or order issues
        for i, row in enumerate(rows):
            rows[i] = await evaluate_row(row, client, run_id)
            
    with open(OUT_FILE, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
        
    print(f"\n✨ Done! Results saved to {OUT_FILE}.")
    print("Mở file results.csv để tự chấm 'đạt' hay 'chưa đạt' (pass_fail) nhé!")

if __name__ == "__main__":
    asyncio.run(main())
