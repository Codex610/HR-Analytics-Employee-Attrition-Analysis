"""
Generate synthetic IBM HR Analytics-style dataset (1,470 employees).
Mirrors the real IBM dataset schema and statistical distributions.
"""
import numpy as np
import pandas as pd

np.random.seed(42)
N = 1470


def generate_hr_dataset() -> pd.DataFrame:
    age = np.random.randint(18, 61, N)
    tenure = np.clip(np.random.exponential(scale=7, size=N).astype(int), 0, 40)
    overtime = np.random.choice(["Yes", "No"], N, p=[0.28, 0.72])
    job_satisfaction = np.random.choice([1, 2, 3, 4], N, p=[0.20, 0.19, 0.30, 0.31])
    env_satisfaction = np.random.choice([1, 2, 3, 4], N, p=[0.16, 0.27, 0.29, 0.28])
    work_life_balance = np.random.choice([1, 2, 3, 4], N, p=[0.05, 0.23, 0.61, 0.11])
    monthly_income = np.clip(
        np.random.lognormal(mean=8.5, sigma=0.6, size=N).astype(int), 1009, 19999
    )
    job_level = np.random.choice([1, 2, 3, 4, 5], N, p=[0.26, 0.33, 0.22, 0.12, 0.07])
    departments = np.random.choice(
        ["Sales", "Research & Development", "Human Resources"],
        N,
        p=[0.30, 0.63, 0.07],
    )
    job_roles = {
        "Sales": ["Sales Executive", "Sales Representative"],
        "Research & Development": [
            "Research Scientist", "Laboratory Technician",
            "Manufacturing Director", "Healthcare Representative",
        ],
        "Human Resources": ["Human Resources"],
    }
    job_role = [
        np.random.choice(job_roles[d]) for d in departments
    ]
    education = np.random.choice([1, 2, 3, 4, 5], N, p=[0.11, 0.19, 0.39, 0.27, 0.04])
    education_field = np.random.choice(
        ["Life Sciences", "Medical", "Marketing", "Technical Degree", "Other", "Human Resources"],
        N, p=[0.40, 0.27, 0.11, 0.09, 0.07, 0.06],
    )
    marital_status = np.random.choice(
        ["Single", "Married", "Divorced"], N, p=[0.32, 0.46, 0.22]
    )
    gender = np.random.choice(["Male", "Female"], N, p=[0.60, 0.40])
    distance_from_home = np.random.randint(1, 30, N)
    num_companies_worked = np.clip(np.random.poisson(2.5, N), 0, 9)
    training_times = np.random.choice([0, 1, 2, 3, 4, 5, 6], N,
                                      p=[0.06, 0.09, 0.32, 0.25, 0.15, 0.09, 0.04])
    percent_salary_hike = np.random.randint(11, 26, N)
    performance_rating = np.random.choice([3, 4], N, p=[0.84, 0.16])
    relationship_satisfaction = np.random.choice([1, 2, 3, 4], N, p=[0.15, 0.22, 0.32, 0.31])
    stock_option = np.random.choice([0, 1, 2, 3], N, p=[0.47, 0.36, 0.12, 0.05])
    years_at_company = tenure
    years_in_role = np.clip(
        tenure - np.random.randint(0, np.maximum(tenure, 1)).astype(int), 0, tenure
    )
    years_since_promotion = np.clip(
        np.random.exponential(2, N).astype(int), 0, years_in_role
    )
    years_with_manager = np.clip(
        np.random.exponential(4, N).astype(int), 0, years_at_company
    )
    business_travel = np.random.choice(
        ["Non-Travel", "Travel_Rarely", "Travel_Frequently"], N, p=[0.10, 0.71, 0.19]
    )

    # --- Attrition probability (logistic-style) ---
    log_odds = (
        -2.0
        + 1.2 * (overtime == "Yes").astype(float)
        - 0.5 * (job_satisfaction - 2.5)
        - 0.08 * tenure
        + 0.3 * (marital_status == "Single").astype(float)
        + 0.4 * (business_travel == "Travel_Frequently").astype(float)
        + 0.2 * (distance_from_home > 15).astype(float)
        - 0.3 * (stock_option > 0).astype(float)
        + 0.2 * (num_companies_worked > 3).astype(float)
        - 0.4 * (job_level > 2).astype(float)
        + 0.1 * np.random.randn(N)
    )
    prob_attrition = 1 / (1 + np.exp(-log_odds))
    attrition = (np.random.rand(N) < prob_attrition).astype(int)
    attrition_label = np.where(attrition == 1, "Yes", "No")

    df = pd.DataFrame({
        "Age": age,
        "Attrition": attrition_label,
        "BusinessTravel": business_travel,
        "Department": departments,
        "DistanceFromHome": distance_from_home,
        "Education": education,
        "EducationField": education_field,
        "EmployeeCount": 1,
        "EmployeeNumber": np.arange(1, N + 1),
        "EnvironmentSatisfaction": env_satisfaction,
        "Gender": gender,
        "HourlyRate": np.random.randint(30, 100, N),
        "JobInvolvement": np.random.choice([1, 2, 3, 4], N, p=[0.08, 0.22, 0.59, 0.11]),
        "JobLevel": job_level,
        "JobRole": job_role,
        "JobSatisfaction": job_satisfaction,
        "MaritalStatus": marital_status,
        "MonthlyIncome": monthly_income,
        "MonthlyRate": np.random.randint(2094, 26999, N),
        "NumCompaniesWorked": num_companies_worked,
        "Over18": "Y",
        "OverTime": overtime,
        "PercentSalaryHike": percent_salary_hike,
        "PerformanceRating": performance_rating,
        "RelationshipSatisfaction": relationship_satisfaction,
        "StandardHours": 80,
        "StockOptionLevel": stock_option,
        "TotalWorkingYears": np.clip(tenure + np.random.randint(0, 5, N), 0, 40),
        "TrainingTimesLastYear": training_times,
        "WorkLifeBalance": work_life_balance,
        "YearsAtCompany": years_at_company,
        "YearsInCurrentRole": years_in_role,
        "YearsSinceLastPromotion": years_since_promotion,
        "YearsWithCurrManager": years_with_manager,
    })
    return df


if __name__ == "__main__":
    df = generate_hr_dataset()
    df.to_csv("data/WA_Fn-UseC_-HR-Employee-Attrition.csv", index=False)
    print(f"Dataset saved: {df.shape[0]} rows × {df.shape[1]} cols")
    print(f"Attrition rate: {df['Attrition'].value_counts(normalize=True)['Yes']:.1%}")
