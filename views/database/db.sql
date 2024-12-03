
CREATE TABLE education (
    id INT AUTO_INCREMENT PRIMARY KEY,
    degree VARCHAR(200),
    institution VARCHAR(200),
    start DATETIME,
    end DATETIME,
    user_id INT,
    CONSTRAINT fk_user_education_id FOREIGN KEY (user_id) REFERENCES registration(id)
);

CREATE TABLE experience (
    id INT AUTO_INCREMENT PRIMARY KEY,
    position VARCHAR(200),
    organisation VARCHAR(200),
    start DATETIME,
    end DATETIME,
    user_id INT,
    CONSTRAINT fk_user_experience_id FOREIGN KEY (user_id) REFERENCES registration(id)
);

CREATE TABLE personal_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    salutation VARCHAR(200),
    fullName VARCHAR(200),
    gender VARCHAR(200),
    gmail VARCHAR(200),
    number_ VARCHAR(200),
    dob VARCHAR(200),
    ethnicity VARCHAR(200),
    religion VARCHAR(200),
    nationality VARCHAR(200),
    user_id INT,
    curent TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_personal_details_id FOREIGN KEY (user_id) REFERENCES registration(id)
);
CREATE TABLE user_references (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(200),
    organisation VARCHAR(200),
    email VARCHAR(200),
    phone VARCHAR(200),
    user_id INT,
    CONSTRAINT fk_user_references_id FOREIGN KEY (user_id) REFERENCES registration(id)
);
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(200),
    statu tatu enum('active','inactive') default 'inactive',
    email VARCHAR(200),
    descriptio VARCHAR(200),
    user_id INT,
    CONSTRAINT fk_user_categories_id FOREIGN KEY (user_id) REFERENCES registration(id)
);

