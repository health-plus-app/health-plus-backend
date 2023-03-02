/* SELECT meals.id, meal_name, ingredient, quantity as ingredient_quantity 
FROM meals 
JOIN contains ON (meals.id = contains.meal_id) 
JOIN ingredients ON (contains.ingredient_id = ingredients.id) 
WHERE meals.id = 'f68b6f48-d194-414c-8881-465b5f20f182';
*/
