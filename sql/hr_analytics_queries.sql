-- ============================================================
-- HR Analytics & Employee Attrition — SQL Query Library
-- Database: hr_analytics  |  Table: hr_employees
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 0. Schema Reference
-- ─────────────────────────────────────────────────────────────
/*
CREATE TABLE hr_employees (
    EmployeeNumber      INT PRIMARY KEY,
    Age                 INT,
    Attrition           VARCHAR(3),          -- 'Yes' / 'No'
    BusinessTravel      VARCHAR(30),
    Department          VARCHAR(50),
    DistanceFromHome    INT,
    Education           INT,                 -- 1=Below College … 5=Doctor
    EducationField      VARCHAR(30),
    EnvironmentSatisfaction INT,             -- 1=Low … 4=Very High
    Gender              VARCHAR(10),
    HourlyRate          INT,
    JobInvolvement      INT,
    JobLevel            INT,
    JobRole             VARCHAR(40),
    JobSatisfaction     INT,
    MaritalStatus       VARCHAR(20),
    MonthlyIncome       DECIMAL(10,2),
    MonthlyRate         DECIMAL(10,2),
    NumCompaniesWorked  INT,
    OverTime            VARCHAR(3),
    PercentSalaryHike   INT,
    PerformanceRating   INT,
    RelationshipSatisfaction INT,
    StockOptionLevel    INT,
    TotalWorkingYears   INT,
    TrainingTimesLastYear INT,
    WorkLifeBalance     INT,
    YearsAtCompany      INT,
    YearsInCurrentRole  INT,
    YearsSinceLastPromotion INT,
    YearsWithCurrManager    INT
);
*/

-- ─────────────────────────────────────────────────────────────
-- 1. Overall Attrition Rate
-- ─────────────────────────────────────────────────────────────
SELECT
    COUNT(*)                                            AS TotalEmployees,
    SUM(CASE WHEN Attrition = 'Yes' THEN 1 ELSE 0 END) AS TotalAttritions,
    ROUND(
        100.0 * SUM(CASE WHEN Attrition = 'Yes' THEN 1 ELSE 0 END) / COUNT(*), 2
    )                                                   AS AttritionRate_Pct
FROM hr_employees;


-- ─────────────────────────────────────────────────────────────
-- 2. Attrition Rate by Department
-- ─────────────────────────────────────────────────────────────
SELECT
    Department,
    COUNT(*)                                            AS Headcount,
    SUM(CASE WHEN Attrition = 'Yes' THEN 1 ELSE 0 END) AS Attritions,
    ROUND(
        100.0 * SUM(CASE WHEN Attrition = 'Yes' THEN 1 ELSE 0 END) / COUNT(*), 2
    )                                                   AS AttritionRate_Pct
FROM hr_employees
GROUP BY Department
ORDER BY AttritionRate_Pct DESC;


-- ─────────────────────────────────────────────────────────────
-- 3. Overtime Impact on Attrition
-- ─────────────────────────────────────────────────────────────
SELECT
    OverTime,
    COUNT(*)                                            AS Headcount,
    SUM(CASE WHEN Attrition = 'Yes' THEN 1 ELSE 0 END) AS Attritions,
    ROUND(
        100.0 * SUM(CASE WHEN Attrition = 'Yes' THEN 1 ELSE 0 END) / COUNT(*), 2
    )                                                   AS AttritionRate_Pct
FROM hr_employees
GROUP BY OverTime;


-- ─────────────────────────────────────────────────────────────
-- 4. Job Satisfaction Breakdown
-- ─────────────────────────────────────────────────────────────
SELECT
    JobSatisfaction,
    CASE JobSatisfaction
        WHEN 1 THEN 'Low'
        WHEN 2 THEN 'Medium'
        WHEN 3 THEN 'High'
        WHEN 4 THEN 'Very High'
    END                                                 AS SatisfactionLabel,
    COUNT(*)                                            AS Headcount,
    SUM(CASE WHEN Attrition = 'Yes' THEN 1 ELSE 0 END) AS Attritions,
    ROUND(
        100.0 * SUM(CASE WHEN Attrition = 'Yes' THEN 1 ELSE 0 END) / COUNT(*), 2
    )                                                   AS AttritionRate_Pct
FROM hr_employees
GROUP BY JobSatisfaction
ORDER BY JobSatisfaction;


-- ─────────────────────────────────────────────────────────────
-- 5. Tenure Buckets vs Attrition
-- ─────────────────────────────────────────────────────────────
SELECT
    CASE
        WHEN YearsAtCompany BETWEEN 0 AND 2   THEN '0-2 years'
        WHEN YearsAtCompany BETWEEN 3 AND 5   THEN '3-5 years'
        WHEN YearsAtCompany BETWEEN 6 AND 10  THEN '6-10 years'
        WHEN YearsAtCompany BETWEEN 11 AND 20 THEN '11-20 years'
        ELSE '20+ years'
    END                                                 AS TenureBucket,
    COUNT(*)                                            AS Headcount,
    SUM(CASE WHEN Attrition = 'Yes' THEN 1 ELSE 0 END) AS Attritions,
    ROUND(
        100.0 * SUM(CASE WHEN Attrition = 'Yes' THEN 1 ELSE 0 END) / COUNT(*), 2
    )                                                   AS AttritionRate_Pct
FROM hr_employees
GROUP BY TenureBucket
ORDER BY MIN(YearsAtCompany);


