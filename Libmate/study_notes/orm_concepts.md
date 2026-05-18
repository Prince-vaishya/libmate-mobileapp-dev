# Object-Relational Mapping (ORM) in Libmate

## Overview

This document explains how Object-Relational Mapping (ORM) is implemented in the Libmate backend project. We use **Flask-SQLAlchemy**, which is an extension for Flask that adds support for SQLAlchemy, a popular and powerful ORM for Python.

## 1. Where is it implemented and for what purpose?

The ORM implementation is primarily spread across three files in the `backend/app/` directory:

- **`backend/app/extensions.py`**: 
  - Initializes the SQLAlchemy instance (`db = SQLAlchemy()`). This is done in a separate file to avoid circular imports between the app initialization and the models.
- **`backend/app/models.py`**: 
  - This is where the core ORM concepts are applied. It defines Python classes (e.g., `Admin`, `User`, `Book`, `Borrowing`) that inherit from `db.Model`. Each class maps directly to a table in your relational database (e.g., `__tablename__ = 'users'`). The attributes of these classes (e.g., `user_id`, `full_name`) map to the columns of those tables.
- **`backend/app/__init__.py`**: 
  - This file binds the `db` instance to the running Flask application using `db.init_app(app)`. It connects the ORM to the database specified in your environment variables (like `SQLALCHEMY_DATABASE_URI`).

**Purpose:**
The primary purpose of the ORM is to translate Python objects into database rows and vice versa. It allows developers to interact with the database using Pythonic syntax rather than writing raw SQL queries for every database operation (CRUD - Create, Read, Update, Delete).

## 2. What does the workflow look like?

The typical workflow for using the ORM in this project is as follows:

1. **Define Schema:** You define the database structure as Python classes in `models.py`. You specify column types (e.g., `db.String`, `db.Integer`), constraints (e.g., `nullable=False`, `unique=True`), and relationships (e.g., `db.ForeignKey`).
2. **Interact in Services/API:** When an API endpoint is hit, you use the model classes to query or manipulate data.
   - **Creating Data:** Create a new instance of a model (`new_user = User(full_name='John', ...)`) and add it to the session (`db.session.add(new_user)`).
   - **Querying Data:** Fetch data using query methods (`User.query.filter_by(email=...).first()`).
3. **Commit Changes:** Once all changes are staged in the session, you commit them to the database (`db.session.commit()`).
4. **Serialization:** Models like `Admin`, `User`, and `Book` have a custom `to_dict()` method. This makes it incredibly easy to convert the Python object into a dictionary, which is then serialized to JSON and sent back to the frontend.
5. **Error Handling:** If an error occurs during a request, `__init__.py` has a global error handler (`@app.errorhandler(500)`) that executes `db.session.rollback()` to undo any pending database changes, preventing data corruption.

## 3. How is it working?

Under the hood, Flask-SQLAlchemy acts as a bridge:

- **Session Management:** It automatically manages database sessions tied to the Flask application context. When a request starts, a session is available. When the request ends, it cleans up the session.
- **Connection Pooling:** It handles maintaining a pool of connections to the database, so a new connection isn't opened and closed for every single query, which improves performance.
- **SQL Generation:** When you write `User.query.all()`, the ORM translates that Python method call into the appropriate raw SQL query (`SELECT * FROM users`), executes it against the database, and maps the returned rows back into `User` Python objects.
- **Hybrid Approach:** We can see in `__init__.py` and `models.py` that the project uses a hybrid approach. While most schema definition uses the ORM, it still utilizes raw SQL fragments using `from sqlalchemy import text` for things like database-level default timestamps (`server_default=text('CURRENT_TIMESTAMP')`) and initial seeding scripts.

## 4. Why did we need it and why not something else?

### Why we need an ORM:
- **Developer Productivity:** Writing Python code is generally faster and less error-prone than writing raw SQL strings scattered throughout the codebase.
- **Maintainability:** Schema changes are easier to manage when they are defined as Python classes. The relationships between tables are clearly visible in the code.
- **Security:** ORMs automatically parameterize queries, which provides built-in protection against SQL Injection attacks.
- **Abstraction:** It abstracts away the boilerplate of managing cursors, connections, and parsing database driver outputs.

### Why Flask-SQLAlchemy and not pure SQL or another ORM?
- **Why not pure SQL?** While pure SQL is faster, it results in hard-to-maintain code, string manipulation vulnerabilities, and requires manual parsing of tuples into dictionaries for JSON responses.
- **Why not another ORM (like Peewee or Django ORM)?** 
  - Django ORM is tightly coupled to the Django framework and cannot be easily used with Flask.
  - Flask-SQLAlchemy is the industry standard for Flask applications. It leverages the immense power of SQLAlchemy (one of the most mature Python ORMs) while abstracting away the complex setup required to make raw SQLAlchemy work seamlessly with Flask's request lifecycle. It provides the perfect balance of ease-of-use and power for this tech stack.
