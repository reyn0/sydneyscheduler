from fastapi import FastAPI
from .scraper import scrape_data, load_latest_results
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/scrape")
def get_scraped_data():
    return scrape_data()

@app.get("/results")
def get_latest_results():
    data = load_latest_results()
    if data is None:
        return {"error": "No results available yet."}
    return data