-- ─────────────────────────────────────────────────────────────
-- 6. Attrition Heatmap — Department × Job Level
-- ─────────────────────────────────────────────────────────────
SELECT
    Department,
    JobLevel,
    COUNT(*)                                            AS Headcount,
    SUM(CASE WHEN Attrition = 'Yes' THEN 1 ELSE 0 END) AS Attritions,
    ROUND(
        100.0 * SUM(CASE WHEN Attrition = 'Yes' THEN 1 ELSE 0 END) / COUNT(*), 2
    )                                                   AS AttritionRate_Pct
FROM hr_employees
GROUP BY Department, JobLevel
ORDER BY Department, JobLevel;


-- ─────────────────────────────────────────────────────────────
-- 7. High-Risk Employees Profile (for HR intervention)
-- ─────────────────────────────────────────────────────────────
SELECT
    EmployeeNumber,
    Age,
    Department,
    JobRole,
    JobSatisfaction,
    OverTime,
    YearsAtCompany,
    MonthlyIncome,
    NumCompaniesWorked,
    MaritalStatus
FROM hr_employees
WHERE
    Attrition = 'No'                   -- still active employees
    AND OverTime = 'Yes'
    AND JobSatisfaction <= 2
    AND YearsAtCompany <= 3
ORDER BY JobSatisfaction ASC, YearsAtCompany ASC;


-- ─────────────────────────────────────────────────────────────
-- 8. Average Compensation by Attrition Status
-- ─────────────────────────────────────────────────────────────
SELECT
    Attrition,
    ROUND(AVG(MonthlyIncome), 2)        AS AvgMonthlyIncome,
    ROUND(AVG(PercentSalaryHike), 2)    AS AvgSalaryHike_Pct,
    ROUND(AVG(StockOptionLevel), 2)     AS AvgStockOption,
    ROUND(AVG(YearsAtCompany), 2)       AS AvgTenure,
    COUNT(*)                            AS Headcount
FROM hr_employees
GROUP BY Attrition;


-- ─────────────────────────────────────────────────────────────
-- 9. Business Travel Risk Analysis
-- ─────────────────────────────────────────────────────────────
SELECT
    BusinessTravel,
    COUNT(*)                                            AS Headcount,
    SUM(CASE WHEN Attrition = 'Yes' THEN 1 ELSE 0 END) AS Attritions,
    ROUND(
        100.0 * SUM(CASE WHEN Attrition = 'Yes' THEN 1 ELSE 0 END) / COUNT(*), 2
    )                                                   AS AttritionRate_Pct,
    ROUND(AVG(JobSatisfaction), 2)                      AS AvgJobSatisfaction,
    ROUND(AVG(WorkLifeBalance), 2)                      AS AvgWorkLifeBalance
FROM hr_employees
GROUP BY BusinessTravel
ORDER BY AttritionRate_Pct DESC;


-- ─────────────────────────────────────────────────────────────
-- 10. Attrition by Age Group & Gender (diversity lens)
-- ─────────────────────────────────────────────────────────────
SELECT
    Gender,
    CASE
        WHEN Age BETWEEN 18 AND 25 THEN '18-25'
        WHEN Age BETWEEN 26 AND 35 THEN '26-35'
        WHEN Age BETWEEN 36 AND 45 THEN '36-45'
        ELSE '46+'
    END                                                 AS AgeGroup,
    COUNT(*)                                            AS Headcount,
    SUM(CASE WHEN Attrition = 'Yes' THEN 1 ELSE 0 END) AS Attritions,
    ROUND(
        100.0 * SUM(CASE WHEN Attrition = 'Yes' THEN 1 ELSE 0 END) / COUNT(*), 2
    )                                                   AS AttritionRate_Pct
FROM hr_employees
GROUP BY Gender, AgeGroup
ORDER BY Gender, AgeGroup;


-- ─────────────────────────────────────────────────────────────
-- 11. Monthly Income Percentile by JobRole
-- ─────────────────────────────────────────────────────────────
SELECT
    JobRole,
    COUNT(*)                            AS Headcount,
    ROUND(MIN(MonthlyIncome), 2)        AS MinIncome,
    ROUND(AVG(MonthlyIncome), 2)        AS AvgIncome,
    ROUND(MAX(MonthlyIncome), 2)        AS MaxIncome,
    ROUND(
        100.0 * SUM(CASE WHEN Attrition = 'Yes' THEN 1 ELSE 0 END) / COUNT(*), 2
    )                                   AS AttritionRate_Pct
FROM hr_employees
GROUP BY JobRole
ORDER BY AttritionRate_Pct DESC;


-- ─────────────────────────────────────────────────────────────
-- 12. Stayers vs Leavers — Engagement KPI Comparison
-- ─────────────────────────────────────────────────────────────
SELECT
    Attrition,
    ROUND(AVG(JobSatisfaction), 2)          AS AvgJobSatisfaction,
    ROUND(AVG(EnvironmentSatisfaction), 2)  AS AvgEnvSatisfaction,
    ROUND(AVG(WorkLifeBalance), 2)          AS AvgWorkLifeBalance,
    ROUND(AVG(JobInvolvement), 2)           AS AvgJobInvolvement,
    ROUND(AVG(RelationshipSatisfaction), 2) AS AvgRelationshipSatisfaction,
    ROUND(AVG(TrainingTimesLastYear), 2)    AS AvgTrainingTimes
FROM hr_employees
GROUP BY Attrition;
