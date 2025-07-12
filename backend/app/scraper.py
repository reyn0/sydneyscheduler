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

def now_sydney_iso():
    try:
        import pytz
        SYDNEY_TZ = pytz.timezone('Australia/Sydney')
        return datetime.datetime.now(SYDNEY_TZ).isoformat()
    except ImportError:
        # Fallback to UTC if pytz is not available
        return datetime.datetime.now().isoformat()

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
        'timestamp': now_sydney_iso()
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
            # For each <p>, try multiple extraction approaches
            for p in info_div.find_all('p'):
                spans = p.find_all('span')
                
                # Get direct text from <p> first (often has the clean version)
                p_direct_text = p.get_text(" ", strip=True)
                
                # Check if p direct text contains a complete roster entry and use it directly
                # More flexible pattern to catch cases like "J Yumi 10.30a m -12am"
                if re.search(r'[A-Z]\s+\w+\s+\d{1,2}(?:[:\.]\d{2})?\s*[ap]?\s*m?\s*-\s*\d{1,2}(?:[:\.]\d{2})?\s*[ap]m', p_direct_text, re.IGNORECASE):
                    # Clean up the direct text and use it
                    cleaned = re.sub(r'\(PHOTO\)|\bDiamond\s+Class\b|\bNew\b', '', p_direct_text, flags=re.IGNORECASE)
                    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
                    
                    # Fix specific time formatting issues in the direct text
                    # "10.30a m -12am" -> "10.30am-12am"
                    cleaned = re.sub(r'(\d+\.?\d*)a\s+m\s*-', r'\1am-', cleaned)
                    cleaned = re.sub(r'(\d+\.?\d*)p\s+m\s*-', r'\1pm-', cleaned)
                    # Remove extra spaces between time components and normalize spacing
                    cleaned = re.sub(r'(\d+\.?\d*[ap]m)\s*-\s*(\d+\.?\d*[ap]m)', r'\1-\2', cleaned)
                    
                    names.append(cleaned)
                    continue  # Skip span-based extraction for this <p>
                
                # If spans exist, work with them but be more careful about duplicates
                if spans:
                    # Get unique span texts (avoid processing identical spans)
                    unique_span_texts = []
                    seen_texts = set()
                    
                    for span in spans:
                        span_text = span.get_text(" ", strip=True)
                        if span_text and span_text not in seen_texts:
                            unique_span_texts.append(span_text)
                            seen_texts.add(span_text)
                    
                    # Try to find the best combination from unique spans
                    if len(unique_span_texts) >= 2:
                        # Look for a name + time combination
                        for i, first_span in enumerate(unique_span_texts):
                            # Skip if this looks like metadata
                            if any(x in first_span.lower() for x in ['photo', 'diamond', 'class', 'korean', 'indian']):
                                continue
                            
                            # Check if this could be a name
                            if re.match(r'^[A-Z]\s+\w+', first_span, re.IGNORECASE):
                                # Look for time in remaining spans
                                for j, second_span in enumerate(unique_span_texts[i+1:], i+1):
                                    if ('am' in second_span or 'pm' in second_span) and '-' in second_span:
                                        combined = f"{first_span} {second_span}"
                                        # Apply time fixes
                                        combined = re.sub(r'(\d+\.?\d*a)\s+(m-\d+\.?\d*(?:am|pm))', r'\1\2', combined, flags=re.IGNORECASE)
                                        combined = re.sub(r'(\d+\.?\d*(?:am|pm))\s+(-\d+\.?\d*(?:am|pm))', r'\1\2', combined, flags=re.IGNORECASE)
                                        names.append(combined.strip())
                                        break
                                break
                    
                    # If no combination found, try reconstructing from fragments
                    if not names or not any(unique_span_texts[0] in name for name in names):
                        full_text = " ".join(unique_span_texts)
                        
                        # Look for name pattern
                        name_match = re.match(r'^([A-Z]\s+\w+(?:\s+\(PHOTO\))?)', full_text, re.IGNORECASE)
                        if name_match:
                            name_part = name_match.group(1)
                            name_part = re.sub(r'\s*\(PHOTO\)\s*', ' ', name_part).strip()
                            
                            # Get time components
                            time_components = full_text[len(name_match.group(1)):].strip()
                            time_clean = re.sub(r'\(PHOTO\)|\(No Korean[^)]*\)|\bDiamond\s+Class\b|\bNew\b', '', time_components, flags=re.IGNORECASE)
                            time_clean = re.sub(r'\s+', ' ', time_clean).strip()
                            
                            # Try to reconstruct time
                            time_reconstructed = time_clean
                            time_reconstructed = re.sub(r'(\d+\.?\d*)a\s+m\s*-', r'\1am-', time_reconstructed)
                            time_reconstructed = re.sub(r'(\d+\.?\d*)p\s+m\s*-', r'\1pm-', time_reconstructed)
                            time_reconstructed = re.sub(r'(\d+)\s+(\.\d+[ap]m-\d+)\s+(\d+[ap]m)', r'\1\2\3', time_reconstructed)
                            time_reconstructed = re.sub(r'\s+', '', time_reconstructed)
                            
                            # Check for valid time pattern
                            if re.search(r'\d+\.?\d*[ap]m-\d+\.?\d*[ap]m', time_reconstructed, re.IGNORECASE):
                                combined = f"{name_part} {time_reconstructed}"
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
        
        # Enhanced deduplication: prefer entries without "Diamond Class" when duplicates exist
        # Group entries by their core name+time (without Diamond Class)
        core_to_entries = {}
        
        def get_core_name(s):
            # Remove "Diamond Class", "New", and clean up spacing
            core = re.sub(r'\bNew\b', '', s, flags=re.IGNORECASE).strip()
            core = re.sub(r'\bDiamond\s+Class\b', '', core, flags=re.IGNORECASE).strip()
            core = re.sub(r'\s+', ' ', core)
            return core
        
        # Group entries by their core representation
        for entry in cleaned_names:
            core = get_core_name(entry)
            if core not in core_to_entries:
                core_to_entries[core] = []
            core_to_entries[core].append(entry)
        
        # For each core, pick the best entry (shortest, cleanest)
        unique_names = []
        for core, entries in core_to_entries.items():
            if not entries:
                continue
                
            # Sort by: 1) entries without "Diamond Class" first, 2) then by length
            def entry_priority(entry):
                has_diamond_class = 'Diamond Class' in entry
                return (has_diamond_class, len(entry), entry)
            
            best_entry = sorted(entries, key=entry_priority)[0]
            
            # Clean up the best entry
            cleaned = re.sub(r'\bNew\b', '', best_entry, flags=re.IGNORECASE).strip()
            cleaned = re.sub(r'\bDiamond\s+Class\b', '', cleaned, flags=re.IGNORECASE).strip()
            cleaned = re.sub(r'\s+', ' ', cleaned)
            
            if cleaned:  # Only add non-empty entries
                unique_names.append(cleaned)
        
        # Only keep entries that have a valid time range (start and end time)
        final_names = []
        for entry in unique_names:
            # Accept time formats like 10am-2pm, 10.30am-2am, 10:30am-6pm, 10.30am-6pm, etc.
            time_match = re.search(r'(\d{1,2}(?:[:\.]\d{2})? ?[ap]m\s*-\s*\d{1,2}(?:[:\.]\d{2})? ?[ap]m)', entry, re.IGNORECASE)
            if time_match:
                # Extract just the name and time, removing extra content
                # Pattern: Name + Time, ignore everything after the time
                name_time_pattern = r'^([A-Z][^0-9]*?)(\d{1,2}(?:[:\.]\d{2})? ?[ap]m\s*-\s*\d{1,2}(?:[:\.]\d{2})? ?[ap]m)'
                name_time_match = re.match(name_time_pattern, entry, re.IGNORECASE)
                
                if name_time_match:
                    name_part = name_time_match.group(1).strip()
                    time_part = name_time_match.group(2).strip()
                    
                    # Clean up the name part
                    name_part = re.sub(r'\(PHOTO\)|\bDiamond\s+Class\b|\bNew\b', '', name_part, flags=re.IGNORECASE)
                    name_part = re.sub(r'\s+', ' ', name_part).strip()
                    
                    # Normalize time format (remove spaces around dash) BEFORE adding to final_names
                    time_part = re.sub(r'(\d+\.?\d*[ap]m)\s*-\s*(\d+\.?\d*[ap]m)', r'\1-\2', time_part, flags=re.IGNORECASE)
                    
                    # Combine clean name and time
                    cleaned = f"{name_part} {time_part}"
                    final_names.append(cleaned)
                else:
                    # Fallback: basic cleanup if pattern matching fails
                    cleaned = re.sub(r'\(PHOTO\)|\bDiamond\s+Class\b|\bNew\b', '', entry, flags=re.IGNORECASE)
                    # Remove content after time pattern that looks like extra info
                    cleaned = re.sub(r'(\d{1,2}(?:[:\.]\d{2})? ?[ap]m)\s*[^\w]*.*$', r'\1', cleaned, flags=re.IGNORECASE)
                    # Normalize time spacing BEFORE adding to final_names
                    cleaned = re.sub(r'(\d+\.?\d*[ap]m)\s*-\s*(\d+\.?\d*[ap]m)', r'\1-\2', cleaned, flags=re.IGNORECASE)
                    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
                    final_names.append(cleaned)

        # Final deduplication step - remove exact duplicates that may have slipped through
        final_names = list(dict.fromkeys(final_names))  # Preserves order while removing duplicates
        results.append({
            'title': title or 'Ginza Roster',
            'names': final_names
        })
    
    # Final cross-roster deduplication: if same person appears in multiple rosters,
    # keep the one with more recent/different time, or just the first unique occurrence
    all_final_names = []
    seen_normalized = set()  # Track by normalized format to avoid spacing duplicates
    
    for roster in results:
        for name in roster['names']:
            # Normalize the entry before checking for duplicates
            normalized_name = re.sub(r'(\d+\.?\d*[ap]m)\s*-\s*(\d+\.?\d*[ap]m)', r'\1-\2', name, flags=re.IGNORECASE)
            
            # If we haven't seen this normalized entry yet, add it
            if normalized_name not in seen_normalized:
                all_final_names.append(normalized_name)
                seen_normalized.add(normalized_name)
    
    # Update results with deduplicated names
    if results:
        results[0]['names'] = all_final_names
        # Remove other rosters since we've merged them
        results = [results[0]]
    
    return {
        'title': 'Cleveland',
        'rosters': results,
        'timestamp': now_sydney_iso()
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
        
        # Look for entries in both <div class='info'> and direct child divs
        info_div = block.find('div', class_='info')
        divs_to_check = [info_div] if info_div else []
        
        # Also check direct child divs that might not have the 'info' class
        for child_div in block.find_all('div', recursive=False):
            if child_div not in divs_to_check:
                divs_to_check.append(child_div)
        
        for div_to_process in divs_to_check:
            if div_to_process:
                # Get all text from each <p> tag and look for roster entries
                for p in div_to_process.find_all('p'):
                    full_text = p.get_text(" ", strip=True)
                    
                    # Look for patterns like "V Fiona 1pm-4am" or "J Kitty 12pm-4am" in the text
                    # Match entries that have a time range - improved pattern to handle more cases
                    # Pattern explanation: captures name + time range, but NOT the "Diamond Class" suffix
                    time_pattern = r'([A-Z]\w*\s+\w+\s+\d{1,2}(?::\d{2})?(?:am|pm)\s*-\s*\d{1,2}(?::\d{2})?(?:am|pm))'
                    matches = re.findall(time_pattern, full_text, re.IGNORECASE)
                    
                    for match in matches:
                        # Clean up the match
                        cleaned_match = re.sub(r'\s+', ' ', match.strip())
                        names.append(cleaned_match)
                    
                    # Also extract from individual spans that contain roster entries
                    spans = p.find_all('span')
                    for span in spans:
                        span_text = span.get_text(" ", strip=True)
                        # Look for roster entries within spans - more flexible pattern
                        if re.search(r'[A-Z]\w*\s+\w+\s+\d{1,2}(?::\d{2})?(?:am|pm)\s*-\s*\d{1,2}(?::\d{2})?(?:am|pm)', span_text, re.IGNORECASE):
                            # Clean up and add the span text
                            cleaned_span = re.sub(r'\s+', ' ', span_text.strip())
                            names.append(cleaned_span)
                    
                    # Original span-based approach for compatibility
                    name_part = None
                    time_part = None
                    for span in spans:
                        txt = span.get_text(" ", strip=True)
                        if not name_part and txt and not txt.startswith('New') and len(txt) > 3:
                            name_part = txt
                            continue
                        if name_part and not time_part and txt and ('am' in txt or 'pm' in txt):
                            time_part = txt
                            break
                    if name_part and time_part:
                        combined = f"{name_part} {time_part}"
                        names.append(combined.strip())
                    elif not spans:
                        # fallback: treat the whole <p> as before
                        if ("am" in full_text or "pm" in full_text) and "-" in full_text:
                            names.append(full_text)
                
                # Also check for <span> tags not inside <p> (if any)
                for tag in div_to_process.find_all('span'):
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
        
        # Enhanced deduplication: prefer entries without "Diamond Class" when duplicates exist
        # Group entries by their core name+time (without Diamond Class)
        core_to_entries = {}
        
        def get_core_name(s):
            # Remove "Diamond Class", "New", and clean up spacing
            core = re.sub(r'\bNew\b', '', s, flags=re.IGNORECASE).strip()
            core = re.sub(r'\bDiamond\s+Class\b', '', core, flags=re.IGNORECASE).strip()
            core = re.sub(r'\s+', ' ', core)
            return core
        
        # Group entries by their core representation
        for entry in cleaned_names:
            core = get_core_name(entry)
            if core not in core_to_entries:
                core_to_entries[core] = []
            core_to_entries[core].append(entry)
        
        # For each core, pick the best entry (shortest, cleanest)
        unique_names = []
        for core, entries in core_to_entries.items():
            if not entries:
                continue
                
            # Sort by: 1) entries without "Diamond Class" first, 2) then by length
            def entry_priority(entry):
                has_diamond_class = 'Diamond Class' in entry
                return (has_diamond_class, len(entry), entry)
            
            best_entry = sorted(entries, key=entry_priority)[0]
            
            # Clean up the best entry
            cleaned = re.sub(r'\bNew\b', '', best_entry, flags=re.IGNORECASE).strip()
            cleaned = re.sub(r'\bDiamond\s+Class\b', '', cleaned, flags=re.IGNORECASE).strip()
            cleaned = re.sub(r'\s+', ' ', cleaned)
            
            if cleaned:  # Only add non-empty entries
                unique_names.append(cleaned)
        # Only keep entries that have a valid time range (start and end time)
        final_names = []
        for entry in unique_names:
            # Accept time formats like 10am-2pm, 10.30am-2am, 10:30am-6pm, 10.30am -6pm, etc.
            time_match = re.search(r'(\d{1,2}(?:[:\.]\d{2})? ?[ap]m\s*-\s*\d{1,2}(?:[:\.]\d{2})? ?[ap]m)', entry, re.IGNORECASE)
            if time_match:
                # Extract just the name and time, removing extra content
                # Pattern: Name + Time, ignore everything after the time
                name_time_pattern = r'^([A-Z][^0-9]*?)(\d{1,2}(?:[:\.]\d{2})? ?[ap]m\s*-\s*\d{1,2}(?:[:\.]\d{2})? ?[ap]m)'
                name_time_match = re.match(name_time_pattern, entry, re.IGNORECASE)
                
                if name_time_match:
                    name_part = name_time_match.group(1).strip()
                    time_part = name_time_match.group(2).strip()
                    
                    # Clean up the name part - remove common extra content
                    name_part = re.sub(r'\(PHOTO\)|\bDiamond\s+Class\b|\bNew\b', '', name_part, flags=re.IGNORECASE)
                    name_part = re.sub(r'\(No Indian\)|\(No Korean\)', '', name_part, flags=re.IGNORECASE)
                    name_part = re.sub(r'\s+', ' ', name_part).strip()
                    
                    # Combine clean name and time
                    cleaned = f"{name_part} {time_part}"
                    final_names.append(cleaned)
                else:
                    # Fallback: basic cleanup if pattern matching fails
                    cleaned = re.sub(r'\(PHOTO\)|\bDiamond\s+Class\b|\bNew\b', '', entry, flags=re.IGNORECASE)
                    cleaned = re.sub(r'\(No Indian\)|\(No Korean\)', '', cleaned, flags=re.IGNORECASE)
                    # Remove content after time pattern that looks like extra info
                    cleaned = re.sub(r'(\d{1,2}(?:[:\.]\d{2})? ?[ap]m)\s*[^\w]*.*$', r'\1', cleaned, flags=re.IGNORECASE)
                    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
                    final_names.append(cleaned)
        results.append({
            'title': title or '479 Ginza Roster',
            'names': final_names
        })
    return {
        'title': 'Elizabeth',
        'rosters': results,
        'timestamp': now_sydney_iso()
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
