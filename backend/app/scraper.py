from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import datetime
import time
import json
import re
import os

def get_selenium_soup(url):
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    driver.get(url)
    time.sleep(3)
    soup = BeautifulSoup(driver.page_source, "html.parser")
    driver.quit()
    return soup

def extract_no5_roster():
    url = "https://no5marrickville.com/#roster"
    soup = get_selenium_soup(url)
    def extract_roster_from_timetable(soup, roster_id):
        container = soup.find('div', id=roster_id)
        roster = []
        if container:
            timetable = container.find('div', class_='timetable')
            if timetable:
                rows = timetable.find_all('div', class_='timetable__row')
                for row in rows:
                    name_elem = row.find('p', class_='timetable__name')
                    time_elem = row.find('p', class_='timetable__time')
                    name = name_elem.get_text(strip=True) if name_elem else None
                    time_ = time_elem.get_text(strip=True) if time_elem else None
                    if name or time_:
                        roster.append({'name': name, 'time': time_})
        return roster
    today = extract_roster_from_timetable(soup, 'nav-rostertoday')
    tomorrow = extract_roster_from_timetable(soup, 'nav-rostertomorrow')
    return {
        'title': 'Marrickville',
        'today': today,
        'tomorrow': tomorrow,
        'timestamp': datetime.datetime.now().isoformat()
    }

