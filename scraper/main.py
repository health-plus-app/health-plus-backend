import requests
import urllib.request
import time
import json
from bs4 import BeautifulSoup
# from nltk.tokenize import WhitespaceTokenizer
# from nltk.corpus import stopwords
from collections import defaultdict, deque
from string import punctuation

# stop_words = set(stopwords.words("english"))
# tokenizer = WhitespaceTokenizer()
# from simhash import Simhash, SimhashIndex

frontier = deque()
frontier.append("https://www.allrecipes.com/recipes/")
# will go BFS style, neighbors first
processed = set()


# def check_dups(content):
#     s = Simhash(get_features(content))
#     # Outside code used below:
#     # https://leons.im/posts/a-python-implementation-of-simhash-algorithm/
#     objs = [(str(k), Simhash(get_features(v)))
#             for k, v in simhash_data.data.items()]
#     index = SimhashIndex(objs, k=3)
#     if len(index.get_near_dups(s)) == 0:
#         simhash_data.data[simhash_data.uniqueID] = content
#         simhash_data.uniqueID += 1
#         return False
#     return True

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

def get_tokens(text) -> [str]:
    # Grabs text and removes stopwords, punctuation, etc.
    to_return = []
    temp = text.split('\n')
    pot_tokens = tokenizer.tokenize(text)
    for token in pot_tokens:
        if token not in punctuation and token not in stop_words and len(token) > 1:
            to_return.append(token)
    return to_return

def get_nutrition_table(soup) -> dict:
    # Grabs nutritional values from html table
    to_return = {}
    rows = soup.find_all("table", {"class": "mntl-nutrition-facts-label__table"})
    for row in rows:
        for col in row.findAll(['td', 'tr']):
            temp = col.text.strip().split('\n')
            if len(temp) > 1:
                to_return[temp[0]] = temp[1]
    return to_return


def get_nutrition_script(soup) -> dict:
    # Grabs ingredients from application/ld+json
    keys = ["name", "recipeIngredient", "recipeInstructions"]
    to_return = {}
    try:
        contents = soup.find("script", {"type":"application/ld+json"}).contents[0].strip()
        info = json.loads("".join(contents)[1:-1])
        for key in keys:
            to_return[key] = info.get(key)
    except Exception as e:
        print(f"Error getting javascript: {e}") # Skip parsing exceptions
    return to_return



def extract_next_links(soup):
    to_return = set()
    for link in soup.find_all('a'):
        pot_link = link.get('href', None)
        if pot_link and 'https://www.allrecipes.com/recipes' in pot_link and pot_link:
            to_return.add(pot_link)
    contents = soup.find("script", {"type":"application/ld+json"}).contents[0].strip()
    info = json.loads("".join(contents)[1:-1])
    # Recipe pages and pages for recipes have different structures
    try:
        recipes = info.get("mainEntityOfPage").get("breadcrumb").get("itemListElement")
        for recipe in recipes:
            url = recipe.get('item').get('@id')
            to_return.add(recipe.get('item').get('@id'))
    except Exception:
        pass
    try:
        for item in info.get("itemListElement"):
            url = item.get("url")
            to_return.add(url)
    except Exception:
        pass
    return to_return

def run():
    counter = 0
    build_processed()
    while (frontier):
        url_to_search = frontier.pop()
        time.sleep(1) # Politeness delay
        html_text = requests.get(url_to_search).content
        soup = BeautifulSoup(html_text, features="lxml", from_encoding='utf8')
        # Get info on the food
        food_info = get_nutrition_table(soup)
        food_info.update(get_nutrition_script(soup))
        food_info['url'] = url_to_search
        for k, v in food_info.items():
            print(f"{k}: {v}")
        if food_info.get("name") and food_info.get("recipeIngredient"):
            # Means not an article page, append food info to a file
            with open("recipes.json", "a") as file:
                file.write(json.dumps(food_info))
        processed.add(url_to_search)
        # Get next links from the HTML
        pots = extract_next_links(soup)
        for pot in pots:
            if pot not in processed:
                frontier.append(pot)
        counter += 1
        


if __name__ == "__main__":
    run()
