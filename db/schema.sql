CREATE TABLE IF NOT EXISTS ingredients (
    id UUID PRIMARY KEY,
    ingredient VARCHAR(40) NOT NULL
);

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
    recipe_ingredients TEXT[],
    servings INTEGER
);

CREATE TABLE IF NOT EXISTS contains (
    meal_id UUID,
    ingredient_id UUID,
    quantity INTEGER NOT NULL,
    PRIMARY KEY(meal_id, ingredient_id),
    FOREIGN KEY (meal_id) REFERENCES meals (id),
    FOREIGN KEY (ingredient_id) REFERENCES ingredients (id)
);

CREATE TABLE IF NOT EXISTS recommended_meals (
    meal_id UUID PRIMARY KEY,
    price BIGINT,
    FOREIGN KEY (meal_id) REFERENCES meals (id),
    CHECK (price >= 0)
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password VARCHAR(30) NOT NULL
);

CREATE TABLE IF NOT EXISTS user_profiles (
    user_profile_id UUID PRIMARY KEY,
    gender VARCHAR(20) NOT NULL,
    fitness_goal VARCHAR(30) NOT NULL,
    age INTEGER NOT NULL,
    CHECK (gender IN ('male', 'female', 'nonbinary')),
    CHECK (fitness_goal IN ('lose', 'gain', 'maintain'))
);

CREATE TABLE IF NOT EXISTS user_health_statistics (
    user_id UUID,
    date_recorded DATE,
    steps INTEGER,
    calories_burned INTEGER,
    average_heart_rate DECIMAL(5,2),
    PRIMARY KEY (user_id, date_recorded),
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS user_meals (
    meal_id UUID PRIMARY KEY,
    user_id UUID,
    FOREIGN KEY (meal_id) REFERENCES meals (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS eats (
    user_id UUID,
    meal_id UUID,
    time_recorded TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (user_id, meal_id, time_recorded),
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (meal_id) REFERENCES meals (id)
);

CREATE TABLE IF NOT EXISTS rates (
    user_id UUID,
    rec_meal_id UUID,
    individual_rating INTEGER NOT NULL,
    PRIMARY KEY (user_id, rec_meal_id),
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (rec_meal_id) REFERENCES recommended_meals (meal_id),
    CHECK (1 <= individual_rating),
    CHECK (individual_rating <= 10)
);
