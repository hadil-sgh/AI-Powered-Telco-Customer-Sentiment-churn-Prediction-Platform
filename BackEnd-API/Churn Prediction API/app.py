from flask import Flask, request, jsonify
import pickle
import pandas as pd

app = Flask(__name__)

# Load the saved model and feature names
with open("customer_churn_model.pkl", "rb") as f:
    model_data = pickle.load(f)

loaded_model = model_data["model"]
feature_names = model_data["features_names"]

# Load the saved encoders
with open("encoders.pkl", "rb") as f:
    encoders = pickle.load(f)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'api-name'}), 200

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get input JSON data
        input_data = request.json
        
        # Convert input to DataFrame
        input_data_df = pd.DataFrame([input_data])
        
        # Encode categorical features using the saved encoders
        for column, encoder in encoders.items():
            if column in input_data_df.columns:
                input_data_df[column] = encoder.transform(input_data_df[column])
        
        # Ensure only the feature columns expected by the model are used
        input_data_df = input_data_df[feature_names]
        
        # Make prediction
        prediction = loaded_model.predict(input_data_df)
        pred_prob = loaded_model.predict_proba(input_data_df)
        churn_score = pred_prob[0][1] * 100
        
        # Format the result
        result = {
            "Prediction": "Churn" if prediction[0] == 1 else "No Churn",
            "PredictionProbability": pred_prob[0].tolist(),
            "ChurnScore": f"{churn_score:.2f}%"
        }
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))  
    app.run(host='0.0.0.0', port=port, debug=False)
