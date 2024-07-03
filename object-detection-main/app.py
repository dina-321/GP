from flask import Flask, request, jsonify
from flask_cors import CORS
from object_detector import detect_cheating
import tempfile
import os

app = Flask(__name__)
CORS(app)

@app.route('/detect', methods=['POST'])
def detect():
    if request.method == 'POST':
        if 'imagefiles' not in request.files:
            return jsonify({'error': 'No files uploaded'})

        imagefiles = request.files.getlist('imagefiles')
        if len(imagefiles) == 0:  
            return jsonify({'error': 'No files uploaded'})

        temp_file_paths = []
        for image_file in imagefiles:  
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
            temp_file_paths.append(temp_file.name)
            image_file.save(temp_file)
            temp_file.close()

        results_dict = detect_cheating(temp_file_paths)

        for temp_file_path in temp_file_paths:
            os.unlink(temp_file_path)

        return jsonify(results_dict)  # Return the results_dict directly

if __name__ == '__main__':
    app.run(debug=True)
