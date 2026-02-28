import math

def calculate_with_fixed_repayment(purchase_price, total_equity, interest_rate, repayment_rate, maintenance_fee, private_reserve):
    # 1. Acquisition costs (Munich/Bavaria)
    acquisition_cost_rate = 0.035 + 0.015 + 0.0357  # 8.57%
    acquisition_cost_amount = purchase_price * acquisition_cost_rate

    # 2. Available equity after costs
    net_equity = total_equity - acquisition_cost_amount

    # Loan amount
    loan_amount = purchase_price - net_equity

    if net_equity < 0:
        return None, "Error: Equity does not even cover the acquisition costs!"

    # 3. Calculate monthly bank rate (Classic annuity)
    # Formula: (loan_amount * (interest% + repayment%)) / 12
    annuity_rate = interest_rate + repayment_rate
    annual_bank_rate = loan_amount * (annuity_rate / 100)
    monthly_bank_rate = annual_bank_rate / 12
    monthly_interest = loan_amount * (interest_rate / 100) / 12
    monthly_repayment = loan_amount * (repayment_rate / 100) / 12

    # 4. Calculate term (When is the loan paid off at this rate?)
    # Formula: n = -ln(1 - (i * K) / R) / ln(1 + i)
    monthly_interest_factor = (interest_rate / 100) / 12

    try:
        # Argument for logarithm
        log_arg = 1 - (monthly_interest_factor * loan_amount) / monthly_bank_rate
        num_months = -math.log(log_arg) / math.log(1 + monthly_interest_factor)
        term_years = num_months / 12
    except ValueError:
        term_years = 999  # If interest > rate (repayment too small), loan is never paid off

    # 5. Total costs
    total_monthly_cost = monthly_bank_rate + maintenance_fee + private_reserve

    return {
        "loan_amount": loan_amount,
        "monthly_interest": monthly_interest,
        "monthly_repayment": monthly_repayment,
        "bank_rate": monthly_bank_rate,
        "term_years": term_years,
        "total_monthly_cost": total_monthly_cost,
        "remaining_debt_after_10_years": calculate_remaining_debt(loan_amount, interest_rate, repayment_rate, 10)
    }

def calculate_remaining_debt(k, interest, repayment, years):
    # Helper function for remaining debt after X years
    annuity = k * (interest + repayment) / 100
    q = 1 + (interest / 100)
    # Formula: remaining_debt = K * q^n - R * (q^n - 1) / (q - 1)
    remaining = k * (q**years) - annuity * ((q**years) - 1) / (q - 1)
    return max(0, remaining)

# --- Input values ---
price = 800000
capital = 300000
interest = 3.8
repayment_rate = 2.0   # FIXED: 2% repayment
maintenance_fee = 500
reserve = 150

# --- Run ---
result = calculate_with_fixed_repayment(price, capital, interest, repayment_rate, maintenance_fee, reserve)

# --- Output ---
if result:
    print(f"--- SCENARIO A (Fixed Repayment {repayment_rate}%) ---")
    print(f"Loan amount:                {result['loan_amount']:,.2f} €")
    print(f"----------------------------------------")
    print(f"Monthly interest:           {result['monthly_interest']:,.2f} € / month")
    print(f"Monthly repayment:          {result['monthly_repayment']:,.2f} € / month")
    print(f"Bank rate (interest+repay): {result['bank_rate']:,.2f} € / month")
    print(f"+ Maintenance fee:          {maintenance_fee:,.2f} €")
    print(f"+ Private reserve:          {reserve:,.2f} €")
    print(f"========================================")
    print(f"TOTAL MONTHLY COST:         {result['total_monthly_cost']:,.2f} €")
    print(f"----------------------------------------")
    print(f"Estimated term:             {result['term_years']:.1f} years")
    print(f"Remaining debt after 10 years: {result['remaining_debt_after_10_years']:,.2f} €")
else:
    print(result[1])
