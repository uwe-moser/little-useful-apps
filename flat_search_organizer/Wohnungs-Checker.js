import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Home,
  MapPin,
  Euro,
  Train,
  Trees,
  Briefcase,
  Building,
  Baby,
  Stethoscope,
  ShoppingBag,
  Car,
  Wind,
  Music,
  Dumbbell,
  Plane,
  Save,
  X,
  Edit2,
  ChevronDown,
  ChevronUp,
  Filter
} from 'lucide-react';

// --- Criteria Definitions ---

const LOCATIONS = ["Ismaning", "Unterföhring", "Garching", "Bogenhausen", "Altbogenhausen", "Oberföhring"];

const CRITERIA = {
  ko: [
    { id: 'budget', label: 'Rent (incl. utilities) ≤ €2500', type: 'number', max: 2500, icon: Euro },
    { id: 'rooms', label: 'Rooms ≥ 4', type: 'number', min: 4, icon: Home },
    { id: 'location', label: 'Good neighborhood (Ismaning, Garching, etc.)', type: 'select', options: LOCATIONS, icon: MapPin },
    { id: 'noAttic', label: 'No attic apartment', type: 'boolean', icon: Wind },
    { id: 'elevator', label: 'Elevator (required if not ground floor)', type: 'boolean', icon: Building },
  ],
  prio1: [
    { id: 'kitaSchool', label: 'Daycare/School within walking distance', icon: Baby },
    { id: 'commuteDCM', label: 'Work DCM < 30min', icon: Briefcase },
    { id: 'commuteWorkday', label: 'Work Workday easily accessible', icon: Briefcase },
    { id: 'publicTransport', label: 'Public transport nearby (metro preferred)', icon: Train },
    { id: 'nature', label: 'Green space / Park / Playground', icon: Trees },
    { id: 'quiet', label: 'No major road nearby', icon: check => check ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" /> },
    { id: 'landlord', label: 'Responsible landlord / No personal use clause', icon: Building },
    { id: 'infrastructure', label: 'Supermarket, drugstore, restaurants', icon: ShoppingBag },
    { id: 'doctors', label: 'Doctors nearby', icon: Stethoscope },
    { id: 'parking', label: 'Parking space / EV charger', icon: Car },
    { id: 'accessibilityOma', label: 'Accessible for grandma Gerda (transit/elevator)', icon: check => <div className="font-bold text-xs">👵</div> },
  ],
  prio3: [
    { id: 'cityConnection', label: 'City center connection', icon: Train },
    { id: 'soundproof', label: 'Good soundproofing', icon: Music },
    { id: 'kidsLeisure', label: 'Kids leisure activities (sports/music)', icon: Baby },
    { id: 'noChores', label: 'No shared cleaning duties/gardening', icon: check => <div className="font-bold text-xs">🧹</div> },
    { id: 'flooring', label: 'No carpet flooring', icon: check => <div className="font-bold text-xs">🪵</div> },
    { id: 'laundry', label: 'Laundry facilities', icon: check => <div className="font-bold text-xs">🧺</div> },
    { id: 'modern', label: 'Relatively new (< 15 years)', icon: Home },
    { id: 'cellar', label: 'Large cellar/storage', icon: check => <div className="font-bold text-xs">📦</div> },
    { id: 'bike', label: 'Bicycle storage', icon: check => <div className="font-bold text-xs">🚲</div> },
    { id: 'balcony', label: 'Balcony', icon: Trees },
    { id: 'storage', label: 'Storage room', icon: check => <div className="font-bold text-xs">🚪</div> },
    { id: 'kitchen', label: 'Built-in kitchen included', icon: check => <div className="font-bold text-xs">🍳</div> },
    { id: 'airport', label: 'Airport easily accessible', icon: Plane },
    { id: 'aschheim', label: 'Aschheim easily accessible', icon: MapPin },
    { id: 'fitness', label: 'Near Body & Soul gym', icon: Dumbbell },
    { id: 'robot', label: 'Robot vacuum friendly', icon: check => <div className="font-bold text-xs">🤖</div> },
  ]
};

// Point weights
const POINTS = {
  prio1: 10,
  prio3: 3
};

// --- Components ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, type = "neutral" }) => {
  const colors = {
    neutral: "bg-slate-100 text-slate-700",
    success: "bg-emerald-100 text-emerald-800",
    danger: "bg-rose-100 text-rose-800",
    warning: "bg-amber-100 text-amber-800",
    blue: "bg-blue-100 text-blue-800"
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[type]}`}>
      {children}
    </span>
  );
};

const ScoreCircle = ({ score, maxScore, isKo }) => {
  if (isKo) {
    return (
      <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center border-4 border-rose-500 text-rose-600 font-bold flex-col">
        <span className="text-xl">KO</span>
      </div>
    );
  }

  const percentage = Math.round((score / maxScore) * 100);
  let colorClass = "border-emerald-500 text-emerald-600 bg-emerald-50";
  if (percentage < 50) colorClass = "border-amber-500 text-amber-600 bg-amber-50";
  if (percentage < 30) colorClass = "border-rose-500 text-rose-600 bg-rose-50";

  return (
    <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 font-bold flex-col ${colorClass}`}>
      <span className="text-xl">{percentage}%</span>
      <span className="text-[10px] opacity-75">{score} pts</span>
    </div>
  );
};

