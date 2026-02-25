# Fitness Tracker Backend

Backend service for the Fitness Tracker application — a Spring Boot REST API that manages users and fitness activity data such as workouts, goals, and metrics.

This backend supports the core functionality of the fitness app, exposing RESTful endpoints to create, read, update, and delete fitness records and user accounts.

## 🚀 Features

- 🏃 **User management** — sign up, login, profile updates  
- 🏋️ **Workout logging** — create and track workouts and exercise sessions  
- 📊 **Analytics endpoints** — fetch reports and summaries of fitness data   
- 🗃️ **Database integration** using JPA / Hibernate  
- 📦 Clean layered architecture (controllers → services → repositories)

---

## 🧱 Architecture
# Fitness Tracker Backend

Backend service for the Fitness Tracker application — a Spring Boot REST API that manages users and fitness activity data such as workouts, goals, and metrics.

This backend supports the core functionality of the fitness app, exposing RESTful endpoints to create, read, update, and delete fitness records and user accounts.

## 🚀 Features

- 🏃 **User management** — sign up, login, profile updates  
- 🏋️ **Workout logging** — create and track workouts and exercise sessions  
- 📊 **Analytics endpoints** — fetch reports and summaries of fitness data  
- 🔐 **Spring Security** integration (optional) for authentication & authorization  
- 🗃️ **Database integration** using JPA / Hibernate  
- 📦 Clean layered architecture (controllers → services → repositories)

---

## 🧱 Architecture

---

## 🛠️ Technologies

- Java 17+  
- Spring Boot  
- Spring Web (REST support)  
- Spring Data JPA  
- Hibernate  
- PostgreSQL / MySQL (or any supported RDBMS)  
- (Optional) Spring Security  
- Maven / Gradle build tool

---

## 🚀 Getting Started

### Prerequisites

- JDK 17 or higher  
- Maven or Gradle  
- Local or hosted database (PostgreSQL, MySQL, etc.)

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/Fitness-Tracker.git
   cd Fitness-Tracker/backend
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/fitnesstracker
    username: your_db_user
    password: your_db_password
  jpa:
    hibernate:
      ddl-auto: update
./mvnw spring-boot:run
