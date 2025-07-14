from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import time
import json

def debug_ginza_structure():
    """Debug script to see the actual structure of Ginza website"""
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    
    url = "https://www.ginzaclub.com.au/Roster"
    print(f"Fetching: {url}")
    driver.get(url)
    time.sleep(3)
    
    soup = BeautifulSoup(driver.page_source, "html.parser")
    driver.quit()
    
    # Save full HTML for inspection
    with open("ginza_debug.html", "w", encoding="utf-8") as f:
        f.write(soup.prettify())
    
    # Look for date indicators
    print("=== Looking for date/day indicators ===")
    date_patterns = ["today", "tomorrow", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    for pattern in date_patterns:
        found = soup.find_all(string=lambda text: text and pattern.lower() in text.lower())
        if found:
            print(f"Found '{pattern}': {[str(f).strip() for f in found[:3]]}")
    
    # Look for roster blocks
    print("\n=== Roster blocks structure ===")
    roster_blocks = soup.find_all('div', class_='clearfix', style=lambda v: v and 'margin-bottom: 20px' in v)
    print(f"Found {len(roster_blocks)} roster blocks")
    
    for i, block in enumerate(roster_blocks[:3]):  # Only show first 3
        print(f"\n--- Block {i+1} ---")
        
        # Look for title/date in strong tags
        strongs = block.find_all('strong')
        for s in strongs:
            if s.text.strip():
                print(f"Title/Header: '{s.text.strip()}'")
        
        # Look for any text that might indicate date/day
        block_text = block.get_text()
        for pattern in date_patterns:
            if pattern.lower() in block_text.lower():
                print(f"Contains '{pattern}' somewhere in block")
        
        # Count entries
        info_div = block.find('div', class_='info')
        if info_div:
            entries = info_div.find_all('p')
            print(f"Has {len(entries)} entries in info div")
    
    # Look for any other date/schedule indicators
    print("\n=== Other date indicators ===")
    all_text = soup.get_text()
    import re
    
    # Look for date patterns like "14/07", "July 14", etc.
    date_matches = re.findall(r'\b(?:\d{1,2}[\/\-]\d{1,2}|\w+\s+\d{1,2})\b', all_text)
    if date_matches:
        print("Found date-like patterns:", set(date_matches[:10]))
    
    # Look for day patterns
    day_matches = re.findall(r'\b(?:today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b', all_text, re.IGNORECASE)
    if day_matches:
        print("Found day patterns:", set([d.lower() for d in day_matches]))

if __name__ == "__main__":
    debug_ginza_structure()
