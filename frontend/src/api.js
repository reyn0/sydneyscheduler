export async function fetchScrapedData() {
  const response = await fetch("http://localhost:8000/results");
  if (!response.ok) throw new Error("Failed to fetch scraped data");
  return response.json();
}
