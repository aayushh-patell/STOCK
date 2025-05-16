#!/usr/bin/env python3
"""
Quick script to check scraping progress and total reports available.
"""

import requests
from bs4 import BeautifulSoup
import time

ROOT = 'https://efdsearch.senate.gov'
LANDING_PAGE_URL = '{}/search/home/'.format(ROOT)
SEARCH_PAGE_URL = '{}/search/'.format(ROOT)
REPORTS_URL = '{}/search/report/data/'.format(ROOT)

def add_rate_limit(f):
    def with_rate_limit(*args, **kw):
        time.sleep(2)  # Rate limit
        return f(*args, **kw)
    return with_rate_limit

def _csrf(client: requests.Session) -> str:
    """Get CSRF token for the session."""
    landing_page_response = client.get(LANDING_PAGE_URL)
    landing_page = BeautifulSoup(landing_page_response.text, 'lxml')
    form_csrf = landing_page.find(attrs={'name': 'csrfmiddlewaretoken'})['value']
    
    form_payload = {
        'csrfmiddlewaretoken': form_csrf,
        'prohibition_agreement': '1'
    }
    client.post(LANDING_PAGE_URL, data=form_payload, headers={'Referer': LANDING_PAGE_URL})
    
    if 'csrftoken' in client.cookies:
        csrftoken = client.cookies['csrftoken']
    else:
        csrftoken = client.cookies['csrf']
    return csrftoken

def check_total_reports():
    """Check total number of reports available."""
    print("🔍 Checking total reports available...")
    
    client = requests.Session()
    client.get = add_rate_limit(client.get)
    client.post = add_rate_limit(client.post)
    
    token = _csrf(client)
    
    # Query for first batch to get total count
    login_data = {
        'start': '0',
        'length': '100',
        'report_types': '[11]',
        'filer_types': '[]',
        'submitted_start_date': '01/01/2012 00:00:00',
        'submitted_end_date': '',
        'candidate_state': '',
        'senator_state': '',
        'office_id': '',
        'first_name': '',
        'last_name': '',
        'csrfmiddlewaretoken': token
    }
    
    print("📡 Fetching report count...")
    response = client.post(REPORTS_URL, data=login_data, headers={'Referer': SEARCH_PAGE_URL})
    data = response.json()
    
    total_records = data.get('recordsTotal', 0)
    total_filtered = data.get('recordsFiltered', 0)
    
    print(f"\n📊 Report Statistics:")
    print(f"   Total Records: {total_records:,}")
    print(f"   Filtered Records: {total_filtered:,}")
    
    # Check current progress
    current_report = 1250  # From your logs
    current_transactions = 7945  # From your logs
    
    if total_filtered > 0:
        reports_remaining = total_filtered - current_report
        progress_percent = (current_report / total_filtered) * 100
        
        print(f"\n🎯 Current Progress:")
        print(f"   Current Report: #{current_report:,}")
        print(f"   Reports Remaining: {reports_remaining:,}")
        print(f"   Progress: {progress_percent:.1f}%")
        print(f"   Transactions Collected: {current_transactions:,}")
        
        # Estimate time remaining
        if current_report > 0:
            avg_time_per_report = 25  # seconds based on your logs
            time_remaining_seconds = reports_remaining * avg_time_per_report
            time_remaining_minutes = time_remaining_seconds / 60
            time_remaining_hours = time_remaining_minutes / 60
            
            print(f"\n⏱️  Time Estimates:")
            print(f"   Avg time per report: ~{avg_time_per_report} seconds")
            print(f"   Estimated time remaining: {time_remaining_hours:.1f} hours ({time_remaining_minutes:.0f} minutes)")
            
            # Estimate completion time
            import datetime
            completion_time = datetime.datetime.now() + datetime.timedelta(seconds=time_remaining_seconds)
            print(f"   Estimated completion: {completion_time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    return total_filtered

if __name__ == "__main__":
    try:
        total = check_total_reports()
        print(f"\n✅ Check complete! Total reports to scrape: {total:,}")
    except Exception as e:
        print(f"❌ Error checking progress: {e}")
        print("This might be due to network issues or the website being temporarily unavailable.") 