CREATE TABLE courses (
  id INTEGER NOT NULL PRIMARY KEY,
  name TEXT,
  title TEXT,
  credit INTEGER,
  prerequisites INTEGER,
  total_spot INTEGER,
  available_spot INTEGER,
  waitinglist INTEGER,
  description TEXT
);

CREATE TABLE enrollment (
  user_id INTEGER PRIMARY KEY,
  enrolled_courses INTEGER,
  pre_courses INTEGER,
  course_waiting INTEGER,
	FOREIGN KEY(user_id) REFERENCES users (user_id),
	FOREIGN KEY(enrolled_courses) REFERENCES courses(id),
	FOREIGN KEY(course_waiting) REFERENCES courses(id),
	FOREIGN KEY(pre_courses) REFERENCES courses(id)
);

CREATE TABLE users (
  user_id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT,
  password INTEGER,
  major TEXT
);