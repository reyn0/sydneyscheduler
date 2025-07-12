// Determine the base URL based on environment
const getBaseUrl = () => {
  // In development, use localhost
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8000';
  }
  // In production, use relative URLs (will go through Nginx proxy)
  return '';
};

export async function fetchScrapedData() {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/results`);
  if (!response.ok) throw new Error("Failed to fetch scraped data");
  return response.json();
}

export async function triggerScrape() {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/scrape`);
  if (!response.ok) throw new Error("Failed to trigger scrape");
  return response.json();
}
