from dataclasses import dataclass
from typing import List, Dict, Union
from flask import Flask, request, jsonify
import re

# ==== Type Definitions, feel free to add or modify ===========================
@dataclass
class CookbookEntry:
	name: str

@dataclass
class RequiredItem():
	name: str
	quantity: int

@dataclass
class Recipe(CookbookEntry):
	required_items: List[RequiredItem]

@dataclass
class Ingredient(CookbookEntry):
	cook_time: int


# =============================================================================
# ==== HTTP Endpoint Stubs ====================================================
# =============================================================================
app = Flask(__name__)

# Store your recipes here!
cookbook = {}

# Task 1 helper (don't touch)
@app.route("/parse", methods=['POST'])
def parse():
	data = request.get_json()
	recipe_name = data.get('input', '')
	parsed_name = parse_handwriting(recipe_name)
	if parsed_name is None:
		return 'Invalid recipe name', 400
	return jsonify({'msg': parsed_name}), 200

# [TASK 1] ====================================================================
# Takes in a recipeName and returns it in a form that
def parse_handwriting(recipeName: str) -> Union[str | None]:
	recipeName = recipeName.strip().replace('-', ' ').replace('_', ' ')
	recipeName = re.sub(r'[ ]+', ' ', recipeName)
	recipeName = re.sub(r'[^a-zA-Z\s]', '', recipeName)
	recipeName = recipeName.title()

	return recipeName if len(recipeName) > 0 else None


# [TASK 2] ====================================================================
# Endpoint that adds a CookbookEntry to your magical cookbook
@app.route('/entry', methods=['POST'])
def create_entry():
	data = request.get_json()
	if data['type'] not in ['recipe', 'ingredient']:
		return 'Wrong type', 400

	if data['type'] == 'ingredient' and data['cookTime'] < 0:
		return 'Negative cook time', 400

	if data['name'] in cookbook:
		return 'Name not unique', 400

	if data['type'] == 'recipe':
		seen = set()
		required_items = []
		for item in data['requiredItems']:
			if item['name'] in seen:
				return 'Required item not unique', 400
			seen.add(item['name'])
			required_items.append(RequiredItem(name=item['name'], quantity=item['quantity']))
		cookbook[data['name']] = Recipe(data['name'], required_items)
	elif data['type'] == 'ingredient':
		cookbook[data['name']] = Ingredient(name=data['name'], cook_time=data['cookTime'])

	return jsonify({}), 200


# [TASK 3] ====================================================================
# Endpoint that returns a summary of a recipe that corresponds to a query name
@app.route('/summary', methods=['GET'])
def summary():
	data = request.args.get('name')

	if not data or data not in cookbook:
		return 'Recipe not found', 400

	root = cookbook[data]
	if not isinstance(root, Recipe):
		return 'Not a recipe', 400

	final = {}
	final['name'] = root.name
	final['cookTime'] = 0
	final['ingredients'] = []
	final['seen'] = set()

	if not helper(root.required_items, 1, final):
		return 'Ingredient not found', 400

	return jsonify({
		"name": final['name'],
		"cookTime": final['cookTime'],
		"ingredients": final['ingredients']
	}), 200


def helper(required_items, multiplier, final):
	for child in required_items:
		if child.name not in cookbook:
			return False
		if isinstance(cookbook[child.name], Ingredient):
			if child.name in final['seen']:
				for item in final['ingredients']:
					if item['name'] == child.name:
						item['quantity'] = item['quantity'] + child.quantity * multiplier
						break
			else:
				final['ingredients'].append({"name": child.name, "quantity": child.quantity * multiplier})
				final['seen'].add(child.name)
			final['cookTime'] = final['cookTime'] + cookbook[child.name].cook_time * child.quantity * multiplier
		else:
			if not helper(cookbook[child.name].required_items, child.quantity * multiplier, final):
				return False
	return True

# =============================================================================
# ==== DO NOT TOUCH ===========================================================
# =============================================================================

if __name__ == '__main__':
	app.run(debug=True, port=8080)
