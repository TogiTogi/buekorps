INSERT INTO roles (name) VALUES
('Soldier'),
('Leader'),
('Administrator'),
('Parent'),
('NotActivated');

INSERT INTO kompani (name, leader_id) VALUES
('Alpha Kompani', 1),
('Bravo Kompani', 2),
('Charlie Kompani', 3);
 
INSERT INTO peleton (name, kompani_id) VALUES
('Peleton 1', 1),
('Peleton 2', 1),
('Peleton 3', 2),
('Peleton 4', 2),
('Peleton 5', 3);
 
 
INSERT INTO user (username, firstname, lastname, email, mobile, password,  role_id, peleton_id) VALUES
('john_doe', 'John', 'Doe', 'john@example.com', '1234567890', 'password123',1, 1),
('jane_doe', 'Jane', 'Doe', 'jane@example.com', '0987654321', 'password123', 2, 1),
('admin_user', 'Admin', 'User', 'admin@example.com', '1122334455', 'password123',  3, 2),
('parent_user', 'Parent', 'User', 'parent@example.com', '5566778899', 'password123',  4, 2);


SELECT username, firstname, lastname, mobile, roles.name as role, peleton.name as peleton, kompani.name as kompani FROM user
inner join roles on roles.id = user.role_id
inner join peleton on peleton.id = user.peleton_id
inner join kompani on kompani.id = peleton.kompani_id


SELECT user.id, roles.name as role FROM user INNER JOIN roles where user.role_id = roles.id

SELECT peleton.name as peleton, user.id, user.firstname, user.lastname, user.mobile, roles.name as role, peleton.name as peleton, kompani.name as kompani  FROM user 
                    inner join peleton on peleton.id = user.peleton_id 
                        inner join roles on user.role_id = roles.id 
                        inner join kompani on peleton.kompani_id = kompani.id
                        where peleton_id in (select peleton_id from user where id = 1)
 