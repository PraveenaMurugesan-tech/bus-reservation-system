from flask import Flask
from flask_cors import CORS
from routes.api_routes import api

app = Flask(__name__)
CORS(app)
app.register_blueprint(api)


@app.route("/", methods=["GET"])
def home():
    return {"message": "Bus Reservation API is running"}


if __name__ == "__main__":
    app.run(debug=True, port=5000)
