CREATE TABLE IF NOT EXISTS meals(
    id UUID PRIMARY KEY,
    meal_name VARCHAR(100),
    calories INTEGER,
    total_fat INTEGER, -- in grams
    saturated_fat INTEGER, -- in grams
    carbohydrates INTEGER, -- in grams
    cholesterol INTEGER, -- in grams
    sodium INTEGER, -- in miligrams
    fiber INTEGER, -- in grams
    protein INTEGER, -- in grams
    recipe_url varchar(300),
    image_url varchar(300),
    meal_description varchar(800),
    recipe_instructions TEXT[],
    recipe_ingedients TEXT[],
    servings INTEGER
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password VARCHAR(30) NOT NULL
);

CREATE TABLE IF NOT EXISTS user_profiles (
    user_id UUID,
    fitness_goal VARCHAR(30) NOT NULL,
    weight INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS likes (
    user_id UUID,
    rec_meal_id UUID,
    likes BOOLEAN NOT NULL,
    PRIMARY KEY (user_id, rec_meal_id),
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (rec_meal_id) REFERENCES meals (id),
);
