from flask import Flask, render_template, request, jsonify
import os
import subprocess
import re
from werkzeug.utils import secure_filename

app = Flask(__name__)

UPLOAD_FOLDER = "uploads"
WORK_FOLDER = "processing"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(WORK_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 2 * 1024 * 1024 * 1024


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
            "size": size
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route("/detect-scenes", methods=["POST"])
def detect_scenes():

    filename = request.json.get("filename")

    if not filename:
        return jsonify({
            "success": False,
            "error": "Filename missing."
        }), 400

    filename = secure_filename(filename)

    input_file = os.path.join(
        app.config["UPLOAD_FOLDER"],
        filename
    )

    if not os.path.exists(input_file):
        return jsonify({
            "success": False,
            "error": "Movie file nahi mili."
        }), 404

    try:

        command = [
            "ffmpeg",
            "-hide_banner",
            "-i",
            input_file,
            "-filter:v",
            "select='gt(scene,0.35)',showinfo",
            "-f",
            "null",
            "-"
        ]

        process = subprocess.run(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        output = process.stderr

        timestamps = []

        for line in output.splitlines():

            match = re.search(
                r"pts_time:([0-9.]+)",
                line
            )

            if match:
                timestamps.append(
                    float(match.group(1))
                )

        timestamps = sorted(
            list(set(timestamps))
        )

        return jsonify({
            "success": True,
            "filename": filename,
            "scene_count": len(timestamps),
            "timestamps": timestamps
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
