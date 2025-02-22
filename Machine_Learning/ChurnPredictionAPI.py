from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score
from datasets import load_dataset
import pickle
import os

app = Flask(__name__)

# Global variables for model and scaler
model = None
scaler = None
label_encoders = {}
feature_columns = None

# //? Load and preprocess the dataset
def load_and_prepare_data():
    global model, scaler, label_encoders, feature_columns
    
    #  Load dataset from Hugging Face
    dataset = load_dataset("aai510-group1/telco-customer-churn")
    df = pd.DataFrame(dataset['train'])
    
    # Handle missing values (replace empty strings with NaN and drop)
    df.replace('', np.nan, inplace=True)
    df.dropna(inplace=True)
    
    # Define target and features
    target = 'Churn'
    feature_columns = [col for col in df.columns if col != target]
    
    # Encode categorical variables
    X = df[feature_columns].copy()
    y = df[target].apply(lambda x: 1 if x == 'Yes' else 0)  # Convert Yes/No to 1/0
    
    for col in X.columns:
        if X[col].dtype == 'object':
            label_encoders[col] = LabelEncoder()
            X[col] = label_encoders[col].fit_transform(X[col])
    
    # Scale numerical features
    scaler = StandardScaler()
    X = scaler.fit_transform(X)
    
    # Split data and train model
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = LogisticRegression(max_iter=1000)
    model.fit(X_train, y_train)
    
    # Print accuracy for verification
    y_pred = model.predict(X_test)
    print(f"Model Accuracy: {accuracy_score(y_test, y_pred):.2f}")
    
    # Save model and scaler for later use
    with open('model.pkl', 'wb') as f:
        pickle.dump(model, f)
    with open('scaler.pkl', 'wb') as f:
        pickle.dump(scaler, f)

# Load pre-trained model if available
def load_model():
    global model, scaler, feature_columns
    if os.path.exists('model.pkl') and os.path.exists('scaler.pkl'):
        with open('model.pkl', 'rb') as f:
            model = pickle.load(f)
        with open('scaler.pkl', 'rb') as f:
            scaler = pickle.load(f)
        # Hardcode feature columns since they’re not saved
        feature_columns = ['gender', 'SeniorCitizen', 'Partner', 'Dependents', 'tenure', 
                           'PhoneService', 'MultipleLines', 'InternetService', 'OnlineSecurity', 
                           'OnlineBackup', 'DeviceProtection', 'TechSupport', 'StreamingTV', 
                           'StreamingMovies', 'Contract', 'PaperlessBilling', 'PaymentMethod', 
                           'MonthlyCharges', 'TotalCharges']
    else:
        load_and_prepare_data()

# Helper function to preprocess input data
def preprocess_input(data):
    df_input = pd.DataFrame([data])
    for col in label_encoders:
        if col in df_input.columns:
            df_input[col] = label_encoders[col].transform(df_input[col])
    X = scaler.transform(df_input[feature_columns])
    return X

# //? API endpoint for churn prediction
@app.route('/predict', methods=['POST'])
def predict_churn():
    if model is None or scaler is None:
        return jsonify({"error": "Model not loaded"}), 500
    
    data = request.get_json()
    try:
        X = preprocess_input(data)
        churn_prob = model.predict_proba(X)[0][1]  # Probability of churn (class 1)
        return jsonify({
            "churn_score": float(churn_prob),
            "churn_prediction": "Yes" if churn_prob >= 0.5 else "No"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# API endpoint for trending churn reasons (based on feature importance)
@app.route('/trending_reasons', methods=['GET'])
def trending_reasons():
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500
    
    # Get feature importance from model coefficients
    importance = pd.DataFrame({
        "feature": feature_columns,
        "importance": np.abs(model.coef_[0])
    }).sort_values(by="importance", ascending=False).head(5)
    
    return jsonify({
        "trending_reasons": importance.to_dict(orient="records")
    })

# API endpoint for churn progression over time (using tenure as proxy)
@app.route('/churn_progression', methods=['GET'])
def churn_progression():
    dataset = load_dataset("aai510-group1/telco-customer-churn")
    df = pd.DataFrame(dataset['train'])
    df['Churn'] = df['Churn'].apply(lambda x: 1 if x == 'Yes' else 0)
    
    # Bin tenure into groups
    bins = [0, 12, 24, 36, 48, 60, 72]
    labels = ['0-12', '13-24', '25-36', '37-48', '49-60', '61-72']
    df['tenure_group'] = pd.cut(df['tenure'], bins=bins, labels=labels, include_lowest=True)
    
    # Calculate churn rate per tenure group
    progression = df.groupby('tenure_group')['Churn'].mean().reset_index()
    progression['churn_rate'] = progression['Churn'].apply(lambda x: f"{x:.2%}")
    
    return jsonify({
        "churn_progression": progression[['tenure_group', 'churn_rate']].to_dict(orient="records")
    })

if __name__ == '__main__':
    load_model()  # Load or train model on startup
    app.run(debug=True, host='0.0.0.0', port=5000)