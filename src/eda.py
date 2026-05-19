"""
eda.py
------
Multivariate EDA, correlation analysis, and feature-importance ranking.
All plots are saved to outputs/.
"""
from __future__ import annotations

import os
import warnings
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import seaborn as sns
from sklearn.preprocessing import LabelEncoder

warnings.filterwarnings("ignore")

OUTPUT_DIR = "outputs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

PALETTE = {"No": "#2196F3", "Yes": "#F44336"}
ACCENT = "#1565C0"


def _save(fig, name: str):
    path = os.path.join(OUTPUT_DIR, name)
    fig.savefig(path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    print(f"  ✓  Saved {path}")


# ---------------------------------------------------------------------------
# 1. Attrition overview
# ---------------------------------------------------------------------------
def plot_attrition_overview(df: pd.DataFrame):
    fig, axes = plt.subplots(1, 2, figsize=(12, 5))
    fig.suptitle("Employee Attrition Overview", fontsize=16, fontweight="bold", y=1.01)

    counts = df["Attrition"].value_counts()
    colors = [PALETTE["No"], PALETTE["Yes"]]
    axes[0].pie(
        counts, labels=counts.index, autopct="%1.1f%%",
        colors=colors, startangle=140,
        wedgeprops={"edgecolor": "white", "linewidth": 2},
    )
    axes[0].set_title("Attrition Split", fontsize=13)

    dept_att = (
        df.groupby("Department")["Attrition"]
        .apply(lambda x: (x == "Yes").sum() / len(x) * 100)
        .reset_index(name="AttritionRate")
        .sort_values("AttritionRate", ascending=True)
    )
    bars = axes[1].barh(dept_att["Department"], dept_att["AttritionRate"],
                        color=ACCENT, edgecolor="white")
    axes[1].bar_label(bars, fmt="%.1f%%", padding=4)
    axes[1].set_xlabel("Attrition Rate (%)")
    axes[1].set_title("Attrition Rate by Department", fontsize=13)
    axes[1].set_xlim(0, dept_att["AttritionRate"].max() * 1.3)
    fig.tight_layout()
    _save(fig, "01_attrition_overview.png")


# ---------------------------------------------------------------------------
# 2. Key drivers: overtime, satisfaction, tenure
# ---------------------------------------------------------------------------
def plot_key_drivers(df: pd.DataFrame):
    fig, axes = plt.subplots(1, 3, figsize=(16, 5))
    fig.suptitle("Key Attrition Drivers", fontsize=16, fontweight="bold")

    # Overtime
    ot = df.groupby(["OverTime", "Attrition"]).size().unstack(fill_value=0)
    ot_pct = ot.div(ot.sum(axis=1), axis=0) * 100
    ot_pct.plot(kind="bar", ax=axes[0], color=[PALETTE["No"], PALETTE["Yes"]],
                edgecolor="white", rot=0)
    axes[0].set_title("Overtime vs Attrition", fontsize=12)
    axes[0].set_ylabel("Employees (%)")
    axes[0].set_xlabel("Overtime")
    axes[0].legend(title="Attrition")

    # Job Satisfaction
    js = df.groupby(["JobSatisfaction", "Attrition"]).size().unstack(fill_value=0)
    js_pct = js.div(js.sum(axis=1), axis=0) * 100
    js_pct["Yes"].plot(kind="bar", ax=axes[1], color=PALETTE["Yes"], edgecolor="white", rot=0)
    axes[1].set_title("Job Satisfaction → Attrition %", fontsize=12)
    axes[1].set_ylabel("Attrition Rate (%)")
    axes[1].set_xlabel("Job Satisfaction (1=Low → 4=High)")

    # Tenure (YearsAtCompany)
    sns.boxplot(
        data=df, x="Attrition", y="YearsAtCompany", palette=PALETTE,
        ax=axes[2], order=["No", "Yes"],
    )
    axes[2].set_title("Tenure vs Attrition", fontsize=12)
    axes[2].set_ylabel("Years at Company")

    fig.tight_layout()
    _save(fig, "02_key_drivers.png")


# ---------------------------------------------------------------------------
# 3. Correlation heatmap (encoded)
# ---------------------------------------------------------------------------
def plot_correlation_heatmap(df: pd.DataFrame):
    enc_df = df.copy()
    for col in enc_df.select_dtypes(include="object").columns:
        enc_df[col] = LabelEncoder().fit_transform(enc_df[col])

    corr = enc_df.corr()
    target_corr = (
        corr["Attrition"].drop("Attrition").abs().sort_values(ascending=False).head(15)
    )

    fig, axes = plt.subplots(1, 2, figsize=(18, 7))
    fig.suptitle("Correlation Analysis", fontsize=16, fontweight="bold")

    # Full heatmap (top 15 features)
    top_feats = target_corr.index.tolist() + ["Attrition"]
    mask = np.triu(np.ones((len(top_feats), len(top_feats)), dtype=bool))
    sns.heatmap(
        enc_df[top_feats].corr(), ax=axes[0], mask=mask,
        cmap="coolwarm", annot=True, fmt=".2f", linewidths=0.5,
        annot_kws={"size": 7}, vmin=-1, vmax=1,
    )
    axes[0].set_title("Feature Correlation Matrix (Top 15 + Target)", fontsize=12)

    # Target correlation bar
    colors = [PALETTE["Yes"] if v > 0 else PALETTE["No"]
              for v in corr["Attrition"].drop("Attrition")[target_corr.index]]
    axes[1].barh(target_corr.index[::-1], target_corr.values[::-1],
                 color=ACCENT, edgecolor="white")
    axes[1].set_xlabel("|Correlation| with Attrition")
    axes[1].set_title("Top 15 Features Correlated with Attrition", fontsize=12)

    fig.tight_layout()
    _save(fig, "03_correlation_heatmap.png")


# ---------------------------------------------------------------------------
# 4. Demographic & role distributions
# ---------------------------------------------------------------------------
def plot_demographic_analysis(df: pd.DataFrame):
    fig = plt.figure(figsize=(18, 10))
    fig.suptitle("Demographic & Role Attrition Analysis", fontsize=16, fontweight="bold")
    gs = gridspec.GridSpec(2, 3, figure=fig, hspace=0.45, wspace=0.35)

    panels = [
        ("MaritalStatus", "Marital Status"),
        ("Gender", "Gender"),
        ("AgeGroup", "Age Group"),
        ("JobRole", "Job Role"),
        ("BusinessTravel", "Business Travel"),
        ("EducationField", "Education Field"),
    ]

    df2 = df.copy()
    df2["AgeGroup"] = pd.cut(
        df2["Age"], bins=[17, 25, 35, 45, 60], labels=["18-25", "26-35", "36-45", "46-60"]
    ).astype(str)

    for idx, (col, title) in enumerate(panels):
        ax = fig.add_subplot(gs[idx // 3, idx % 3])
        grp = (
            df2.groupby(col)["Attrition"]
            .apply(lambda x: (x == "Yes").sum() / len(x) * 100)
            .sort_values(ascending=True)
        )
        bars = ax.barh(grp.index, grp.values, color=ACCENT, edgecolor="white")
        ax.bar_label(bars, fmt="%.1f%%", padding=3, fontsize=8)
        ax.set_xlabel("Attrition Rate (%)")
        ax.set_title(title, fontsize=11, fontweight="bold")
        ax.set_xlim(0, grp.values.max() * 1.35)

    _save(fig, "04_demographic_analysis.png")


# ---------------------------------------------------------------------------
# 5. Income & salary hike distributions
# ---------------------------------------------------------------------------
def plot_income_analysis(df: pd.DataFrame):
    fig, axes = plt.subplots(1, 3, figsize=(16, 5))
    fig.suptitle("Income & Compensation vs Attrition", fontsize=16, fontweight="bold")

    sns.kdeplot(data=df, x="MonthlyIncome", hue="Attrition", palette=PALETTE,
                fill=True, alpha=0.4, ax=axes[0])
    axes[0].set_title("Monthly Income Distribution")

    sns.boxplot(data=df, x="JobLevel", y="MonthlyIncome", hue="Attrition",
                palette=PALETTE, ax=axes[1])
    axes[1].set_title("Income by Job Level")
    axes[1].legend(title="Attrition")

    jh = df.groupby(["PercentSalaryHike", "Attrition"]).size().unstack(fill_value=0)
    jh_pct = jh.div(jh.sum(axis=1), axis=0) * 100
    if "Yes" in jh_pct.columns:
        axes[2].plot(jh_pct.index, jh_pct["Yes"], color=PALETTE["Yes"], marker="o", linewidth=2)
    axes[2].set_xlabel("% Salary Hike")
    axes[2].set_ylabel("Attrition Rate (%)")
    axes[2].set_title("Salary Hike → Attrition Rate")

    fig.tight_layout()
    _save(fig, "05_income_analysis.png")


# ---------------------------------------------------------------------------
# 6. Attrition heatmap (department × job level)
# ---------------------------------------------------------------------------
def plot_attrition_heatmap(df: pd.DataFrame):
    pivot = df.pivot_table(
        index="Department", columns="JobLevel",
        values="Attrition", aggfunc=lambda x: (x == "Yes").mean() * 100
    )
    fig, ax = plt.subplots(figsize=(10, 5))
    sns.heatmap(
        pivot, annot=True, fmt=".1f", cmap="YlOrRd",
        linewidths=0.5, ax=ax, cbar_kws={"label": "Attrition Rate (%)"},
    )
    ax.set_title("Attrition Heatmap — Department × Job Level", fontsize=14, fontweight="bold")
    ax.set_xlabel("Job Level")
    ax.set_ylabel("Department")
    _save(fig, "06_attrition_heatmap.png")


def run_eda(df: pd.DataFrame):
    print("\n── EDA ──────────────────────────────────────")
    print(f"Shape: {df.shape}")
    print(f"Attrition rate: {(df['Attrition']=='Yes').mean():.1%}")
    plot_attrition_overview(df)
    plot_key_drivers(df)
    plot_correlation_heatmap(df)
    plot_demographic_analysis(df)
    plot_income_analysis(df)
    plot_attrition_heatmap(df)
    print("EDA complete.\n")


if __name__ == "__main__":
    import sys, os
    sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
    from src.generate_data import generate_hr_dataset
    df = generate_hr_dataset()
    run_eda(df)
