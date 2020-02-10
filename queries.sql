CREATE DATABASE owfavorites
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

CREATE TABLE career_profile(
	career_id serial PRIMARY KEY,
	name VARCHAR (50) NOT NULL,
	ow_avatar VARCHAR (355) NOT NULL,
	rating_tank SMALLINT,
	rating_dps SMALLINT,
	rating_heal SMALLINT,
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE user_favorites(
  career_id INTEGER REFERENCES career_profile(career_id),
  user_id INTEGER REFERENCES account(user_id),
  PRIMARY KEY (career_id,user_id)
);

CREATE TABLE account(
	user_id serial PRIMARY KEY,
	first_name VARCHAR (50) NOT NULL,
	last_name VARCHAR (50) NOT NULL,
	password VARCHAR (355) NOT NULL,
	email VARCHAR (355) UNIQUE NOT NULL,
	avatar_filename VARCHAR (355) UNIQUE NOT NULL
);