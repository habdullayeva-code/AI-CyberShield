import pandas as pd

DATASET_PATH = "ai_model/datasets/url_dataset.csv"

def prepare_dataset():
    data = pd.read_csv(DATASET_PATH)

    data = data.dropna()
    data = data.drop_duplicates()

    print("Dataset successfully loaded!")
    print("Total URLs:", len(data))
    print("\nClass distribution:")
    print(data["label"].value_counts())

    print("\nDataset preview:")
    print(data.head())

    return data


if __name__ == "__main__":
    prepare_dataset()