def extract_ginza_roster():
    url = "https://www.ginzaclub.com.au/Roster"
    soup = get_selenium_soup(url)
    # Find all roster blocks
    roster_blocks = soup.find_all('div', class_='clearfix', style=lambda v: v and 'margin-bottom: 20px' in v)
    results = []
    for block in roster_blocks:
        # Try to extract a date/title if present
        title = None
        strongs = block.find_all('strong')
        for s in strongs:
            if s.text.strip():
                title = s.text.strip()
                break
        names = []
        # Only extract from <div class='info'> inside the block
        info_div = block.find('div', class_='info')
        if info_div:
            # For each <p>, combine first non-empty span as name and first following non-empty span as time
            for p in info_div.find_all('p'):
                spans = p.find_all('span')
                name_part = None
                time_part = None
                for span in spans:
                    txt = span.get_text(" ", strip=True)
                    if not name_part and txt:
                        name_part = txt
                        continue
                    if name_part and not time_part and txt:
                        time_part = txt
                        break
                if name_part and time_part:
                    combined = f"{name_part} {time_part}"
                    names.append(combined.strip())
                elif not spans:
                    # fallback: treat the whole <p> as before
                    txt = p.get_text(" ", strip=True)
                    if ("am" in txt or "pm" in txt or "-" in txt):
                        names.append(txt)
            # Also check for <span> tags not inside <p> (if any)
            for tag in info_div.find_all('span'):
                if tag.parent.name != 'p':
                    txt = tag.get_text(" ", strip=True)
                    # Only add if not already present in names
                    if ("am" in txt or "pm" in txt or "-" in txt) and all(txt not in n for n in names):
                        names.append(txt)
        # Remove repeated phrases within a single entry
        def remove_internal_repeats(s):
            # If a phrase is repeated immediately, keep only one
            words = s.strip().split()
            n = len(words)
            for size in range(3, min(10, n//2+1)):
                for i in range(n - 2*size + 1):
                    if words[i:i+size] == words[i+size:i+2*size]:
                        # Remove the repeated block
                        return ' '.join(words[:i+size])
            return s
        cleaned_names = [remove_internal_repeats(n) for n in names]
        # Deduplicate names, preserve order, and remove near-duplicates (ignore extra whitespace and repeated phrases)
        seen = set()
        unique_names = []
        def normalize_for_dedupe(s):
            return re.sub(r'\s+', ' ', s.strip().lower())
        for n in cleaned_names:
            norm = normalize_for_dedupe(n)
            if norm not in seen:
                unique_names.append(n)
                seen.add(norm)
        # Only keep entries that have a valid time range (start and end time)
        final_names = []
        for entry in unique_names:
            # Accept time formats like 10am-2pm, 10.30am-2am, 10:30am-6pm, 10.30am -6pm, etc.
            has_time_range = re.search(r'(\d{1,2}(?:[:\.]\d{2})? ?[ap]m\s*-\s*\d{1,2}(?:[:\.]\d{2})? ?[ap]m)', entry, re.IGNORECASE)
            if has_time_range and 'Diamond Class' not in entry:
                # Remove '(PHOTO)' and 'New' (case-insensitive, word-boundary)
                cleaned = re.sub(r'\bNew\b', '', entry, flags=re.IGNORECASE)
                cleaned = re.sub(r'\(PHOTO\)', '', cleaned, flags=re.IGNORECASE)
                cleaned = re.sub(r'\s+', ' ', cleaned).strip()
                final_names.append(cleaned)
        results.append({
            'title': title or 'Ginza Roster',
            'names': final_names
        })
    return {
        'title': 'Cleveland',
        'rosters': results,
        'timestamp': datetime.datetime.now().isoformat()
    }

def extract_479ginza_roster():
    url = "https://www.479ginza.com.au/Roster"
    soup = get_selenium_soup(url)
    roster_blocks = soup.find_all('div', class_='clearfix', style=lambda v: v and 'margin-bottom: 20px' in v)
    results = []
    for block in roster_blocks:
        title = None
        strongs = block.find_all('strong')
        for s in strongs:
            if s.text.strip():
                title = s.text.strip()
                break
        names = []
        info_div = block.find('div', class_='info')
        if info_div:
            # For each <p>, combine first non-empty span as name and first following non-empty span as time
            for p in info_div.find_all('p'):
                spans = p.find_all('span')
                name_part = None
                time_part = None
                for span in spans:
                    txt = span.get_text(" ", strip=True)
                    if not name_part and txt:
                        name_part = txt
                        continue
                    if name_part and not time_part and txt:
                        time_part = txt
                        break
                if name_part and time_part:
                    combined = f"{name_part} {time_part}"
                    names.append(combined.strip())
                elif not spans:
                    # fallback: treat the whole <p> as before
                    txt = p.get_text(" ", strip=True)
                    if ("am" in txt or "pm" in txt or "-" in txt):
                        names.append(txt)
            # Also check for <span> tags not inside <p> (if any)
            for tag in info_div.find_all('span'):
                if tag.parent.name != 'p':
                    txt = tag.get_text(" ", strip=True)
                    # Only add if not already present in names
                    if ("am" in txt or "pm" in txt or "-" in txt) and all(txt not in n for n in names):
                        names.append(txt)
        # Remove repeated phrases within a single entry
        def remove_internal_repeats(s):
            # If a phrase is repeated immediately, keep only one
            words = s.strip().split()
            n = len(words)
            for size in range(3, min(10, n//2+1)):
                for i in range(n - 2*size + 1):
                    if words[i:i+size] == words[i+size:i+2*size]:
                        # Remove the repeated block
                        return ' '.join(words[:i+size])
            return s
        cleaned_names = [remove_internal_repeats(n) for n in names]
        # Deduplicate names, preserve order, and remove near-duplicates (ignore extra whitespace and repeated phrases)
        seen = set()
        unique_names = []
        def normalize_for_dedupe(s):
            return re.sub(r'\s+', ' ', s.strip().lower())
        for n in cleaned_names:
            norm = normalize_for_dedupe(n)
            if norm not in seen:
                unique_names.append(n)
                seen.add(norm)
        # Only keep entries that have a valid time range (start and end time)
        final_names = []
        for entry in unique_names:
            # Accept time formats like 10am-2pm, 10.30am-2am, 10:30am-6pm, 10.30am -6pm, etc.
            has_time_range = re.search(r'(\d{1,2}(?:[:\.]\d{2})? ?[ap]m\s*-\s*\d{1,2}(?:[:\.]\d{2})? ?[ap]m)', entry, re.IGNORECASE)
            if has_time_range and 'Diamond Class' not in entry:
                # Remove '(PHOTO)' and 'New' (case-insensitive, word-boundary)
                cleaned = re.sub(r'\bNew\b', '', entry, flags=re.IGNORECASE)
                cleaned = re.sub(r'\(PHOTO\)', '', cleaned, flags=re.IGNORECASE)
                cleaned = re.sub(r'\s+', ' ', cleaned).strip()
                final_names.append(cleaned)
        results.append({
            'title': title or '479 Ginza Roster',
            'names': final_names
        })
    return {
        'title': 'Elizabeth',
        'rosters': results,
        'timestamp': datetime.datetime.now().isoformat()
    }

def save_latest_results(data, filename="latest_results.json"):
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def load_latest_results(filename="latest_results.json"):
    if os.path.exists(filename):
        with open(filename, "r", encoding="utf-8") as f:
            return json.load(f)
    return None

def scrape_data():
    result = {
        'no5': extract_no5_roster(),
        'ginza': extract_ginza_roster(),
        'ginza479': extract_479ginza_roster()
    }
    save_latest_results(result)
    return result
