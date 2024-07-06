from bs4 import BeautifulSoup

with open("index.html", "r") as f:
    doc = BeautifulSoup(f, "html.parser")
tag = doc.title
tag.string = "New title"
print(doc)
print(tag.string)
print(doc.prettify())


import requests
url = "https://www.indigo.ca/en-ca/red-white-royal-blue-signed-edition/9781250881977.html"
result = requests.get(url)
doc = BeautifulSoup(result.text, "html.parser")
prices = doc.find_all(string="$")
parent = prices[0].parent
print(doc.prettify())


import re
tags = doc.find_all(string=re.compile("\$.*"))
for tag in tags:
    print(tag.strip())

# Search by tag (tag = doc.title)
# Search by tag value 
# Modify tag value (tag.string = "Old title")
# Search for all tags of a certain type (tags = doc.find_all("p")) 
# Search for multiple tags (tags = doc.find_all(["h1", "h2", "h3"]))
# Search for tags with a specific attribute value (tags = doc.find_all(["option"], string="idk", value = "idk", class_ = "idk"))

# Search with regex (tags = doc.find_all(string=re.compile("regex")))

# Save modified HTML (with open("new.html", "w") as file: f.write(str(doc)))

# Search for nested tags (tag = doc.head.title)
# Change or add attributes of a tag (tag["class"] = "my-class")
# See all attributes of a tag (tag.attrs)
# Remove a tag (tag.decompose())