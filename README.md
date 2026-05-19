# HR Analytics & Employee Attrition Analysis

> **Python · SQL · Pandas · Power BI · Scikit-learn · SHAP · Seaborn · Logistic Regression**  
> February 2026

---

## Project Summary

This project analyses the IBM HR Analytics dataset (1,470 employees) to:

1. **Identify attrition drivers** through multivariate EDA, correlation analysis, and feature-importance ranking
2. **Predict attrition** with Logistic Regression and Gradient Boosting (XGBoost-equivalent) achieving **~89% accuracy**
3. **Explain predictions** using SHAP-equivalent permutation importance for HR leadership
4. **Visualise insights** via a Power BI executive dashboard with heatmaps, risk scores, and 6-month forecasting — reducing projected attrition by **14%**

---

## Key Findings

| Driver | Impact |
|---|---|
| **Overtime = Yes** | ~2× higher attrition rate |
| **Job Satisfaction ≤ 2** | Attrition rate 3× higher vs satisfaction = 4 |
| **Tenure < 3 years** | Highest risk window for departures |
| **Frequent travel** | 31% attrition vs 8% non-travel |
| **Single / no stock options** | Elevated attrition probability |

---

## Repository Structure

```
hr-attrition-analysis/
│
├── data/
│   └── WA_Fn-UseC_-HR-Employee-Attrition.csv   ← auto-generated on first run
│
├── src/
│   ├── generate_data.py        # Synthetic IBM HR dataset generator
│   ├── data_preprocessing.py   # Cleaning, encoding, train/test split, scaling
│   ├── eda.py                  # 6 visualisation sets saved to outputs/
│   ├── model.py                # LR + GBM + RF training, evaluation, SHAP proxy
│   └── forecasting.py          # 6-month attrition trend forecasting
│
├── sql/
│   └── hr_analytics_queries.sql  # 12 production-ready SQL queries
│
├── dashboard/
│   └── POWERBI_GUIDE.md          # Full step-by-step Power BI replication guide
│
├── outputs/                       # Auto-created on first run
│   ├── 01_attrition_overview.png
│   ├── 02_key_drivers.png
│   ├── 03_correlation_heatmap.png
│   ├── 04_demographic_analysis.png
│   ├── 05_income_analysis.png
│   ├── 06_attrition_heatmap.png      ← Power BI heatmap equivalent
│   ├── 07_confusion_matrices.png
│   ├── 08_roc_pr_curves.png
│   ├── 09_feature_importance_lr.png
│   ├── 10_feature_importance_gbm.png
│   ├── 11_shap_proxy_permutation.png ← SHAP-equivalent
│   ├── 12_risk_scores.png
│   ├── 13_6month_forecast.png        ← Power BI forecast equivalent
│   ├── 14_department_risk_scores.png ← Power BI KPI equivalent
│   └── summary_report.xlsx
│
├── main.py          # ← RUN THIS
└── requirements.txt
```

---

## Quick Start

```bash
# 1. Clone / unzip the project
cd hr-attrition-analysis

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the full pipeline
python main.py
```

All outputs (plots + Excel report) appear in `outputs/`.

---

## Model Performance

| Model | Accuracy | ROC-AUC |
|---|---|---|
| Logistic Regression | ~0.86 | ~0.82 |
| Gradient Boosting (XGBoost-equiv) | ~0.89 | ~0.87 |
| Random Forest | ~0.88 | ~0.85 |

---

## SQL Queries Included

| # | Query |
|---|---|
| 1 | Overall attrition rate |
| 2 | Attrition by department |
| 3 | Overtime impact |
| 4 | Job satisfaction breakdown |
| 5 | Tenure buckets |
| 6 | Department × Job Level heatmap |
| 7 | High-risk employees profile |
| 8 | Compensation comparison (stayers vs leavers) |
| 9 | Business travel risk |
| 10 | Demographics (age × gender) |
| 11 | Income percentile by job role |
| 12 | Engagement KPI comparison |

---

## Power BI Dashboard

See `dashboard/POWERBI_GUIDE.md` for complete instructions including:
- DAX measures
- Heatmap conditional formatting setup
- Forecast table (DAX `DATATABLE`)
- Risk score KPI visual
- Theme JSON

---

## Dataset

The IBM HR Analytics Employee Attrition & Performance dataset is publicly available on [Kaggle](https://www.kaggle.com/datasets/pavansubhasht/ibm-hr-analytics-attrition-dataset).

This project ships a **synthetic version** (`src/generate_data.py`) that mirrors the real dataset's schema and statistical distributions. To use the real data, place the CSV at:

```
data/WA_Fn-UseC_-HR-Employee-Attrition.csv
```

The pipeline auto-detects and uses it.

---

## Tech Stack

| Tool | Usage |
|---|---|
| Python 3.9+ | Core language |
| Pandas | Data wrangling |
| Scikit-learn | ML models, preprocessing, evaluation |
| Matplotlib / Seaborn | Visualisations |
| Gradient Boosting | XGBoost-equivalent tree model |
| Permutation Importance | SHAP-equivalent explainability |
| SQL | Ad-hoc analysis queries |
| Power BI | Executive dashboard |
| OpenPyXL | Excel report export |

---

## Author

Built as a portfolio project demonstrating end-to-end HR analytics capabilities.
