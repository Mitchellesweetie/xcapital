
CREATE TABLE education (
    educationid INT AUTO_INCREMENT PRIMARY KEY,
    degree VARCHAR(200),
    institution VARCHAR(200),
    start DATETIME,
    end DATETIME,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES registration(user_id)
);

CREATE TABLE experience (
    experienceid INT AUTO_INCREMENT PRIMARY KEY,
    position VARCHAR(200),
    organisation VARCHAR(200),
    start DATETIME,
    end DATETIME,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES registration(user_id)
);

CREATE TABLE personal_details (
    userdetailsid INT AUTO_INCREMENT PRIMARY KEY,
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
    FOREIGN KEY (user_id) REFERENCES registration(user_id)
);
CREATE TABLE user_references (
   referenceid INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(200),
    organisation VARCHAR(200),
    email VARCHAR(200),
    phone VARCHAR(200),
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES registration(user_id)
);
CREATE TABLE categories (
    categoryId INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(200),
    statu enum('active','inactive') default 'inactive',
    email VARCHAR(200),
    descriptio VARCHAR(200),
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES registration(user_id)
);

