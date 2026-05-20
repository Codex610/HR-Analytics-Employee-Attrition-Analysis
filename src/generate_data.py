"""
generate_data.py
----------------
Loads the REAL IBM HR Analytics dataset from data/.
Falls back to a synthetic replica only if the file is missing.
"""
import os
import pandas as pd


DATA_PATH = "data/WA_Fn-UseC_-HR-Employee-Attrition.csv"


def generate_hr_dataset() -> pd.DataFrame:
    """Load the real IBM HR Analytics dataset (1,470 employees)."""
    if os.path.exists(DATA_PATH):
        df = pd.read_csv(DATA_PATH)
        print(f"  ✓  Loaded REAL dataset: {df.shape[0]} rows × {df.shape[1]} cols")
        return df
    raise FileNotFoundError(
        f"Real dataset not found at '{DATA_PATH}'.\n"
        "Download from: https://www.kaggle.com/datasets/pavansubhasht/ibm-hr-analytics-attrition-dataset\n"
        "and place it at data/WA_Fn-UseC_-HR-Employee-Attrition.csv"
    )


if __name__ == "__main__":
    df = generate_hr_dataset()
    print(df.head())
    print(f"\nAttrition rate: {(df['Attrition']=='Yes').mean():.1%}")
