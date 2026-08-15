from flask import Flask, render_template, request, jsonify
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 2 * 1024 * 1024 * 1024  # 2 GB


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/upload", methods=["POST"])
def upload():

    if "movie" not in request.files:
        return jsonify({
            "success": False,
            "error": "Movie file nahi mili."
        }), 400

    file = request.files["movie"]

    if file.filename == "":
        return jsonify({
            "success": False,
            "error": "Movie select nahi ki gayi."
        }), 400

    filename = secure_filename(file.filename)

    if not filename:
        return jsonify({
            "success": False,
            "error": "Invalid filename."
        }), 400

    filepath = os.path.join(
        app.config["UPLOAD_FOLDER"],
        filename
    )

    try:
        file.save(filepath)

        size = os.path.getsize(filepath)

        return jsonify({
            "success": True,
            "filename": filename,
            "size": size,
            "message": "Movie successfully upload ho gayi."
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5001,
        debug=True
    )
