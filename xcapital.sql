-- MySQL dump 10.13  Distrib 8.0.40, for Linux (x86_64)
--
-- Host: localhost    Database: xcapital
-- ------------------------------------------------------
-- Server version	8.0.40-0ubuntu0.20.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `awards`
--

DROP TABLE IF EXISTS `awards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `awards` (
  `awardsId` int NOT NULL AUTO_INCREMENT,
  `award` varchar(200) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`awardsId`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `awards_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `registration` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `awards`
--

LOCK TABLES `awards` WRITE;
/*!40000 ALTER TABLE `awards` DISABLE KEYS */;
INSERT INTO `awards` VALUES (1,'KenyaEMR I',62),(2,'KenyaEMR II',62),(5,'Best Intern',58),(6,'Electronic Community Health Information System level 1',58),(7,'KenyaEMR II',58),(8,'KenyaEMR I',58);
/*!40000 ALTER TABLE `awards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blogs`
--

DROP TABLE IF EXISTS `blogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blogs` (
  `blogid` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) DEFAULT NULL,
  `content` varchar(200) DEFAULT NULL,
  `id` int DEFAULT NULL,
  PRIMARY KEY (`blogid`),
  KEY `id` (`id`),
  CONSTRAINT `blogs_ibfk_1` FOREIGN KEY (`id`) REFERENCES `form` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blogs`
--

LOCK TABLES `blogs` WRITE;
/*!40000 ALTER TABLE `blogs` DISABLE KEYS */;
INSERT INTO `blogs` VALUES (10,'sssssssss','<p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p><h2>What is Lorem Ipsum?</h2><p><strong>Lorem Ipsum</strong> is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s s',117);
/*!40000 ALTER TABLE `blogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `categoryId` int NOT NULL AUTO_INCREMENT,
  `category` varchar(200) DEFAULT NULL,
  `statu` enum('active','inactive') DEFAULT 'inactive',
  `email` varchar(200) DEFAULT NULL,
  `descriptio` varchar(200) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`categoryId`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `registration` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (4,'mitchelle','inactive',NULL,'mitchellenew\r\n',NULL),(5,'mans','active',NULL,'ssssssssssssss',NULL);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `commentId` int NOT NULL AUTO_INCREMENT,
  `comment_text` text,
  `username` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `subjects` varchar(255) DEFAULT NULL,
  `id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `likes` int DEFAULT '0',
  PRIMARY KEY (`commentId`),
  KEY `id` (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`id`) REFERENCES `form` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `registration` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (1,'helloe mitchelle we are just testing','mmwachoo','mmwachoo@gmail.com','submject',118,62,'2024-12-23 09:09:01',0),(2,'n','m','ngolimwachoo@gmail.com','n',118,59,'2024-12-23 10:24:22',0),(3,'ds','s','ngolimwachoo@gmail.com','v',117,62,'2024-12-23 10:25:33',12),(4,'x','x','ngolimwachoo@gmail.com','c',117,62,'2024-12-23 10:26:21',12),(5,'q','q','ngolimwachoo@gmail.com','s',117,62,'2024-12-23 10:27:57',12),(6,'q','q','ngolimwachoo@gmail.com','s',117,62,'2024-12-23 10:31:54',12),(7,'q','q','ngolimwachoo@gmail.com','s',117,62,'2024-12-23 10:32:37',12),(8,'q','q','ngolimwachoo@gmail.com','s',117,62,'2024-12-23 10:34:28',12),(9,'q','q','ngolimwachoo@gmail.com','s',117,62,'2024-12-23 10:35:11',12),(10,'q','q','ngolimwachoo@gmail.com','s',117,62,'2024-12-23 10:37:26',12),(11,'q','q','ngolimwachoo@gmail.com','s',117,62,'2024-12-23 10:38:29',12),(12,'q','q','ngolimwachoo@gmail.com','s',117,62,'2024-12-23 10:39:00',12),(13,'q','q','ngolimwachoo@gmail.com','s',117,62,'2024-12-23 10:39:34',12),(14,'q','q','ngolimwachoo@gmail.com','s',117,62,'2024-12-23 10:40:02',12),(15,'q','q','ngolimwachoo@gmail.com','s',117,62,'2024-12-23 10:40:27',12),(16,'q','q','ngolimwachoo@gmail.com','s',117,62,'2024-12-23 10:40:46',12),(17,'q','q','ngolimwachoo@gmail.com','s',117,62,'2024-12-23 10:41:08',12),(18,'q','q','ngolimwachoo@gmail.com','s',117,62,'2024-12-23 10:41:22',12),(19,'q','q','ngolimwachoo@gmail.com','s',117,62,'2024-12-23 10:41:53',12),(20,'q','q','ngolimwachoo@gmail.com','s',117,62,'2024-12-23 10:42:18',12),(21,'q','q','ngolimwachoo@gmail.com','s',117,62,'2024-12-23 10:42:39',12),(22,'q','q','ngolimwachoo@gmail.com','s',117,62,'2024-12-23 10:43:06',12),(23,'q','q','ngolimwachoo@gmail.com','s',117,62,'2024-12-23 10:43:19',12),(24,'q','q','ngolimwachoo@gmail.com','s',117,62,'2024-12-23 10:43:50',12),(25,'ddgf','gsgd','ngolimwachoo@gmail.com','hd',117,62,'2024-12-24 15:35:02',12),(26,'Why do we use it?\r\n\r\nIt is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using \'Content here, content here\', making it look like readable English. Many desktop publishing packages and web pag','mitchelle','ngolimwachoo@gmail.com','loreisum',130,62,'2025-01-14 16:56:15',0),(27,'Why do we use it?\r\n\r\nIt is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using \'Content here, content here\', making it look like readable English. Many desktop publishing packages and web pag','mitchelle','ngolimwachoo@gmail.com','loreisum',130,62,'2025-01-14 16:57:53',0),(28,'gs','sgd','ngoli@gmail.com','ss',130,62,'2025-01-14 17:01:58',0),(29,'Why do we use it?\r\n\r\nIt is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using \'Content here, content here\', making it look like readable English. Many desktop publishing packages and web pag','mitchel','admin321@gmail.com','agsye',117,62,'2025-01-14 17:59:11',1),(30,'Why do we use it?\r\n\r\nIt is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using \'Content here, content here\', making it look like readable English. Many desktop publishing packages and web pag','g','nit12A@gmail.com','h',117,62,'2025-01-14 18:00:26',0);
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `education`
--

DROP TABLE IF EXISTS `education`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `education` (
  `educationid` int NOT NULL AUTO_INCREMENT,
  `degree` varchar(200) DEFAULT NULL,
  `institution` varchar(200) DEFAULT NULL,
  `start` varchar(255) DEFAULT NULL,
  `end` varchar(255) DEFAULT NULL,
  `current` tinyint(1) DEFAULT '0',
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`educationid`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `education_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `registration` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=283 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `education`
--

LOCK TABLES `education` WRITE;
/*!40000 ALTER TABLE `education` DISABLE KEYS */;
INSERT INTO `education` VALUES (1,'bachelor of science computer science','masinde muliro university of science and technology','2024-12-01','2024-12-20',NULL,59),(6,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','0000-00-00','2023-09-05',NULL,62),(7,'Diploma of Science Computer Science','Masinde Muliro University Of Science and Technology','0000-00-00','2024-12-25',NULL,62),(63,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-05-27','present',0,NULL),(64,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-05-27','present',0,NULL),(65,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-05-27','present',0,NULL),(66,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-05-27','present',0,NULL),(67,'masters in community health','k','2025-01-22','present',0,NULL),(68,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-05-27','present',0,NULL),(69,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-05-27','2',0,NULL),(70,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-05-27','present',0,NULL),(71,'bbb','nnn','2024-12-31','present',0,NULL),(72,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-05-27','present',0,NULL),(73,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-05-27','present',0,NULL),(74,'certificate kenyaemr1','cdsdlkdfcs','2024-12-31','2025-02-01',0,NULL),(75,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-05-27','present',0,NULL),(76,'certificate kenyaemr1','cdsdlkdfcs','2024-12-31','present',0,NULL),(77,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-05-27','2025-01-15',0,NULL),(78,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-05-27','present',0,NULL),(79,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-05-27','2025-01-07',0,NULL),(80,'g','Masinde Muliro University Of Science and Technology','2025-01-13','2025-01-01',0,NULL),(81,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-05-27','present',0,NULL),(82,'g','Masinde Muliro University Of Science and Technology','2025-01-13','present',0,NULL),(83,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-05-27','2025-01-07',0,NULL),(84,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-05-27','2025-01-07',0,NULL),(85,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-05-27','2025-01-07',0,NULL),(86,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-05-27','2025-01-14',0,NULL),(87,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-05-27','present',0,NULL),(88,'n','h','2025-01-13',NULL,0,NULL),(89,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-05-27','2025-01-14',0,NULL),(90,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-05-27','present',0,NULL),(91,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-05-27','present',0,NULL),(92,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-05-27','2024-12-31',0,NULL),(93,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-05-27','present',0,NULL),(94,'a','a','2025-01-15',NULL,0,NULL),(95,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-05-27','2024-12-31',0,NULL),(96,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-05-27','2025-01-14',0,NULL),(97,'n','j','2025-01-13','2025-01-24',0,NULL),(98,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-05-27','present',0,NULL),(99,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-05-27','present',0,NULL),(100,'a','a','2025-01-13',NULL,0,NULL),(101,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-05-27','2025-01-15',0,NULL),(102,'q','q','2024-12-30','2025-01-30',0,NULL),(103,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-05-27','present',0,NULL),(104,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-05-27','present',0,NULL),(105,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-05-27','present',0,NULL),(106,'a','a','2025-01-14','present',0,NULL),(107,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-05-27','present',0,NULL),(108,'a','a','2025-01-14','2025-01-30',0,NULL),(109,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(110,'a','a','2025-01-14',NULL,0,NULL),(111,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(112,'n','j','2025-01-23','present',0,NULL),(113,'j','j','2025-01-13',NULL,0,NULL),(114,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(115,'jj','jj','2025-01-13',NULL,0,NULL),(116,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','2024-12-31',0,NULL),(117,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(118,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','2025-01-28',0,NULL),(119,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(120,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(121,'j','k','2024-12-31',NULL,0,NULL),(122,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(123,'j','k','2025-01-13','present',0,NULL),(124,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(125,'j','k','2025-01-13',NULL,0,NULL),(126,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','2025-01-31',0,NULL),(127,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(128,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','2025-01-22',0,NULL),(129,'jj','jj','2025-01-01','2025-01-31',0,NULL),(130,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(131,'jj','jj','2025-01-01',NULL,0,NULL),(132,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(133,'j','j','2025-01-15',NULL,0,NULL),(134,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','2025-01-22',0,NULL),(135,'j','j','2025-01-15','2025-02-08',0,NULL),(136,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','2025-01-22',0,NULL),(137,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','2025-01-22',0,NULL),(138,'j','n','2025-01-29','2025-01-31',0,NULL),(139,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(140,'j','n','2025-01-29',NULL,0,NULL),(141,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(142,'j','k','2025-01-29',NULL,0,NULL),(143,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','2025-01-22',0,NULL),(144,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(145,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','2025-01-29',0,NULL),(146,'n','h','2025-01-13',NULL,0,NULL),(147,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','2025-01-30',0,NULL),(148,'x','x','2025-01-01',NULL,0,NULL),(149,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(150,'x','x','2025-01-01','present',0,NULL),(151,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','2025-01-30',0,NULL),(152,'x','x','2025-01-01',NULL,0,NULL),(153,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','2025-02-08',0,NULL),(154,'x','x','2025-01-01',NULL,0,NULL),(155,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(156,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','2025-01-31',0,NULL),(157,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','2025-01-31',0,NULL),(158,'h','h','2025-01-29',NULL,0,NULL),(159,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','2025-01-31',0,NULL),(160,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','2025-01-31',0,NULL),(161,'h','j','2024-12-29','2025-01-31',0,NULL),(162,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(163,'h','j','2024-12-29',NULL,0,NULL),(164,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(165,'j','g','2025-01-08','2025-01-30',0,NULL),(166,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','2025-01-31',0,NULL),(167,'j','g','2025-01-08',NULL,0,NULL),(168,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','2025-01-31',0,NULL),(169,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(170,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','2025-01-31',0,NULL),(171,'h','j','2025-01-24',NULL,0,NULL),(172,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(173,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(174,'jj','kk','2025-01-13','',0,NULL),(175,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(176,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','2025-01-31',0,NULL),(177,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(178,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(179,'gg','hhh','2025-01-13','',0,NULL),(180,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(181,'j','j','2025-01-01','2025-01-31',0,NULL),(182,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(183,'j','j','2025-01-01',NULL,0,NULL),(184,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(185,'j','kk','2024-12-31',NULL,0,NULL),(186,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(187,'j','k','2025-01-02',NULL,0,NULL),(188,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(189,'h','h','2025-01-13','',0,NULL),(190,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(191,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(192,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(193,'h','j','2025-01-01','present',0,NULL),(194,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(195,'h','j','2025-01-01','2025-01-31',0,NULL),(196,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(197,'h','j','2025-01-01',NULL,0,NULL),(198,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(199,'h','j','2025-01-01','2025-01-31',0,NULL),(200,'n','n','2025-01-01',NULL,0,NULL),(201,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(202,'h','j','2025-01-01','2025-01-31',0,NULL),(203,'n','n','2025-01-01','2025-02-08',0,NULL),(204,'d','d','2025-01-13',NULL,0,NULL),(205,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(206,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(207,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(208,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','2025-01-30',0,NULL),(209,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(210,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(211,'j','j','2024-12-31','present',0,NULL),(212,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(213,'j','j','2024-12-31','',0,NULL),(214,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(215,'j','j','2024-12-31','',0,NULL),(216,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','2025-01-29',0,NULL),(217,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(218,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','2025-01-31',0,NULL),(219,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(220,'j','k','2025-01-01','',0,NULL),(221,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(222,'j','k','2025-01-01',NULL,0,NULL),(223,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','2025-01-31',0,NULL),(224,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','2025-01-31',0,NULL),(225,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(226,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(227,'h','h','2025-02-05','',0,NULL),(228,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(229,'hh','jj','2025-01-13','2025-02-05',0,NULL),(230,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(231,'hh','jj','2024-12-30','2025-02-05',0,NULL),(232,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(233,'hh','jj','2024-12-30','',0,NULL),(234,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(235,'hh','jj','2024-12-30','present',0,NULL),(236,'j','k','2025-01-13','present',0,NULL),(237,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(238,'hh','jj','2024-12-30','present',0,NULL),(239,'j','k','2025-01-13','present',0,NULL),(240,'k','l','2025-01-01','',0,NULL),(241,'Bachelor of Science Computer Science','Masinde Muliro University Of Science and Technology','2024-02-06','present',0,NULL),(242,'hh','jj','2024-12-30','present',0,NULL),(243,'j','k','2025-01-13','present',0,NULL),(244,'k','l','2025-01-01','',0,NULL),(281,'BACHELOR OF SCIENCE IN COMPUTER SCIENCE','MASINDE MULIRO UNIVERSITY SCHOOL OF SCIENCE AND TECHNOLOGY','08/15/2019','08/23/2023',0,58),(282,' BACHELOR OF SCIENCE IN COMPUTER SCIENCE ','BURA GIRLS HIGH SCHOOL','01/01/2015','11/29/2018',0,58);
/*!40000 ALTER TABLE `education` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `experience`
--

DROP TABLE IF EXISTS `experience`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `experience` (
  `experienceid` int NOT NULL AUTO_INCREMENT,
  `position` varchar(200) DEFAULT NULL,
  `organisation` varchar(200) DEFAULT NULL,
  `start` varchar(255) DEFAULT NULL,
  `end` varchar(255) DEFAULT NULL,
  `current` date DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`experienceid`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `experience_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `registration` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `experience`
--

LOCK TABLES `experience` WRITE;
/*!40000 ALTER TABLE `experience` DISABLE KEYS */;
INSERT INTO `experience` VALUES (1,'intern','healthit','2024-02-01','2024-12-21','0000-00-00',NULL),(3,'Software Developer-Intern','HealthIT','2024-09-03','2024-12-04',NULL,62),(4,'Attachments','Nairobi County','2023-07-05','2024-12-25',NULL,62),(23,'ENUMERATOR','KENYA NATIONAL BEREAU OF STATISTICS','08/11/2019','08/28/2019',NULL,58),(24,'INTERN','USAID HEALTHIT','02/01/2024','10/30/2024',NULL,58),(25,'ATTACHE','NAIROBI COUNTY','05/01/2022','07/31/2022',NULL,58),(26,'INTERN',' USAID  KDHEA','11/01/2024','PRESENT',NULL,58),(27,'E','E','01/01/2025','PRESENT',NULL,58),(28,'E','E','01/01/2025','01/31/2025',NULL,58);
/*!40000 ALTER TABLE `experience` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `form`
--

DROP TABLE IF EXISTS `form`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `form` (
  `id` int NOT NULL AUTO_INCREMENT,
  `file` varchar(2000) DEFAULT NULL,
  `title` varchar(200) DEFAULT NULL,
  `message` mediumtext,
  `create_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(20) DEFAULT 'pending',
  `user_id` int DEFAULT NULL,
  `categoryId` int DEFAULT NULL,
  `likes` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_user_id` (`user_id`),
  KEY `fk_categoryId` (`categoryId`),
  CONSTRAINT `fk_categoryId` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`categoryId`),
  CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `registration` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=131 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `form`
--

LOCK TABLES `form` WRITE;
/*!40000 ALTER TABLE `form` DISABLE KEYS */;
INSERT INTO `form` VALUES (117,'/uploads/images/1734184416626.jpeg','sssssssss','<p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p><h2>What is Lorem Ipsum?</h2><p><strong>Lorem Ipsum</strong> is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>','2024-12-14 13:53:36','2024-12-14 13:53:36','approved',56,NULL,11),(118,'/uploads/images/1734184519943.jpeg','aaaaaaaaaaa','<p>&nbsp;</p><h2>What is Lorem Ipsum?</h2><p><strong>Lorem Ipsum</strong> is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>','2024-12-14 13:55:19','2024-12-14 13:55:19','approved',NULL,NULL,0),(119,'/uploads/images/1734600321404.jpeg','sssssssss',' <form action=\"/api/post\" method=\"post\" enctype=\"multipart/form-data\">\r\n            <div class=\"form-floating\">\r\n              <select class=\"form-select\" id=\"floatingSelect\" name=\"categoryId\" aria-label=\"Category Select\" required>\r\n                <option value=\"\" disabled selected>Select a Category</option>\r\n                <% categories.forEach(category => { %>\r\n                  <option value=\"<%= category.categoryId %>\"><%= category.category %></option>\r\n                <% }) %>\r\n              </select>\r\n              <label for=\"floatingSelect\">Categories</label>\r\n            </div>\r\n            \r\n            <div class=\"mb-3\">\r\n              <label for=\"titleInput\" class=\"form-label\">Title</label>\r\n              <input type=\"text\" class=\"form-control\" id=\"titleInput\" name=\"title\" required>\r\n            </div>\r\n            <div class=\"mb-3\">\r\n              <label for=\"exampleFormControlTextarea1\" class=\"form-label\">Body</label>\r\n              <textarea class=\"form-control\" id=\"exampleFormControlTextarea1\" rows=\"5\" name=\"message\" required></textarea>\r\n            </div>\r\n            <div class=\"mb-3\">\r\n              <label for=\"fileInput\" class=\"form-label\">Upload File</label>\r\n              <input type=\"file\" class=\"form-control\" id=\"fileInput\" name=\"file\">\r\n            </div>\r\n            <button type=\"submit\" class=\"btn btn-primary\">Post</button>\r\n          </form>','2024-12-19 09:25:21','2024-12-19 09:25:21','pending',NULL,4,0),(120,'/uploads/images/1734602026614.jpeg','xxxxxxxxxx','ccccccccccccccccc','2024-12-19 09:53:46','2024-12-19 09:53:46','pending',NULL,5,0),(121,'/uploads/images/1734602189523.jpeg','sfnd','.\r\nWhy do we use it?\r\n\r\nIt is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using \'Content here, content here\', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for \'lorem ipsum\' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).\r\n','2024-12-19 09:56:29','2024-12-19 09:56:29','pending',NULL,5,0),(122,'/uploads/images/1734602246129.jpeg','sfnd','.\r\nWhy do we use it?\r\n\r\nIt is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using \'Content here, content here\', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for \'lorem ipsum\' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).\r\n','2024-12-19 09:57:26','2024-12-19 09:57:26','pending',NULL,5,0),(123,'/uploads/images/1734602297083.jpeg','XCAPITAL','.\r\nWhy do we use it?\r\n\r\nIt is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using \'Content here, content here\', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for \'lorem ipsum\' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).\r\n','2024-12-19 09:58:17','2024-12-19 09:58:17','pending',NULL,4,0),(124,'/uploads/images/1734602435398.jpeg','XCAPITAL','.\r\nWhy do we use it?\r\n\r\nIt is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using \'Content here, content here\', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for \'lorem ipsum\' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).\r\n','2024-12-19 10:00:35','2024-12-19 10:00:35','pending',NULL,4,0),(125,'/uploads/images/1734602856103.jpeg','ckedirot','<div class=\"modal fade\" id=\"exampleModal\" tabindex=\"-1\" aria-labelledby=\"exampleModalLabel\" aria-hidden=\"true\">\r\n  <div class=\"modal-dialog modal-dialog-scrollable modal-lg\">\r\n    <div class=\"modal-content\">\r\n      <div class=\"modal-header\">\r\n        <h5 class=\"modal-title\" id=\"exampleModalLabel\">Create a Post</h5>\r\n        <button type=\"button\" class=\"btn-close\" data-bs-dismiss=\"modal\" aria-label=\"Close\"></button>\r\n      </div>\r\n      <div class=\"modal-body\">\r\n        <form id=\"createPostForm\" action=\"/api/post\" method=\"post\" enctype=\"multipart/form-data\">\r\n          <div class=\"form-floating mb-3\">\r\n            <select class=\"form-select\" id=\"categorySelect\" name=\"categoryId\" required>\r\n              <option value=\"\" disabled selected>Select a Category</option>\r\n              <% categories.forEach(category => { %>\r\n                <option value=\"<%= category.categoryId %>\"><%= category.category %></option>\r\n              <% }) %>\r\n            </select>\r\n            <label for=\"categorySelect\">Category</label>\r\n          </div>\r\n          <div class=\"mb-3\">\r\n            <label for=\"titleInput\" class=\"form-label\">Title</label>\r\n            <input type=\"text\" class=\"form-control\" id=\"titleInput\" name=\"title\" required>\r\n          </div>\r\n          <div class=\"mb-3\">\r\n            <label for=\"bodyTextarea\" class=\"form-label\">Body</label>\r\n            <textarea class=\"form-control\" id=\"bodyTextarea\" name=\"message\" rows=\"5\" required></textarea>\r\n          </div>\r\n          <div class=\"mb-3\">\r\n            <label for=\"fileInput\" class=\"form-label\">Upload File</label>\r\n            <input type=\"file\" class=\"form-control\" id=\"fileInput\" name=\"file\">\r\n          </div>\r\n          <div class=\"modal-footer\">\r\n            <button type=\"button\" class=\"btn btn-secondary\" data-bs-dismiss=\"modal\">Close</button>\r\n            <button type=\"submit\" class=\"btn btn-primary\">Post</button>\r\n          </div>\r\n        </form>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>','2024-12-19 10:07:36','2024-12-19 10:07:36','pending',NULL,4,0),(126,'/uploads/images/1734603467057.jpeg','ckedirot','<div class=\"modal fade\" id=\"exampleModal\" tabindex=\"-1\" aria-labelledby=\"exampleModalLabel\" aria-hidden=\"true\">\r\n  <div class=\"modal-dialog modal-dialog-scrollable modal-lg\">\r\n    <div class=\"modal-content\">\r\n      <div class=\"modal-header\">\r\n        <h5 class=\"modal-title\" id=\"exampleModalLabel\">Create a Post</h5>\r\n        <button type=\"button\" class=\"btn-close\" data-bs-dismiss=\"modal\" aria-label=\"Close\"></button>\r\n      </div>\r\n      <div class=\"modal-body\">\r\n        <form id=\"createPostForm\" action=\"/api/post\" method=\"post\" enctype=\"multipart/form-data\">\r\n          <div class=\"form-floating mb-3\">\r\n            <select class=\"form-select\" id=\"categorySelect\" name=\"categoryId\" required>\r\n              <option value=\"\" disabled selected>Select a Category</option>\r\n              <% categories.forEach(category => { %>\r\n                <option value=\"<%= category.categoryId %>\"><%= category.category %></option>\r\n              <% }) %>\r\n            </select>\r\n            <label for=\"categorySelect\">Category</label>\r\n          </div>\r\n          <div class=\"mb-3\">\r\n            <label for=\"titleInput\" class=\"form-label\">Title</label>\r\n            <input type=\"text\" class=\"form-control\" id=\"titleInput\" name=\"title\" required>\r\n          </div>\r\n          <div class=\"mb-3\">\r\n            <label for=\"bodyTextarea\" class=\"form-label\">Body</label>\r\n            <textarea class=\"form-control\" id=\"bodyTextarea\" name=\"message\" rows=\"5\" required></textarea>\r\n          </div>\r\n          <div class=\"mb-3\">\r\n            <label for=\"fileInput\" class=\"form-label\">Upload File</label>\r\n            <input type=\"file\" class=\"form-control\" id=\"fileInput\" name=\"file\">\r\n          </div>\r\n          <div class=\"modal-footer\">\r\n            <button type=\"button\" class=\"btn btn-secondary\" data-bs-dismiss=\"modal\">Close</button>\r\n            <button type=\"submit\" class=\"btn btn-primary\">Post</button>\r\n          </div>\r\n        </form>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>','2024-12-19 10:17:47','2024-12-19 10:17:47','pending',NULL,4,0),(127,'/uploads/images/1734604041866.jpg','xe','<p>&lt;form id=\"createPostForm\" action=\"/api/post\" method=\"post\" enctype=\"multipart/form-data\" novalidate&gt;<br>&nbsp;</p>','2024-12-19 10:27:21','2024-12-19 10:27:21','pending',NULL,5,0),(128,'/uploads/images/1734604089421.jpeg','mitchelle category','<p>&lt;form id=\"createPostForm\" action=\"/api/post\" method=\"post\" enctype=\"multipart/form-data\" novalidate&gt;<br>&nbsp;</p>','2024-12-19 10:28:09','2024-12-19 10:28:09','approved',NULL,4,0),(129,'/uploads/images/1734604094536.jpeg','mitchelle category','<p>&lt;form id=\"createPostForm\" action=\"/api/post\" method=\"post\" enctype=\"multipart/form-data\" novalidate&gt;<br>&nbsp;</p>','2024-12-19 10:28:14','2024-12-19 10:28:14','approved',NULL,4,0),(130,'/uploads/images/1734604987068.jpeg','n','<p>&lt;form id=\"createPostForm\" action=\"/api/post\" method=\"post\" enctype=\"multipart/form-data\" novalidate&gt; &lt;div class=\"form-floating mb-3\"&gt; &lt;select class=\"form-select\" id=\"categorySelect\" name=\"categoryId\" required&gt; &lt;option value=\"\" disabled selected&gt;Select a Category&lt;/option&gt; &lt;% categories.forEach(category =&gt; { %&gt; &lt;option value=\"&lt;%= category.categoryId %&gt;\"&gt;&lt;%= category.category %&gt;&lt;/option&gt; &lt;% }) %&gt; &lt;/select&gt; &lt;label for=\"categorySelect\"&gt;Category&lt;/label&gt; &lt;/div&gt; &lt;div class=\"mb-3\"&gt; &lt;label for=\"titleInput\" class=\"form-label\"&gt;Title&lt;/label&gt; &lt;input type=\"text\" class=\"form-control\" id=\"titleInput\" name=\"title\" required&gt; &lt;/div&gt; &lt;div class=\"mb-3\"&gt; &lt;label for=\"bodyTextarea\" class=\"form-label\"&gt;Body&lt;/label&gt; &lt;textarea class=\"form-control\" id=\"bodyTextarea\" name=\"message\" rows=\"5\" required&gt;&lt;/textarea&gt; &lt;/div&gt; &lt;div class=\"mb-3\"&gt; &lt;label for=\"fileInput\" class=\"form-label\"&gt;Upload File&lt;/label&gt; &lt;input type=\"file\" class=\"form-control\" id=\"fileInput\" name=\"file\"&gt; &lt;/div&gt; &lt;div class=\"modal-footer\"&gt; &lt;button type=\"button\" class=\"btn btn-secondary\" data-bs-dismiss=\"modal\"&gt;Close&lt;/button&gt; &lt;button type=\"submit\" class=\"btn btn-primary\"&gt;Post&lt;/button&gt; &lt;/div&gt; &lt;/form&gt;</p>','2024-12-19 10:43:07','2024-12-19 10:43:07','approved',NULL,4,0);
/*!40000 ALTER TABLE `form` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `languages`
--

DROP TABLE IF EXISTS `languages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `languages` (
  `languagesId` int NOT NULL AUTO_INCREMENT,
  `languages` varchar(200) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`languagesId`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `languages_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `registration` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `languages`
--

LOCK TABLES `languages` WRITE;
/*!40000 ALTER TABLE `languages` DISABLE KEYS */;
INSERT INTO `languages` VALUES (1,'Kiswahili',62),(2,'English',62),(3,'French',62),(4,'Swahili',62),(5,'English',58),(6,'Spanish',58),(7,'j',58),(8,'d',58),(9,'Spanish',58),(10,'English',58),(11,'taita',58);
/*!40000 ALTER TABLE `languages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `likes`
--

DROP TABLE IF EXISTS `likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `likes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `blog_id` int NOT NULL,
  `user_id` int NOT NULL,
  `commentId` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `blog_id` (`blog_id`,`user_id`,`commentId`),
  KEY `user_id` (`user_id`),
  KEY `commentId` (`commentId`),
  CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`blog_id`) REFERENCES `form` (`id`) ON DELETE CASCADE,
  CONSTRAINT `likes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `registration` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `likes_ibfk_3` FOREIGN KEY (`commentId`) REFERENCES `comments` (`commentId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `likes`
--

LOCK TABLES `likes` WRITE;
/*!40000 ALTER TABLE `likes` DISABLE KEYS */;
/*!40000 ALTER TABLE `likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_details`
--

DROP TABLE IF EXISTS `personal_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_details` (
  `userdetailsid` int NOT NULL AUTO_INCREMENT,
  `salutation` varchar(200) DEFAULT NULL,
  `fullName` varchar(200) DEFAULT NULL,
  `about` varchar(2500) DEFAULT NULL,
  `gender` varchar(200) DEFAULT NULL,
  `gmail` varchar(200) DEFAULT NULL,
  `number_` varchar(200) DEFAULT NULL,
  `dob` varchar(200) DEFAULT NULL,
  `ethnicity` varchar(200) DEFAULT NULL,
  `religion` varchar(200) DEFAULT NULL,
  `image` varchar(2500) DEFAULT NULL,
  `nationality` varchar(200) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `create_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`userdetailsid`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `personal_details_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `registration` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_details`
--

LOCK TABLES `personal_details` WRITE;
/*!40000 ALTER TABLE `personal_details` DISABLE KEYS */;
INSERT INTO `personal_details` VALUES (4,'miss',NULL,NULL,'female','ngoliwachoo@gmail.com','0708607402','2024-12-18','kamba','christian',NULL,'kenyan',59,'2024-12-21 09:29:55'),(7,'Miss',NULL,'Motivated backend developer striving to become a full-stack developer, with a strong passion for Node.js/Express and Python/Django. Enthusiastic about learning new technologies and continuously enhancing my skill set\r\n\r\n','female','ngolimwachoo@gmail.com','0708607402','2004-03-17','teso','Christian',NULL,'Kenyan',62,'2024-12-25 09:43:43'),(11,'Miss','MITCHELLE NGOLI MWACHOO','Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.\r\nWhy do we use it?\r\n\r\nIt is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using \'Content here, content here\', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for \'lorem ipsum\' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).\r\n','Female','ngoliwachoo@gmail.com','0708607402','08/04/2000','Kamba','Christian',NULL,'Kenyan',58,NULL);
/*!40000 ALTER TABLE `personal_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `profile_status`
--

DROP TABLE IF EXISTS `profile_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profile_status` (
  `id` int NOT NULL,
  `personal_details_completed` tinyint(1) DEFAULT '0',
  `education_completed` tinyint(1) DEFAULT '0',
  `experience_completed` tinyint(1) DEFAULT '0',
  `references_completed` tinyint(1) DEFAULT '0',
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `profile_status_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `registration` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `profile_status`
--

LOCK TABLES `profile_status` WRITE;
/*!40000 ALTER TABLE `profile_status` DISABLE KEYS */;
/*!40000 ALTER TABLE `profile_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registration`
--

DROP TABLE IF EXISTS `registration`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registration` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(200) DEFAULT NULL,
  `email` varchar(200) DEFAULT NULL,
  `phone` int DEFAULT NULL,
  `role` varchar(200) DEFAULT NULL,
  `password` varchar(200) DEFAULT NULL,
  `confirmpassword` varchar(200) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `verifiedToken` varchar(200) DEFAULT NULL,
  `isVerified` tinyint(1) DEFAULT NULL,
  `status` varchar(200) DEFAULT NULL,
  `profile_status` int DEFAULT '0',
  `remember_me` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registration`
--

LOCK TABLES `registration` WRITE;
/*!40000 ALTER TABLE `registration` DISABLE KEYS */;
INSERT INTO `registration` VALUES (55,'admin@gmail.com','admin@gmail.com',712345678,'admin','$2a$10$g4f5Q6TsZUjeOfdTdYSdcuWztxG8AncZ.m2p454vKRucCVugv31RC',NULL,NULL,'5e410f735cb631701a9ac537ea6f20630062c34548afea9c35483a125fc9e3c6',NULL,NULL,0,NULL),(56,'admin1@gmail.com','admin21@gmail.com',712702105,'admin','$2a$10$PbH55fGBkUs8Uik2W.ftguKE8cDBVtmp1sMHmKLi6SwIlBTfzDZ8e',NULL,NULL,'5e0cf60713729cf56fa1ab02ddd8b811625e461cb2edc13e3b71bb11bf8dc024',NULL,NULL,0,NULL),(58,'ngolimwachoo@gmail.com','ngolimwachoo@gmail.com',NULL,NULL,'$2a$10$0QlEry22mFinIdjplmVKce8xh2Ujl4DdugQ2OrouTwRoRwl9cc5au',NULL,NULL,NULL,1,NULL,3,NULL),(59,'mitchellengoli@gmail.com','mitchellengoli@gmail.com',NULL,NULL,'$2a$10$af07Lluy9sMEFOB7w6jt4ekv7PMmf06QMIxb9pX7fdyibhTCE2Pk6',NULL,NULL,NULL,1,NULL,4,NULL),(62,'mmwachoo@gmail.com','mmwachoo@gmail.com',NULL,NULL,'$2a$10$RltNbg6l9J5h/7UYiS2nUusVm7EzCH6/eIjkICuPknpdcW.VNJk7O',NULL,NULL,NULL,1,NULL,7,NULL),(65,'mwachoo','mitauobed@gmail.com',NULL,NULL,'$2a$10$sBL3v/IUgVMCQ4YGfw4fpulp7RFmIovtD4vnaI1cpNVSvaCg7liIC',NULL,NULL,'09cad9ee4905440418b9cc55acefb88895f3aef6e32c5dc605b9e31bc2fc13d6',NULL,NULL,0,NULL),(66,'admin123@gmail.com','admin123@gmail.com',712345678,'admin','Mitchelle@254',NULL,NULL,'36293037e9019051c64d4871d06d21327b9ca830023f7d480fe9e3b6e61a27a0',NULL,NULL,0,NULL),(67,'admin321@gmail.com','admin321@gmail.com',NULL,NULL,'$2a$10$aMmxNHsggjp9u5ITZwLuGuw0RC33o/GHvYfiFGOBMkqiSFAOXEuqm',NULL,NULL,'54df695b22734ea4b5d0f2da8f3e53d8adcae7a63e8c81c9f8681a23917f93a5',NULL,NULL,0,NULL);
/*!40000 ALTER TABLE `registration` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resposiblity`
--

DROP TABLE IF EXISTS `resposiblity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resposiblity` (
  `id` int NOT NULL AUTO_INCREMENT,
  `positionId` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `responsibility` text,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `positionId` (`positionId`),
  CONSTRAINT `resposiblity_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `registration` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `resposiblity_ibfk_2` FOREIGN KEY (`positionId`) REFERENCES `experience` (`experienceid`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resposiblity`
--

LOCK TABLES `resposiblity` WRITE;
/*!40000 ALTER TABLE `resposiblity` DISABLE KEYS */;
INSERT INTO `resposiblity` VALUES (25,23,58,'Deployment and Training of 2.x KenyaEMR Palladium,2.x facility wide KenyaEMR plus and 3.x KenyaEMR Facility Wide.'),(26,23,58,'Physical and Remote TA support to all assigned facilities.'),(27,23,58,'Deployment and Training of  3.x KenyaEMR Facility Wide.'),(28,23,58,'Effective teamwork with supporting partners.'),(29,24,58,'Deployment and Training of 2.x KenyaEMR Palladium,2.x facility wide KenyaEMR plus and 3.x KenyaEMR Facility Wide.'),(30,24,58,'Support on CHP registry.'),(31,24,58,'Documentation of bugs of Health Information Systems.'),(32,24,58,'Data Collection and analysis using KoboToolbox.'),(33,24,58,'Physical and Remote TA support to all assigned facilities'),(34,24,58,'Database management.'),(35,24,58,'Effective teamwork with supporting partners.'),(36,25,58,'OS Installation and Network configuration'),(37,25,58,'Hard Disk slaving and Database management'),(38,25,58,'Cleaning and maintenance of hardware'),(39,26,58,'Physical and Remote TA support to all assigned facilities.'),(40,26,58,'Deployment and Training of  3.x KenyaEMR Facility Wide.'),(41,26,58,'Effective teamwork with supporting partners.'),(42,26,58,'Database management.'),(43,27,58,'E'),(44,27,58,'E'),(45,28,58,'E');
/*!40000 ALTER TABLE `resposiblity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `skills`
--

DROP TABLE IF EXISTS `skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `skills` (
  `skillsId` int NOT NULL AUTO_INCREMENT,
  `skilltitle` varchar(200) DEFAULT NULL,
  `skills` varchar(200) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`skillsId`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `skills_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `registration` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `skills`
--

LOCK TABLES `skills` WRITE;
/*!40000 ALTER TABLE `skills` DISABLE KEYS */;
INSERT INTO `skills` VALUES (1,'Backend Development','Nodejs/Expressjs,Python/Django,PHP/Laravel',62),(2,'Front-end Development','Reactjs ,Vuejs',62),(13,'Backend Languages:Python/Django,Nodejs/Express',NULL,58),(14,'Frontend Languages:Reactjs,HTML,CSS, Bootstrap,Bootswatch',NULL,58),(15,'Databases:Postgresql,Mongodb,Mysql',NULL,58),(16,'Content Management System:Wordpress,Figma',NULL,58),(17,'Version Control System: Git',NULL,58),(18,'API Development:Rest,GraphQL(Applications used:Postman,  Thunder Client)',NULL,58),(19,'OS:ChromeOS,Linux,Windows',NULL,58),(20,'Team-Work  Oriented',NULL,58),(21,'Communication',NULL,58);
/*!40000 ALTER TABLE `skills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_references`
--

DROP TABLE IF EXISTS `user_references`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_references` (
  `referenceid` int NOT NULL AUTO_INCREMENT,
  `username` varchar(200) DEFAULT NULL,
  `relationship` varchar(255) DEFAULT NULL,
  `organisation` varchar(200) DEFAULT NULL,
  `email` varchar(200) DEFAULT NULL,
  `phone` varchar(200) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`referenceid`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_references_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `registration` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=110 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_references`
--

LOCK TABLES `user_references` WRITE;
/*!40000 ALTER TABLE `user_references` DISABLE KEYS */;
INSERT INTO `user_references` VALUES (103,'Mvurya Mgala',NULL,'HealthIT','ngolimwachoo@gmail.com','0712702105',62),(104,'Angel Jerush',NULL,'HealthIT','angeljerusha1@gmail.com','0712702105',62),(109,'DR,MVURYA MGALA','SUPERVISOR','USAID HEALTHIT','ngolimwachoo@gmail.com','0708607402',58);
/*!40000 ALTER TABLE `user_references` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-01-17 11:16:32
