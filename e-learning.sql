-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 17, 2025 at 03:08 PM
-- Server version: 11.5.0-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `e-learning`
--

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `profile_picture` mediumblob DEFAULT NULL,
  `role` enum('Learner','Tutor','Admin') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `name`, `email`, `password`, `phone_number`, `profile_picture`, `role`) VALUES
(3, 'mm93', 'mmarquez@gmail.com', '25d55ad283aa400af464c76d713c07ad', NULL, NULL, 'Learner'),
(4, 'roin ganteng', 'callmepecco@gmail.com', '$2y$10$cNlfUutv0Go9M0ZDqeplYukTGsXZZVwjkspPyoWFphMtl4B6sbN8G', NULL, NULL, 'Learner'),
(5, 'roin', 'aaa@gmail.com', '$2y$10$4f0/VRsPY/qGkThhlqIOk.SktzS1O3H4ppbqeho0pHpBm5HV7M.uu', NULL, NULL, 'Learner'),
(6, 'John Doe', 'tes@gmail.com', '$2y$10$7IDqh1F7EK87ffXay4ljeOeRzL1sxUPPv3qO6M.i.yF6y3X8BYkbi', NULL, NULL, 'Learner');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
