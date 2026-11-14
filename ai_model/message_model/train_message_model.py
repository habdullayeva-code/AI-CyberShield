import os
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score

DATASET_PATH = "ai_model/datasets/message_dataset.csv"
MODEL_PATH = "ai_model/saved_models/message_model.pkl"


def train_message_model():
    os.makedirs("ai_model/saved_models", exist_ok=True)
    data = pd.read_csv(DATASET_PATH).dropna().drop_duplicates()

    X = data["text"].astype(str)
    y = data["label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(max_features=5000)),
        ("clf", LogisticRegression(max_iter=1000))
    ])

    pipeline.fit(X_train, y_train)

    predictions = pipeline.predict(X_test)
    print("Message Model Accuracy:", accuracy_score(y_test, predictions))
    print(classification_report(y_test, predictions, zero_division=0))

    joblib.dump(pipeline, MODEL_PATH)
    print("Message Model saved successfully!")


if __name__ == "__main__":
    train_message_model()
