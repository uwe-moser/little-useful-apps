import { useState, useEffect } from 'react';
import { Calculator, AlertCircle, Home, PieChart, Wallet, Calendar } from 'lucide-react';

const RealEstateCalculator = () => {
  // --- STATE: Input values ---
  const [purchasePrice, setPurchasePrice] = useState(800000);
  const [equity, setEquity] = useState(300000);
  const [interestRate, setInterestRate] = useState(3.8);
  const [repaymentRate, setRepaymentRate] = useState(2.0);
  const [maintenanceFee, setMaintenanceFee] = useState(500);
  const [privateReserve, setPrivateReserve] = useState(150);

  // --- STATE: Results ---
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  // --- CONSTANTS ---
  const ACQUISITION_COST_RATE = 0.035 + 0.015 + 0.0357; // 8.57% (land transfer tax, notary, broker)

  // --- FORMATTING ---
  const formatEuro = (val) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR' }).format(val);
  };

  const formatYears = (val) => {
    if (val > 100) return "> 100 years";
    const years = Math.floor(val);
    const months = Math.round((val - years) * 12);
    return `${years} years, ${months} months`;
  };

  // --- CALCULATION LOGIC ---
  useEffect(() => {
    // 1. Acquisition costs
    const acquisitionCostAmount = purchasePrice * ACQUISITION_COST_RATE;

    // 2. Available equity
    const netEquity = equity - acquisitionCostAmount;

    if (netEquity < 0) {
      setError(`Equity is not sufficient to cover acquisition costs (${formatEuro(acquisitionCostAmount)}). Shortfall: ${formatEuro(Math.abs(netEquity))}.`);
      setResults(null);
      return;
    } else {
      setError("");
    }

    // Loan amount
    const loanAmount = purchasePrice - netEquity;

    // 3. Monthly bank rate
    const annuityRate = interestRate + repaymentRate;
    const annualBankRate = loanAmount * (annuityRate / 100);
    const monthlyBankRate = annualBankRate / 12;

    const monthlyInterest = (loanAmount * (interestRate / 100)) / 12;
    const monthlyRepayment = (loanAmount * (repaymentRate / 100)) / 12;

    // 4. Calculate term
    const monthlyInterestFactor = (interestRate / 100) / 12;
    let termYears = 0;

    try {
      const logArg = 1 - (monthlyInterestFactor * loanAmount) / monthlyBankRate;
      if (logArg <= 0) {
        termYears = 999; // Repayment too low
      } else {
        const numMonths = -Math.log(logArg) / Math.log(1 + monthlyInterestFactor);
        termYears = numMonths / 12;
      }
    } catch (e) {
      termYears = 999;
    }

    // 5. Remaining debt after 10 years
    const calculateRemainingDebt = (k, z, t, j) => {
        const annuity = k * (z + t) / 100;
        const q = 1 + (z / 100);
        // Formula: K * q^n - R * (q^n - 1) / (q - 1)
        const remaining = k * Math.pow(q, j) - annuity * (Math.pow(q, j) - 1) / (q - 1);
        return Math.max(0, remaining);
    };

    const remainingDebt10 = calculateRemainingDebt(loanAmount, interestRate, repaymentRate, 10);

    // 6. Total monthly cost
    const totalMonthlyCost = monthlyBankRate + maintenanceFee + privateReserve;

    setResults({
      acquisitionCosts: acquisitionCostAmount,
      netEquity,
      loanAmount,
      monthlyBankRate,
      monthlyInterest,
      monthlyRepayment,
      termYears,
      remainingDebt10,
      totalMonthlyCost,
      equityRatio: (netEquity / purchasePrice) * 100
    });

  }, [purchasePrice, equity, interestRate, repaymentRate, maintenanceFee, privateReserve]);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 bg-slate-50 min-h-screen font-sans text-slate-800">

      {/* Header */}
      <div className="mb-8 flex items-center space-x-3">
        <div className="p-3 bg-blue-600 rounded-lg shadow-lg">
          <Calculator className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Real Estate Financing Planner</h1>
          <p className="text-slate-500">Interactive calculation based on a fixed repayment rate (Munich/Bavaria standard)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT: Input area */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Home className="w-5 h-5 mr-2 text-blue-500" /> Property Details
            </h2>

            {/* Purchase Price */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-600 mb-1">Purchase Price</label>
              <div className="relative">
                <input
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  className="w-full p-3 pl-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                />
                <span className="absolute right-4 top-3 text-slate-400">€</span>
              </div>
              <input
                type="range" min="100000" max="2000000" step="10000"
                value={purchasePrice} onChange={(e) => setPurchasePrice(Number(e.target.value))}
                className="w-full mt-2 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Equity */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-600 mb-1">Available Equity</label>
              <div className="relative">
                <input
                  type="number"
                  value={equity}
                  onChange={(e) => setEquity(Number(e.target.value))}
                  className="w-full p-3 pl-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
                />
                <span className="absolute right-4 top-3 text-slate-400">€</span>
              </div>
              <input
                type="range" min="0" max={purchasePrice} step="5000"
                value={equity} onChange={(e) => setEquity(Number(e.target.value))}
                className="w-full mt-2 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Wallet className="w-5 h-5 mr-2 text-purple-500" /> Financing
            </h2>

            {/* Interest Rate */}
            <div className="mb-5">
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium text-slate-600">Interest Rate</label>
                <span className="text-sm font-bold text-purple-600">{interestRate.toFixed(2)} %</span>
              </div>
              <input
                type="range" min="0.5" max="8.0" step="0.05"
                value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            {/* Repayment Rate */}
            <div className="mb-5">
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium text-slate-600">Initial Repayment Rate</label>
                <span className="text-sm font-bold text-purple-600">{repaymentRate.toFixed(2)} %</span>
              </div>
              <input
                type="range" min="1.0" max="10.0" step="0.1"
                value={repaymentRate} onChange={(e) => setRepaymentRate(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Maintenance Fee */}
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Maintenance Fee (mo.)</label>
                    <input
                    type="number"
                    value={maintenanceFee}
                    onChange={(e) => setMaintenanceFee(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded bg-slate-50"
                    />
                </div>
                {/* Private Reserve */}
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Private Reserve (mo.)</label>
                    <input
                    type="number"
                    value={privateReserve}
                    onChange={(e) => setPrivateReserve(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded bg-slate-50"
                    />
                </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Results */}
        <div className="lg:col-span-7 space-y-6">

          {error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg flex items-start">
              <AlertCircle className="w-6 h-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-800 font-bold">Calculation not possible</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          ) : results && (
            <>
              {/* Main card: Monthly rate */}
              <div className="bg-white rounded-2xl shadow-lg border-t-4 border-blue-600 overflow-hidden">
                <div className="p-8 text-center bg-gradient-to-b from-white to-blue-50">
                  <p className="text-slate-500 font-medium uppercase tracking-wider text-sm mb-2">Total Monthly Cost</p>
                  <div className="text-5xl font-extrabold text-slate-800 mb-2">
                    {formatEuro(results.totalMonthlyCost)}
                  </div>
                  <p className="text-slate-400 text-sm">Bank rate + Maintenance fee + Reserve</p>
                </div>

                <div className="grid grid-cols-3 divide-x divide-slate-100 bg-white border-t border-slate-100">
                   <div className="p-4 text-center">
                        <p className="text-xs text-slate-500 mb-1">To bank only</p>
                        <p className="font-bold text-slate-700">{formatEuro(results.monthlyBankRate)}</p>
                   </div>
                   <div className="p-4 text-center">
                        <p className="text-xs text-slate-500 mb-1">Interest (initial)</p>
                        <p className="font-bold text-red-500">{formatEuro(results.monthlyInterest)}</p>
                   </div>
                   <div className="p-4 text-center">
                        <p className="text-xs text-slate-500 mb-1">Repayment (initial)</p>
                        <p className="font-bold text-green-600">{formatEuro(results.monthlyRepayment)}</p>
                   </div>
                </div>
              </div>

              {/* Financing structure */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Loan details */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                    <PieChart className="w-5 h-5 mr-2 text-slate-500" /> Structure
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between pb-2 border-b border-slate-100">
                      <span className="text-slate-500">Purchase Price</span>
                      <span className="font-medium">{formatEuro(purchasePrice)}</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-slate-100">
                      <span className="text-slate-500">Acquisition Costs (ca. 8.6%)</span>
                      <span className="font-medium text-red-500">+ {formatEuro(results.acquisitionCosts)}</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-slate-100">
                        <span className="text-slate-500 font-bold">Total Cost</span>
                        <span className="font-bold">{formatEuro(purchasePrice + results.acquisitionCosts)}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-slate-500">Equity</span>
                      <span className="font-medium text-green-600">- {formatEuro(equity)}</span>
                    </div>
                    <div className="flex justify-between pt-1 bg-blue-50 p-2 rounded">
                      <span className="text-blue-800 font-bold">To finance</span>
                      <span className="text-blue-800 font-bold">{formatEuro(results.loanAmount)}</span>
                    </div>
                  </div>

                  {/* Bar visualization */}
                  <div className="mt-6">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>LTV (Loan-to-Value)</span>
                        <span>{100 - results.equityRatio > 0 ? (100 - results.equityRatio).toFixed(1) : 0}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden flex">
                        <div
                            className="bg-green-500 h-full transition-all duration-500"
                            style={{width: `${Math.max(0, results.equityRatio)}%`}}
                        ></div>
                        <div
                            className="bg-blue-500 h-full transition-all duration-500"
                            style={{width: `${Math.min(100, 100 - results.equityRatio)}%`}}
                        ></div>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                        <span className="text-green-600 font-medium">Equity (net)</span>
                        <span className="text-blue-600 font-medium">Bank loan</span>
                    </div>
                  </div>
                </div>

                {/* Term & remaining debt */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-slate-500" /> Forecast
                  </h3>

                  <div className="space-y-4">
                    <div>
                        <p className="text-sm text-slate-500 mb-1">Full repayment (theoretical) in:</p>
                        <p className="text-2xl font-bold text-slate-800">{formatYears(results.termYears)}</p>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <p className="text-sm text-slate-500 mb-1">Remaining debt after 10 years:</p>
                        <p className="text-xl font-bold text-slate-800">{formatEuro(results.remainingDebt10)}</p>
                        <p className="text-xs text-slate-400 mt-1">
                            By then you will have repaid approx. {formatEuro(results.loanAmount - results.remainingDebt10)}.
                        </p>
                    </div>

                    <div className="bg-yellow-50 p-3 rounded border border-yellow-100 text-xs text-yellow-800 mt-2">
                        Note: This calculation assumes a fixed interest rate over the entire term. In practice, interest is usually fixed for 10, 15, or 20 years.
                    </div>
                  </div>
                </div>

              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealEstateCalculator;