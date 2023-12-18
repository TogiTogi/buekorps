
CREATE TABLE IF NOT EXISTS kompani (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    leader_id INTEGER,
    FOREIGN KEY(leader_id) REFERENCES user(id)
);
 
CREATE TABLE IF NOT EXISTS peleton (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    kompani_id INTEGER NOT NULL,
    FOREIGN KEY(kompani_id) REFERENCES kompani(id)
);
 
CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);
 
 
CREATE TABLE IF NOT EXISTS user (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    firstname TEXT NOT NULL,
    lastname TEXT NOT NULL,
    email TEXT NOT NULL,
    mobile TEXT NOT NULL,
    password TEXT NOT NULL,
    role_id INTEGER,
    peleton_id INTEGER,
    FOREIGN KEY(role_id) REFERENCES roles(id),
    FOREIGN KEY(peleton_id) REFERENCES peleton(id)
);
 
 
 
 
 
 
CREATE TABLE IF NOT EXISTS  parent_children (
    parent_id INTEGER NOT NULL,
    child_id INTEGER NOT NULL,
    PRIMARY KEY (parent_id, child_id),
    FOREIGN KEY(parent_id) REFERENCES user(ID),
    FOREIGN KEY(child_id) REFERENCES user(ID)
);
 