// --- Main Application ---

export default function ApartmentScorer() {
  const [apartments, setApartments] = useState(() => {
    const saved = localStorage.getItem('apartments_v1');
    return saved ? JSON.parse(saved) : [];
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Empty form template
  const initialFormState = {
    title: '',
    link: '',
    address: '',
    ko: {
      budget: '',
      rooms: '',
      location: '',
      noAttic: true,
      elevator: false,
      isGroundFloor: false
    },
    prio1: CRITERIA.prio1.reduce((acc, c) => ({ ...acc, [c.id]: false }), {}),
    prio3: CRITERIA.prio3.reduce((acc, c) => ({ ...acc, [c.id]: false }), {})
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    localStorage.setItem('apartments_v1', JSON.stringify(apartments));
  }, [apartments]);

  // Scoring Logic
  const calculateScore = (apt) => {
    let koFailures = [];

    // Check KO criteria
    if (apt.ko.budget > 2500) koFailures.push('Over budget');
    if (apt.ko.rooms < 4) koFailures.push('Too few rooms');
    if (!LOCATIONS.some(l => apt.ko.location.includes(l))) koFailures.push('Wrong location');
    if (!apt.ko.noAttic) koFailures.push('Attic apartment');
    if (!apt.ko.isGroundFloor && !apt.ko.elevator) koFailures.push('No elevator');

    // Calculate Points
    let score = 0;
    let maxScore = 0;

    // Priority 1
    CRITERIA.prio1.forEach(c => {
      maxScore += POINTS.prio1;
      if (apt.prio1[c.id]) score += POINTS.prio1;
    });

    // Priority 3
    CRITERIA.prio3.forEach(c => {
      maxScore += POINTS.prio3;
      if (apt.prio3[c.id]) score += POINTS.prio3;
    });

    return { score, maxScore, koFailures, isKo: koFailures.length > 0 };
  };

  const handleSave = () => {
    if (!formData.title) return alert("Please give the apartment a name.");

    if (editingId) {
      setApartments(apartments.map(a => a.id === editingId ? { ...formData, id: editingId, date: new Date().toISOString() } : a));
    } else {
      setApartments([...apartments, { ...formData, id: crypto.randomUUID(), date: new Date().toISOString() }]);
    }
    setIsFormOpen(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  const handleEdit = (apt) => {
    setFormData(apt);
    setEditingId(apt.id);
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm("Really delete this apartment?")) {
      setApartments(apartments.filter(a => a.id !== id));
    }
  };

  const sortedApartments = useMemo(() => {
    return [...apartments].sort((a, b) => {
      const scoreA = calculateScore(a);
      const scoreB = calculateScore(b);
      // KO always last
      if (scoreA.isKo && !scoreB.isKo) return 1;
      if (!scoreA.isKo && scoreB.isKo) return -1;
      // Then by score
      return scoreB.score - scoreA.score;
    });
  }, [apartments]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">

      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Home className="text-indigo-600" />
              Apartment Checker
            </h1>
            <p className="text-xs text-slate-500">Munich & surroundings • 2025/2026</p>
          </div>
          <button
            onClick={() => {
              setFormData(initialFormState);
              setEditingId(null);
              setIsFormOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add apartment</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">

        {apartments.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="text-slate-400 w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No apartments yet</h3>
            <p className="text-slate-500 mb-6">Add your first viewing or listing to start rating.</p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="text-indigo-600 font-medium hover:underline"
            >
              Get started &rarr;
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
            {sortedApartments.map(apt => {
              const { score, maxScore, koFailures, isKo } = calculateScore(apt);

              return (
                <Card key={apt.id} className={`transition-all hover:shadow-md ${isKo ? 'opacity-75 bg-slate-50' : ''}`}>
                  <div className="p-5 flex flex-col md:flex-row gap-6">

                    {/* Left: Score & Basic Info */}
                    <div className="flex-shrink-0 flex md:flex-col items-center gap-4 md:w-32 md:border-r border-slate-100 pr-4">
                      <ScoreCircle score={score} maxScore={maxScore} isKo={isKo} />
                      <div className="text-center">
                        <div className="text-sm font-bold text-slate-700">{apt.ko.budget}€</div>
                        <div className="text-xs text-slate-500">{apt.ko.rooms} rm. • {apt.ko.location}</div>
                      </div>
                    </div>

                    {/* Middle: Content */}
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h2 className="text-lg font-bold text-slate-900 leading-tight mb-1">{apt.title}</h2>
                          <div className="flex flex-wrap gap-2 text-sm text-slate-500 mb-3">
                            {apt.address && <span className="flex items-center gap-1"><MapPin size={12}/> {apt.address}</span>}
                            {apt.link && (
                              <a href={apt.link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1">
                                🔗 View listing
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(apt)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(apt.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {isKo && (
                        <div className="mb-4 bg-rose-50 border border-rose-100 rounded-lg p-3">
                          <h4 className="text-rose-700 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                            <AlertTriangle size={12} /> Knockout criteria failed
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {koFailures.map(fail => (
                              <Badge key={fail} type="danger">{fail}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-3">
                        {/* Priority 1 Highlights (only positive) */}
                        <div className="flex flex-wrap gap-2">
                           {CRITERIA.prio1.filter(c => apt.prio1[c.id]).map(c => (
                             <Badge key={c.id} type="success">
                               <div className="flex items-center gap-1">
                                 {typeof c.icon === 'function' ? c.icon(true) : <c.icon size={12} />}
                                 {c.label}
                               </div>
                             </Badge>
                           ))}
                           {/* Show missing important ones if not KO */}
                           {!isKo && CRITERIA.prio1.filter(c => !apt.prio1[c.id]).slice(0, 3).map(c => (
                             <Badge key={c.id} type="neutral">
                               <div className="flex items-center gap-1 opacity-50 decoration-slate-400">
                                 <X size={10} />
                                 {c.label}
                               </div>
                             </Badge>
                           ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Stats for comparison */}
                  <div className="bg-slate-50 px-5 py-2 border-t border-slate-100 flex gap-4 text-xs text-slate-500">
                     <span>Met: <b>{Object.values(apt.prio1).filter(Boolean).length}</b>/{CRITERIA.prio1.length} Priority 1</span>
                     <span>•</span>
                     <span>Nice-to-have: <b>{Object.values(apt.prio3).filter(Boolean).length}</b>/{CRITERIA.prio3.length} Priority 3</span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold">{editingId ? 'Edit apartment' : 'New apartment'}</h2>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-8">

              {/* Basic Info */}
              <section className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                  <input
                    autoFocus
                    type="text"
                    placeholder="e.g. Dream apartment Unterföhring"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Total rent (€)</label>
                    <input
                      type="number"
                      className={`w-full px-3 py-2 border rounded-lg outline-none ${formData.ko.budget > 2500 ? 'border-rose-300 bg-rose-50' : ''}`}
                      value={formData.ko.budget}
                      onChange={e => setFormData({...formData, ko: {...formData.ko, budget: Number(e.target.value)}})}
                    />
                    {formData.ko.budget > 2500 && <span className="text-xs text-rose-600">Over budget (€2500)</span>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Rooms</label>
                    <input
                      type="number"
                      className={`w-full px-3 py-2 border rounded-lg outline-none ${formData.ko.rooms < 4 && formData.ko.rooms !== '' ? 'border-rose-300 bg-rose-50' : ''}`}
                      value={formData.ko.rooms}
                      onChange={e => setFormData({...formData, ko: {...formData.ko, rooms: Number(e.target.value)}})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                    value={formData.ko.location}
                    onChange={e => setFormData({...formData, ko: {...formData.ko, location: e.target.value}})}
                  >
                    <option value="">Please select...</option>
                    {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                    <option value="Andere">Other location (Warning: Knockout criterion!)</option>
                  </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Link to listing</label>
                   <input
                    type="url"
                    placeholder="https://..."
                    className="w-full px-3 py-2 border rounded-lg outline-none text-sm"
                    value={formData.link}
                    onChange={e => setFormData({...formData, link: e.target.value})}
                  />
                </div>
              </section>

              {/* KO Checks */}
              <section className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                <h3 className="font-bold text-rose-800 mb-3 flex items-center gap-2">
                  <AlertTriangle size={18} />
                  Knockout Criteria (must all be met)
                </h3>
                <div className="space-y-3">
                   <label className="flex items-center gap-3 p-2 bg-white rounded-lg border border-rose-100 cursor-pointer hover:border-rose-300 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.ko.noAttic}
                        onChange={e => setFormData({...formData, ko: {...formData.ko, noAttic: e.target.checked}})}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <span className="flex-1 font-medium text-sm">Not an attic apartment?</span>
                   </label>

                   <div className="flex gap-4">
                     <label className="flex items-center gap-3 p-2 bg-white rounded-lg border border-rose-100 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={formData.ko.isGroundFloor}
                          onChange={e => setFormData({...formData, ko: {...formData.ko, isGroundFloor: e.target.checked}})}
                          className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <span className="flex-1 font-medium text-sm">Is ground floor?</span>
                     </label>
                     <label className={`flex items-center gap-3 p-2 bg-white rounded-lg border border-rose-100 cursor-pointer flex-1 ${!formData.ko.isGroundFloor && !formData.ko.elevator ? 'ring-2 ring-rose-500' : ''}`}>
                        <input
                          type="checkbox"
                          checked={formData.ko.elevator}
                          disabled={formData.ko.isGroundFloor}
                          onChange={e => setFormData({...formData, ko: {...formData.ko, elevator: e.target.checked}})}
                          className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 disabled:opacity-50"
                        />
                        <span className="flex-1 font-medium text-sm">Has elevator?</span>
                     </label>
                   </div>
                </div>
              </section>

              {/* Priority 1 */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-800">Priority 1: Important ({POINTS.prio1} pts)</h3>
                  <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                    {Object.values(formData.prio1).filter(Boolean).length} / {CRITERIA.prio1.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CRITERIA.prio1.map(c => (
                    <label
                      key={c.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        formData.prio1[c.id]
                          ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-indigo-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.prio1[c.id]}
                        onChange={e => setFormData({...formData, prio1: {...formData.prio1, [c.id]: e.target.checked}})}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-offset-0 focus:ring-0"
                      />
                      <div className="text-slate-500">
                        {typeof c.icon === 'function' ? c.icon(formData.prio1[c.id]) : <c.icon size={18} />}
                      </div>
                      <span className={`text-sm ${formData.prio1[c.id] ? 'font-medium text-indigo-900' : 'text-slate-600'}`}>
                        {c.label}
                      </span>
                    </label>
                  ))}
                </div>
              </section>

              {/* Priority 3 */}
              <section>
                 <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-800">Priority 3: Nice to have ({POINTS.prio3} pts)</h3>
                  <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full">
                    {Object.values(formData.prio3).filter(Boolean).length} / {CRITERIA.prio3.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CRITERIA.prio3.map(c => (
                    <label
                      key={c.id}
                      className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-all ${
                        formData.prio3[c.id]
                          ? 'bg-emerald-50 border-emerald-200'
                          : 'bg-white border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.prio3[c.id]}
                        onChange={e => setFormData({...formData, prio3: {...formData.prio3, [c.id]: e.target.checked}})}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-offset-0 focus:ring-0"
                      />
                      <span className={`text-xs ${formData.prio3[c.id] ? 'font-medium text-emerald-900' : 'text-slate-500'}`}>
                        {c.label}
                      </span>
                    </label>
                  ))}
                </div>
              </section>

            </div>

            <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end gap-3">
              <button
                onClick={() => setIsFormOpen(false)}
                className="px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-sm flex items-center gap-2"
              >
                <Save size={18} />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
