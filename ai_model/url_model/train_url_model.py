import os
import re
import joblib
import pandas as pd
from urllib.parse import urlparse
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score

DATASET_PATH = "ai_model/datasets/url_dataset.csv"
MODEL_PATH = "ai_model/saved_models/url_model.pkl"


def extract_features(url):
    parsed = urlparse(url)
    domain = parsed.netloc.lower()

    return [
        len(url),
        url.count("."),
        url.count("-"),
        sum(char.isdigit() for char in url),
        url.count("@"),
        int(parsed.scheme == "https"),
        len(domain.split(".")),
        int(bool(re.search(r"\d+\.\d+\.\d+\.\d+", domain))),
        sum(word in url.lower() for word in [
            "login", "verify", "account",
            "password", "secure", "update"
        ])
    ]


def train_model():
    os.makedirs("ai_model/saved_models", exist_ok=True)
    data = pd.read_csv(DATASET_PATH).dropna().drop_duplicates()

    X = [extract_features(str(url)) for url in data["url"]]
    y = data["label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    predictions = model.predict(X_test)
    print("URL Model Accuracy:", accuracy_score(y_test, predictions))
    print(classification_report(y_test, predictions, zero_division=0))

    joblib.dump(model, MODEL_PATH)
    print("URL Model saved successfully!")


if __name__ == "__main__":
    train_model()
