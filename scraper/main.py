import requests
import urllib.request
import time
import json
from bs4 import BeautifulSoup
from nltk.tokenize import WhitespaceTokenizer
from nltk.corpus import stopwords
from collections import defaultdict, deque
from string import punctuation

frontier = deque()
frontier.append("https://www.allrecipes.com/recipes/")
# will go BFS style, neighbors first
processed = set()

def build_processed():
    # Will parse the recipes.json file previously created and add all the URLs to the set
    try:
        with open("recipes.json", "r") as file:
            for line in file:
                url = json.loads(line).get("url")
                if url:
                    print(url)
                    processed.add(url)
    except Exception:
        pass # In case recipes.json() hasn't been made yet

def get_nutrition_table(soup) -> dict:
    # Grabs nutritional values from html table
    mappings = {
        'servings per recipe': 'servings',
        'total carbohydrate': 'carbohydrate',
        'dietary fiber': 'fiber',
        'total sugars': 'sugar',
    }
    to_return = {}
    rows = soup.find_all("table", {"class": "mntl-nutrition-facts-label__table"})
    for row in rows:
        for col in row.findAll(['td', 'tr']):
            temp = col.text.strip().split('\n')
            if len(temp) > 1:
                lowered = temp[0].lower()
                new_key = mappings.get(lowered, lowered).replace(' ', '_')
                to_return[new_key] = temp[1]
    return to_return


def get_nutrition_script(soup) -> dict:
    # Grabs ingredients from application/ld+json
    to_return = {}
    try:
        contents = soup.find("script", {"type":"application/ld+json"}).contents[0].strip()
        info = json.loads("".join(contents)[1:-1])
        to_return["ingredients"] = info.get("recipeIngredient", "")
        to_return["name"] = info.get("name", "")
        to_return["instructions"] = []
        for obj in info.get("recipeInstructions", []):
            to_return["instructions"].append(obj.get("text"))
    except Exception as e:
        print(f"Error getting javascript: {e}") # Skip parsing exceptions
    return to_return

def get_food_info(soup) -> dict:
    # Parses all information from the HTML
    food_info = get_nutrition_table(soup)
    food_info.update(get_nutrition_script(soup))
    for elem in soup.find_all("meta"):
        prop = elem.get("property", "")
        if prop == "og:image":
            food_info["image_url"] = elem.get("content", "")
        elif prop == "og:description":
            food_info["description"] = elem.get("content", "")
    # Rename keys to fit conventions
    return food_info


def extract_next_links(soup):
    to_return = set()
    for link in soup.find_all('a'):
        pot_link = link.get('href', None)
        if pot_link and 'https://www.allrecipes.com/recipes' in pot_link:
            to_return.add(pot_link)
    # Recipe pages and pages for recipes have different structures
    try:
        contents = soup.find("script", {"type":"application/ld+json"}).contents[0].strip()
        info = json.loads("".join(contents)[1:-1])
        recipes = info.get("mainEntityOfPage").get("breadcrumb").get("itemListElement")
        for recipe in recipes:
            to_return.add(recipe.get('item').get('@id'))
        for item in info.get("itemListElement", []):
            url = item.get("url")
            to_return.add(url)
    except Exception:
        pass
    return to_return

def run():
    counter = 0
    build_processed()
    while frontier:
        url_to_search = frontier.pop()
        time.sleep(1) # Politeness delay
        html_text = requests.get(url_to_search).content
        soup = BeautifulSoup(html_text, features="lxml", from_encoding='utf8')
        # Get info on the food
        food_info = get_food_info(soup)
        food_info['url'] = url_to_search
        for k, v in food_info.items():
            print(f"{k}: {v}")
        if food_info.get("name") and food_info.get("ingredients"):
            # Means not an article page, append food info to a file
            with open("recipes.json", "a") as file:
                file.write(json.dumps(food_info)+"\n")
        processed.add(url_to_search)
        # Get next links from the HTML
        pots = extract_next_links(soup).difference(processed)
        for pot in pots:
            frontier.append(pot)
        counter += 1
        


if __name__ == "__main__":
    run()
