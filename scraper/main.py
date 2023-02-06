from bs4 import BeautifulSoup
import requests
import urllib.request
from nltk.tokenize import word_tokenize
from simhash import Simhash, SimhashIndex

frontier = ['https://www.allrecipes.com/']


def check_dups(content):
    s = Simhash(get_features(content))
    # Outside code used below:
    # https://leons.im/posts/a-python-implementation-of-simhash-algorithm/
    objs = [(str(k), Simhash(get_features(v)))
            for k, v in simhash_data.data.items()]
    index = SimhashIndex(objs, k=3)
    if len(index.get_near_dups(s)) == 0:
        simhash_data.data[simhash_data.uniqueID] = content
        simhash_data.uniqueID += 1
        return False
    return True


def run():
    while (frontier):
        url_to_search = frontier.pop
        html_text = requests.get(url_to_search)
        soup = BeautifulSoup(html_text, features="xml", from_encoding='utf8')
        stringAllContent = soup.get_text()


if __name__ == "__main__":
    run()
