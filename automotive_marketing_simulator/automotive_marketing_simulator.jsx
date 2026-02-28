import React, { useState, useEffect } from 'react';
import { Car, TrendingUp, Target, BarChart3, Info, AlertCircle, SteeringWheel } from 'lucide-react';

const AutoMarketingSimulator = () => {
  // --- State Management ---
  const [budget, setBudget] = useState(25000); // Höheres Budget für Auto
  const [strategyMix, setStrategyMix] = useState(60); // 0 = Markenimage, 100 = Abverkauf
  const [executionQuality, setExecutionQuality] = useState(7); // 1-10 Score

  // --- Derived Metrics & Simulation Logic ---
  const [metrics, setMetrics] = useState({
    impressions: 0,
    clicks: 0,
    configs: 0, // Konfigurationen
    leads: 0,   // Probefahrten
    sales: 0,   // Verkäufe
    revenue: 0,
    roas: 0,
    cpl: 0,     // Cost per Lead
    cac: 0,     // Customer Acquisition Cost
    cpm: 0,
    ctr: 0,
    leadRate: 0,
    closeRate: 0
  });

  useEffect(() => {
    // 1. Impressions (Reichweite)
    // Automotive CPM ist oft höher durch starken Wettbewerb
    const baseCPM = 15 + (strategyMix / 100) * 20; // 15€ - 35€ CPM
    const qualityFactor = 1 + ((10 - executionQuality) * 0.05);
    const actualCPM = baseCPM * qualityFactor;
    const impressions = Math.floor((budget / actualCPM) * 1000);

    // 2. Clicks (Interesse / Landing Page)
    // Performance-Marketing (hoher StrategyMix) bringt mehr Klicks, Brand-Marketing eher Views
    const baseCTR = 0.008; // 0.8% Basis
    const strategyImpactCTR = (strategyMix / 100) * 0.012; 
    const qualityImpactCTR = (executionQuality / 10) * 0.02;
    const ctr = baseCTR + strategyImpactCTR + qualityImpactCTR;
    const clicks = Math.floor(impressions * ctr);

    // 3. Konfigurationen & Leads (Probefahrten)
    // Klick -> Lead Rate ist im Auto-Bereich niedriger als im E-Commerce
    // Hohe Qualität der Webseite/Ad ist entscheidend
    const clickToLeadRate = 0.015 + (executionQuality / 10) * 0.025; // 1.5% - 4%
    const leads = Math.floor(clicks * clickToLeadRate);

    // 4. Verkäufe (Sales beim Händler)
    // Leads zu Sales Conversion. Hängt stark vom Händler ab, aber hier simulieren wir Marketing-Qualität
    // Brand-Marketing (niedriger Mix) führt oft zu qualifizierteren, markentreuen Käufern
    const baseCloseRate = 0.08; // 8% der Probefahrten kaufen
    // Wenn Strategy zu aggressiv auf Performance ist, sinkt oft die Lead-Qualität
    const qualityPenalty = strategyMix > 80 ? 0.8 : 1.0; 
    const brandBonus = (100 - strategyMix) / 1000; // Branding hilft beim Abschluss
    const finalCloseRate = (baseCloseRate + brandBonus) * qualityPenalty;
    
    const sales = Math.floor(leads * finalCloseRate);

    // 5. Finanzkennzahlen
    const aov = 45000; // Durchschnittspreis Neuwagen
    const revenue = sales * aov;
    const roas = budget > 0 ? (revenue / budget).toFixed(2) : 0;
    const cac = sales > 0 ? (budget / sales).toFixed(0) : 0;
    const cpl = leads > 0 ? (budget / leads).toFixed(0) : 0;

    setMetrics({
      impressions,
      clicks,
      leads,
      sales,
      revenue,
      roas,
      cpl,
      cac,
      cpm: actualCPM.toFixed(2),
      ctr: (ctr * 100).toFixed(2),
      leadRate: (clickToLeadRate * 100).toFixed(2),
      closeRate: (finalCloseRate * 100).toFixed(1)
    });

  }, [budget, strategyMix, executionQuality]);

  const getRoasColor = (roas) => {
    if (roas < 5) return "text-red-500"; // Auto braucht oft höheren ROAS wegen Marge
    if (roas < 10) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-slate-50 min-h-screen font-sans text-slate-800">
      
      {/* Header */}
      <header className="mb-8 border-b pb-4 border-slate-200">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Car className="w-10 h-10 text-blue-700" />
          Automotive Marketing Simulator
        </h1>
        <p className="text-slate-600 mt-2 text-lg">
          Simuliere den Einfluss von Budget, Strategie und Kreativität auf den Fahrzeugverkauf.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT: CONTROLS --- */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" /> Kampagnen-Steuerung
            </h2>

            {/* Input 1: Budget */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-slate-700 mb-2 flex justify-between">
                <span>Monatsbudget (Media)</span>
                <span className="text-blue-700 font-bold">{budget.toLocaleString()} €</span>
              </label>
              <input 
                type="range" min="5000" max="100000" step="1000" 
                value={budget} 
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Input 2: Strategy Mix */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-slate-700 mb-2 flex justify-between">
                <span>Strategie-Mix</span>
                <span className="text-xs font-semibold px-2 py-1 bg-slate-100 rounded text-slate-600">
                  {strategyMix < 40 ? "Markenaufbau (Brand)" : strategyMix > 70 ? "Harter Abverkauf" : "Ausgewogen"}
                </span>
              </label>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Image / TV</span>
                <span>Performance</span>
              </div>
              <input 
                type="range" min="0" max="100" 
                value={strategyMix} 
                onChange={(e) => setStrategyMix(Number(e.target.value))}
                className="w-full h-2 bg-gradient-to-r from-indigo-300 to-orange-300 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Input 3: Execution Quality */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex justify-between">
                <span>Kreativ- & Web-Qualität</span>
                <span className="font-bold text-indigo-600">{executionQuality}/10</span>
              </label>
              <input 
                type="range" min="1" max="10" 
                value={executionQuality} 
                onChange={(e) => setExecutionQuality(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <p className="text-xs text-slate-500 mt-2">
                Beeinflusst Klicks auf Anzeigen und Konversionsrate im Konfigurator.
              </p>
            </div>
          </div>

          {/* KPI Summary Small */}
          <div className="bg-blue-900 text-white p-6 rounded-xl shadow-lg">
            <h3 className="text-blue-200 text-sm uppercase tracking-wider mb-4 font-semibold">Geschätzter Umsatz</h3>
            <div className="text-4xl font-bold mb-2">{(metrics.revenue / 1000000).toFixed(2)} Mio. €</div>
            <div className="text-blue-200 text-sm">
              durch {metrics.sales} verkaufte Fahrzeuge
            </div>
          </div>
        </div>

        {/* --- RIGHT: FUNNEL VISUALIZATION --- */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" /> Automotive Sales Funnel
            </h2>

            <div className="space-y-2 relative">
              
              {/* Stage 1: Awareness */}
              <div className="relative hover:translate-x-1 transition-transform">
                <div className="bg-slate-100 p-4 rounded-lg border-l-4 border-slate-400 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase">1. Reichweite</span>
                    <div className="font-mono text-xl text-slate-800">{metrics.impressions.toLocaleString()} <span className="text-sm text-slate-400 font-normal">Impressions</span></div>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    CPM: {metrics.cpm} €
                  </div>
                </div>
                {/* Connector Arrow */}
                <div className="h-6 w-0.5 bg-slate-200 ml-8"></div>
              </div>

              {/* Stage 2: Interest */}
              <div className="relative hover:translate-x-1 transition-transform">
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-300 flex justify-between items-center w-[95%]">
                  <div>
                    <span className="text-xs font-bold text-blue-600 uppercase">2. Interesse (Webseite)</span>
                    <div className="font-mono text-xl text-slate-800">{metrics.clicks.toLocaleString()} <span className="text-sm text-slate-400 font-normal">Besucher</span></div>
                  </div>
                  <div className="text-right text-xs text-blue-600 font-medium">
                    CTR: {metrics.ctr}%
                  </div>
                </div>
                <div className="h-6 w-0.5 bg-slate-200 ml-8"></div>
              </div>

              {/* Stage 3: Consideration (LEADS) */}
              <div className="relative hover:translate-x-1 transition-transform">
                <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500 flex justify-between items-center w-[85%] shadow-sm">
                  <div>
                    <span className="text-xs font-bold text-indigo-700 uppercase flex items-center gap-2">
                      <SteeringWheel className="w-4 h-4" /> Probefahrten (Leads)
                    </span>
                    <div className="font-mono text-2xl font-bold text-indigo-900">{metrics.leads.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-indigo-600 font-medium">Rate: {metrics.leadRate}%</div>
                    <div className="text-xs text-slate-400 mt-1">CPL: {metrics.cpl} €</div>
                  </div>
                </div>
                <div className="h-6 w-0.5 bg-slate-200 ml-8"></div>
              </div>

              {/* Stage 4: Action (SALES) */}
              <div className="relative hover:translate-x-1 transition-transform">
                <div className="bg-green-50 p-5 rounded-lg border-l-4 border-green-500 flex justify-between items-center w-[60%] shadow-md">
                  <div>
                    <span className="text-xs font-bold text-green-700 uppercase flex items-center gap-2">
                      <Car className="w-4 h-4" /> Fahrzeugverkäufe
                    </span>
                    <div className="font-mono text-3xl font-bold text-green-900">{metrics.sales.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-green-600 font-medium">Abschluss: {metrics.closeRate}%</div>
                    <div className="text-xs text-slate-400 mt-1">CAC: {metrics.cac} €</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* --- ANALYSIS BOX --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-400" /> Effizienz (ROAS)
              </h4>
              <div className={`text-3xl font-bold mb-1 ${getRoasColor(metrics.roas)}`}>
                {metrics.roas}x
              </div>
              <p className="text-xs text-slate-500">
                Für jeden investierten Euro erhältst du {metrics.roas} € Umsatz zurück. 
                (In der Autoindustrie sind hohe Werte nötig, da die Marge pro Auto gering ist).
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
               <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-slate-400" /> Analyse
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                {metrics.cac > 800 ? (
                  <span className="text-red-600">
                    <strong>Achtung:</strong> Deine Akquisekosten (CAC) von {metrics.cac}€ pro Auto sind sehr hoch. Prüfe, ob du die Qualität der Leads verbessern kannst.
                  </span>
                ) : (
                  <span className="text-green-700">
                    <strong>Gut:</strong> Mit {metrics.cac}€ CAC liegst du in einem profitablen Bereich für Neuwagenverkäufe.
                  </span>
                )}
                <br/>
                {strategyMix < 30 && metrics.closeRate > 8.5 && (
                  <span className="block mt-2 text-indigo-600">
                    <strong>Tipp:</strong> Dein Fokus auf Markenaufbau sorgt für hohe Abschlussraten im Autohaus!
                  </span>
                )}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AutoMarketingSimulator;