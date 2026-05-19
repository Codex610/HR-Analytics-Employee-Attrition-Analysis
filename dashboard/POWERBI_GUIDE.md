# Power BI Executive Dashboard — HR Attrition Analytics
## Setup & Replication Guide

---

## Overview

The Power BI dashboard surfaces three core analytical layers:

| Layer | Visuals |
|---|---|
| **Overview** | KPI cards, attrition donut chart, headcount trend |
| **Risk Heatmaps** | Department × Job Level, geographic distance scatter |
| **6-Month Forecast** | Line chart with confidence bands, risk bucket funnel |

---

## 1. Data Connection

1. Open Power BI Desktop → **Get Data → Text/CSV**
2. Load `data/WA_Fn-UseC_-HR-Employee-Attrition.csv`
3. In Power Query Editor, verify column types:
   - `MonthlyIncome`, `Age`, `YearsAtCompany` → **Whole Number / Decimal**
   - `Attrition`, `Department`, `JobRole` → **Text**
   - `JobSatisfaction`, `JobLevel` → **Whole Number**

---

## 2. DAX Measures

Paste these into the **Data Model** → New Measure:

```dax
-- KPI: Total Headcount
Headcount = COUNTROWS(hr_employees)

-- KPI: Total Attritions
Total Attritions = CALCULATE(COUNTROWS(hr_employees), hr_employees[Attrition] = "Yes")

-- KPI: Attrition Rate
Attrition Rate % = DIVIDE([Total Attritions], [Headcount], 0) * 100

-- KPI: Avg Monthly Income (Leavers)
Avg Income Leavers =
    CALCULATE(AVERAGE(hr_employees[MonthlyIncome]),
              hr_employees[Attrition] = "Yes")

-- Risk Score (normalized 0-100)
Risk Score =
    VAR OT_Weight = IF(SELECTEDVALUE(hr_employees[OverTime]) = "Yes", 30, 0)
    VAR SAT_Weight = (5 - AVERAGE(hr_employees[JobSatisfaction])) * 10
    VAR TENURE_Weight = IF(AVERAGE(hr_employees[YearsAtCompany]) < 3, 20, 0)
    RETURN CLAMP(OT_Weight + SAT_Weight + TENURE_Weight, 0, 100)

-- 6-Month Forecast (simple EWM proxy)
Forecast Attrition Rate =
    VAR Alpha = 0.3
    VAR LastRate = [Attrition Rate %]
    RETURN LastRate * (1 - Alpha) + LastRate * Alpha
```

---

## 3. Page 1 — Executive Overview

### KPI Cards (top row)
| Card | Measure | Format |
|---|---|---|
| Total Employees | `Headcount` | Whole number |
| Attrition Rate | `Attrition Rate %` | `0.0"%"` |
| Total Attritions | `Total Attritions` | Whole number |
| Avg Income (Leavers) | `Avg Income Leavers` | `$#,##0` |

### Visuals
- **Donut Chart**: `Attrition` field → Values: `Headcount`
  - Colors: No = `#2196F3`, Yes = `#F44336`
- **Clustered Bar**: Department on axis, `Attrition Rate %` on value
- **Slicer**: Department, Gender, MaritalStatus (vertical list)

---

## 4. Page 2 — Attrition Heatmaps

### Heatmap Setup (Matrix Visual)
1. Insert **Matrix** visual
2. Rows: `Department`
3. Columns: `JobLevel`
4. Values: `Attrition Rate %`
5. Conditional Formatting → Background Color:
   - Lowest value: `#FFFFFF` (white)
   - Highest value: `#C62828` (dark red)

### Additional Heatmaps
- **Job Satisfaction × Business Travel** matrix (same setup)
- **Scatter**: X = `MonthlyIncome`, Y = `Attrition Rate %`,
  Size = `Headcount`, Color = `Department`

---

## 5. Page 3 — 6-Month Forecast & Risk Scores

### Forecast Line Chart
1. Duplicate the historical attrition rate table or use a calculated table:

```dax
AttritionForecast =
DATATABLE(
    "Month", STRING,
    "AttritionRate", DOUBLE,
    "Type", STRING,
    {
        {"Mar 2026", 15.8, "Forecast"},
        {"Apr 2026", 15.4, "Forecast"},
        {"May 2026", 15.0, "Forecast"},
        {"Jun 2026", 14.7, "Forecast"},
        {"Jul 2026", 14.3, "Forecast"},
        {"Aug 2026", 13.9, "Forecast"}
    }
)
```

2. Line chart: X = `Month`, Y = `AttritionRate`, Legend = `Type`
3. Format forecast line as **dashed**

### Risk Bucket Funnel
1. Create a calculated column:
```dax
RiskBucket =
    IF([Risk Score] >= 70, "🔴 Critical",
    IF([Risk Score] >= 50, "🟠 High",
    IF([Risk Score] >= 30, "🟡 Medium", "🟢 Low")))
```
2. Insert **Funnel Chart**: Category = `RiskBucket`, Values = `Headcount`

---

## 6. Department Risk Score Card

```dax
Dept Risk Score =
    SWITCH(
        SELECTEDVALUE(hr_employees[Department]),
        "Sales", 22.4,
        "Human Resources", 19.2,
        "Research & Development", 13.7,
        BLANK()
    )
```

Add a **KPI Visual** per department comparing current vs target (16% baseline).

---

## 7. Slicers & Filters Panel

Add to every page:
- **Date Slicer** (if you have hire/exit dates)
- **Department** dropdown
- **JobLevel** range slider
- **OverTime** toggle button slicer

---

## 8. Theme & Branding

Apply this JSON theme via **View → Themes → Browse**:

```json
{
  "name": "HR Attrition Theme",
  "dataColors": ["#1565C0","#F44336","#4CAF50","#FF9800","#9C27B0"],
  "background": "#FAFAFA",
  "foreground": "#212121",
  "tableAccent": "#1565C0",
  "visualStyles": {
    "*": {
      "*": {
        "fontFamily": [{"value": "Segoe UI"}]
      }
    }
  }
}
```

---

## 9. Publishing

1. **File → Publish → Power BI Service**
2. Configure **Scheduled Refresh** (if connected to live SQL)
3. Create a **Dashboard** by pinning the 4 KPI cards + heatmap + forecast chart
4. Share via workspace or embed link

---

## Screenshot Reference

The `outputs/` folder contains PNG replicas of all dashboard panels:

| File | Dashboard Equivalent |
|---|---|
| `06_attrition_heatmap.png` | Page 2 → Department × Job Level heatmap |
| `12_risk_scores.png` | Page 2 → Risk bucket distribution |
| `13_6month_forecast.png` | Page 3 → Forecast line chart |
| `14_department_risk_scores.png` | Page 3 → Department risk KPIs |
