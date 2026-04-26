Database Setup Guide

This folder contains the SQL scripts necessary to initialize and populate the **Study Tracker** database.

## 🛠️ Prerequisites
- **PostgreSQL Version:** 17
- **Default Port used:** `5432` 

## Getting Started

### 1. Create the Database and User
Log in to your PostgreSQL instance as a superuser (postgres) and run:

```sql
CREATE ROLE trackerdbadmin WITH LOGIN PASSWORD 'your_password_here';
ALTER ROLE trackerdbadmin CREATEDB;
CREATE DATABASE studytracker OWNER trackerdbadmin;
```

### 2. Initialize the Schema
Run the following command from your terminal (inside the db/ folder) to create all tables, enums, and types:

```sql
psql -h localhost -p 5432 -U trackerdbadmin -d studytracker -f planner_schema.sql
```
### 3. Import Seed Data
Once the tables are created, populate them with the test data:
```sql
psql -h localhost -p 5432 -U trackerdbadmin -d studytracker -f seeds.sql
```
