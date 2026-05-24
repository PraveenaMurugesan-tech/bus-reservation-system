import mysql.connector
from mysql.connector import errorcode

# Configure the connection settings for your MySQL server.
# Update username/password if your local MySQL uses different credentials.
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "root",
    "database": "bus_reservation",
    "autocommit": True,
    "raise_on_warnings": True,
}


def get_connection():
    """Return a new database connection."""
    try:
        return mysql.connector.connect(**DB_CONFIG)
    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            raise RuntimeError("MySQL access denied: check username and password")
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            raise RuntimeError("Database does not exist: run schema.sql first")
        else:
            raise
