"""
data_preprocessing.py
---------------------
Cleans, encodes, and splits the IBM HR Analytics dataset for modelling.
"""
from __future__ import annotations

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler


# Columns that carry zero variance in the IBM dataset
_DROP_COLS = ["EmployeeCount", "EmployeeNumber", "Over18", "StandardHours"]

# Ordinal mappings so we preserve order information
_ORDINAL_MAP: dict[str, list] = {
    "BusinessTravel": ["Non-Travel", "Travel_Rarely", "Travel_Frequently"],
}


def load_data(path: str = "data/WA_Fn-UseC_-HR-Employee-Attrition.csv") -> pd.DataFrame:
    df = pd.read_csv(path)
    return df


def clean(df: pd.DataFrame) -> pd.DataFrame:
    df = df.drop(columns=[c for c in _DROP_COLS if c in df.columns], errors="ignore")
    df = df.drop_duplicates()
    df = df.dropna()
    return df.reset_index(drop=True)


def encode(df: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    """
    Returns encoded DataFrame and a dict of encoders for inverse-transform.
    - Binary / ordinal columns → integer codes
    - Multi-class nominals → one-hot (drop_first=True)
    """
    df = df.copy()
    encoders: dict = {}

    # Target
    df["Attrition"] = (df["Attrition"] == "Yes").astype(int)

    # Binary
    df["OverTime"] = (df["OverTime"] == "Yes").astype(int)
    df["Gender"] = (df["Gender"] == "Male").astype(int)

    # Ordinal
    for col, order in _ORDINAL_MAP.items():
        df[col] = df[col].map({v: i for i, v in enumerate(order)})
        encoders[col] = order

    # Nominal → one-hot
    nominal_cols = df.select_dtypes(include="object").columns.tolist()
    le_dict: dict[str, LabelEncoder] = {}
    for col in nominal_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        le_dict[col] = le
    encoders["label_encoders"] = le_dict

    return df, encoders


def split_and_scale(
    df: pd.DataFrame,
    target: str = "Attrition",
    test_size: float = 0.20,
    random_state: int = 42,
) -> tuple:
    X = df.drop(columns=[target])
    y = df[target]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, stratify=y, random_state=random_state
    )

    scaler = StandardScaler()
    X_train_sc = pd.DataFrame(
        scaler.fit_transform(X_train), columns=X_train.columns, index=X_train.index
    )
    X_test_sc = pd.DataFrame(
        scaler.transform(X_test), columns=X_test.columns, index=X_test.index
    )

    return X_train, X_test, y_train, y_test, X_train_sc, X_test_sc, scaler


if __name__ == "__main__":
    raw = load_data()
    cleaned = clean(raw)
    encoded, enc = encode(cleaned)
    X_tr, X_te, y_tr, y_te, X_tr_sc, X_te_sc, sc = split_and_scale(encoded)
    print(f"Train: {X_tr.shape}  |  Test: {X_te.shape}")
    print(f"Class balance (train): {y_tr.value_counts(normalize=True).to_dict()}")
