const nReadlines = require('n-readlines');
const { parse } = require('pg-protocol');
const fs = require('fs');
const recipeLines = new nReadlines('scraper/recipes.json');
const Pool = require('pg').Pool;
const uuid = require('uuid');

function replacer(match, offset, string) {
    if (match === '\\') { return ''; }
    if (match === '"') { return ''; }
    if (match === "'") { return `''`; }
}

function parse_recipes() {
    // Returns string for stuff to be inserted 
    let line;
    let insert_string = '';

    while (line = recipeLines.next()) {
        try {
            const res = JSON.parse(line.toString('utf-8'));
            if (!res.calories || !res.carbohydrate || !res.protein || !res.servings) { continue; }
            let instructions = `{`, ingredients = `{`;
            for (const i in res.ingredients) {
                ingredients += `"${res.ingredients[i].replace(/'|"|(\\")/g, replacer)}", `;
            }
            ingredients = ingredients.substring(0, ingredients.length - 2) + "}";

            for (const i in res.instructions) {
                instructions += `"${res.instructions[i].replace(/'|"|(\\")/g, replacer)}", `;
            }
            instructions = instructions.substring(0, instructions.length - 2) + "}";
            
            insert_string += 'INSERT INTO MEALS (id, meal_name, calories, total_fat, saturated_fat, carbohydrates, cholesterol, sodium, fiber, protein, recipe_url, image_url, meal_description, recipe_instructions, recipe_ingredients, servings) VALUES '
            insert_string += '(';
            insert_string += `'${uuid.v4()}', `
            insert_string += `'${res.name.replace(/'|"|(\\")/g, replacer)}', `;
            insert_string += parseInt(res.calories) + ', ';
            insert_string += (parseInt(res?.total_fat) || 'NULL') + ', '; // ?., only want to skip if it doesn't contain the necessary nutrients
            insert_string += (parseInt(res?.saturated_fat) || 'NULL') + ', ';
            insert_string += parseInt(res.carbohydrate) + ', ';
            insert_string += (parseInt(res?.cholesterol) || 'NULL') + ', ';
            insert_string += (parseInt(res?.sodium) || 'NULL') + ', ';
            insert_string += (parseInt(res?.fiber) || 'NULL') + ', ';
            insert_string += parseInt(res.protein) + ', ';
            insert_string += `'${res.url}', `;
            insert_string += `'${res.image_url}', `;
            insert_string += `'${res.description.replace(/'|"|(\\")/g, replacer)}', `
            insert_string += `'${instructions}', `
            insert_string += `'${ingredients}', `
            insert_string += parseInt(res.servings);
            insert_string += ');\n';
        }
        catch (error) {
            console.log(error);
            continue;
        }
    }
    // insert_string = insert_string.substring(0, insert_string.length - 2) + ";";
    return insert_string;
}

async function insert_recipes() {
    insert_string = parse_recipes();
    fs.writeFileSync('meals.sql', insert_string, {encoding: 'utf-8'});
    //console.log(insert_string.substring(9137200, 9137400));
    const pool = new Pool({
        user: 'postgres',
        host: 'localhost',
        database: 'db',
        password: 'password',
        port: 5432,
      });
    const res = await pool.query(insert_string);
    console.log(res);
}


insert_recipes();
// x =`{"calories": "6", "total_fat": "0g", "saturated_fat": "0g", "sodium": "1mg", "carbohydrate": "1g", "fiber": "1g", "sugar": "0g", "protein": "0g", "vitamin_c": "0mg", "calcium": "13mg", "iron": "0mg", "potassium": "11mg", "ingredients": ["1 teaspoon ground cinnamon", "0.25 teaspoon ground nutmeg", "0.25 teaspoon ground ginger", "0.125 teaspoon ground cloves"], "name": "Homemade Pumpkin Spice", "instructions": ["Mix together cinnamon, nutmeg, ginger, and cloves in a small bowl."], "description": "Homemade pumpkin pie spice made with cinnamon, nutmeg, ginger, and cloves. Adds fall flavor to pies, roasted veggies, lattes, and dessert toppings.", "image_url": "https://www.allrecipes.com/thmb/9zGo0IqMsPiq8l8Qf6QC2dIFzkk=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/490625_Pumpkin-Spice-2x1-1-2000-c59359aa4dd94458b87c6685f2dfe76d.jpg", "url": "https://www.allrecipes.com/recipe/20476/pumpkin-spice/"}`;
// const res = JSON.parse(x);
// console.log(res);
// console.log(res.servings);
