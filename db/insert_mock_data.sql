-- uncomment if you want to reinitialize database
DROP TABLE eats;
DROP TABLE rates;
DROP TABLE recommended_meals;
DROP TABLE user_meals;
DROP TABLE user_health_statistics;
DROP TABLE contains;
DROP TABLE ingredients;
DROP TABLE meals;
DROP TABLE users;
\i db/schema.sql

\i db/mock_data/users.sql
\i db/mock_data/meals.sql
\i db/mock_data/ingredients.sql
\i db/mock_data/contains.sql
\i db/mock_data/user_health_statistics.sql
\i db/mock_data/user_meals.sql
\i db/mock_data/recommended_meals.sql
\i db/mock_data/rates.sql
\i db/mock_data/eats.sql