import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Wallet, Landmark, Info, PieChart, ArrowRight, Plus, Minus } from 'lucide-react';

const App = () => {
  const [investimento, setInvestimento] = useState(10000);
  
  // Parametri BTP Valore Marzo 2026
  const DURATA_ANNI = 6;
  const CEDOLE_PER_ANNO = 4;
  const TASSAZIONE = 0.125; // 12.5%
  const BOLLO_ANNUO = 0.002; // 0.20%
  const COSTO_POSTE_ANNUO = 20; // 10€ a semestre
  const PREMIO_FEDELTA_LORDO = 0.008; // 0.8%

  const TASSI_LORDI = [
    { label: "Anni 1-2", anni: [1, 2], tasso: 0.025 }, // 2.50%
    { label: "Anni 3-4", anni: [3, 4], tasso: 0.028 }, // 2.80%
    { label: "Anni 5-6", anni: [5, 6], tasso: 0.035 }, // 3.50%
  ];

  const cambiaInvestimento = (delta) => {
    setInvestimento(prev => {
      const nuovo = prev + delta;
      return nuovo < 1000 ? 1000 : nuovo;
    });
  };

  const calcolaDati = useMemo(() => {
    let dati = [];
    let guadagnoAccumulato = 0;
    let costiAccumulati = 0;
    
    dati.push({
      trimestre: 0,
      label: 'Inizio',
      valoreTotale: investimento,
      guadagnoNetto: 0,
      costi: 0
    });

    for (let anno = 1; anno <= DURATA_ANNI; anno++) {
      const configTasso = TASSI_LORDI.find(t => t.anni.includes(anno));
      const tassoLordoAnnuo = configTasso.tasso;
      
      for (let trim = 1; trim <= CEDOLE_PER_ANNO; trim++) {
        const trimestreGlobale = (anno - 1) * 4 + trim;
        const cedolaNetta = ((investimento * tassoLordoAnnuo) / 4) * (1 - TASSAZIONE);
        const bolloTrimestrale = (investimento * BOLLO_ANNUO) / 4;
        const tenutaTrimestrale = COSTO_POSTE_ANNUO / 4;
        
        guadagnoAccumulato += cedolaNetta;
        costiAccumulati += (bolloTrimestrale + tenutaTrimestrale);

        if (trimestreGlobale === DURATA_ANNI * 4) {
          const bonusNetto = (investimento * PREMIO_FEDELTA_LORDO) * (1 - TASSAZIONE);
          guadagnoAccumulato += bonusNetto;
        }

        dati.push({
          trimestre: trimestreGlobale,
          label: `A${anno} T${trim}`,
          valoreTotale: investimento + guadagnoAccumulato - costiAccumulati,
          guadagnoNetto: guadagnoAccumulato,
          costi: costiAccumulati,
          cedolaSingola: cedolaNetta
        });
      }
    }
    return dati;
  }, [investimento]);

  const riepilogoFinale = calcolaDati[calcolaDati.length - 1];
  const rendimentoNettoPercentuale = ((riepilogoFinale.guadagnoNetto - riepilogoFinale.costi) / investimento * 100).toFixed(2);

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 font-sans text-slate-100">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
              <Landmark className="text-emerald-500" /> Calcolatore BTP Valore
            </h1>
            <p className="text-slate-400">Marzo 2026 • Scadenza 2032 (6 anni)</p>
          </div>
          <div className="bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-emerald-400 font-mono text-sm">ISIN: IT0005696320</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Input e Controlli */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-800">
              <label className="block text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest">
                Capitale da Investire
              </label>
              
              <div className="space-y-6">
                {/* Selettore +/- */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => cambiaInvestimento(-1000)}
                    className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors text-slate-300 border border-slate-700"
                  >
                    <Minus size={20} />
                  </button>
                  <div className="flex-1 bg-slate-950 border border-emerald-500/30 p-3 rounded-xl text-center">
                    <span className="text-2xl font-black text-emerald-400">€ {investimento.toLocaleString()}</span>
                  </div>
                  <button 
                    onClick={() => cambiaInvestimento(1000)}
                    className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors text-slate-300 border border-slate-700"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                <input 
                  type="range" 
                  min="1000" 
                  max="100000" 
                  step="1000" 
                  value={investimento}
                  onChange={(e) => setInvestimento(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* Tabella Dettagli Dinamica */}
              <div className="mt-8 space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Prospetto Rendimenti</h3>
                <div className="grid grid-cols-2 text-[10px] font-bold text-slate-600 uppercase mb-1 px-1">
                  <span>Periodo / Tasso</span>
                  <span className="text-right">Cedola Annua Netta</span>
                </div>
                
                {TASSI_LORDI.map((t, i) => (
                  <div key={i} className="flex justify-between items-center py-3 border-b border-slate-800/50 last:border-0">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-200">{t.label}</span>
                      <span className="text-[10px] text-emerald-500 font-bold">{(t.tasso * 100).toFixed(2)}% Lordo</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-white">
                        € {(investimento * t.tasso * (1 - TASSAZIONE)).toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </span>
                    </div>
                  </div>
                ))}
                
                <div className="mt-4 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/20 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-emerald-400">Premio Fedeltà</span>
                    <span className="text-[10px] text-emerald-600 uppercase font-bold">Extra Scadenza (0,8%)</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-400">
                    + € {(investimento * PREMIO_FEDELTA_LORDO * (1 - TASSAZIONE)).toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex gap-3">
              <Info className="text-slate-500 shrink-0" size={18} />
              <p className="text-[11px] text-slate-500 leading-relaxed italic">
                Calcoli basati su ritenuta fiscale 12,5%, bollo 0,2% e spese Poste Italiane 20€/anno.
              </p>
            </div>
          </div>

          {/* Risultati e Grafico */}
          <div className="md:col-span-2 space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-emerald-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-900/20 relative overflow-hidden group">
                <p className="text-emerald-100 text-sm font-medium relative z-10">Netto Totale (6 anni)</p>
                <h2 className="text-3xl font-black mt-1 relative z-10">€ {(riepilogoFinale.guadagnoNetto - riepilogoFinale.costi).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h2>
                <p className="text-emerald-100/80 text-xs mt-2 flex items-center gap-1 relative z-10 font-medium">
                  <TrendingUp size={14} /> Rendimento del {rendimentoNettoPercentuale}%
                </p>
                <Wallet className="absolute -right-4 -bottom-4 text-emerald-400/20 w-24 h-24 rotate-12 group-hover:scale-110 transition-transform" />
              </div>
              <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl">
                <p className="text-slate-500 text-sm font-medium">Cedola Trimestrale Netta</p>
                <h2 className="text-3xl font-bold text-white mt-1">€ {calcolaDati[1].cedolaSingola.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h2>
                <p className="text-emerald-500 text-xs mt-2 font-semibold">Ogni 3 mesi sul Libretto</p>
              </div>
            </div>

            {/* Grafico */}
            <div className="bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-800">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-bold text-white">Crescita del Capitale</h3>
                  <p className="text-xs text-slate-500">Accumulo netto nel tempo</p>
                </div>
                <div className="hidden sm:flex gap-4 text-[10px] uppercase font-bold tracking-widest">
                  <span className="flex items-center gap-1.5 text-emerald-500"><div className="w-2 h-2 rounded-full bg-emerald-500"/> Valore + Interessi</span>
                  <span className="flex items-center gap-1.5 text-slate-700"><div className="w-2 h-2 rounded-full bg-slate-700"/> Base</span>
                </div>
              </div>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={calcolaDati} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis 
                      dataKey="label" 
                      fontSize={9} 
                      tickLine={false} 
                      axisLine={false}
                      interval={3}
                      tick={{fill: '#475569'}}
                    />
                    <YAxis 
                      hide={true} 
                      domain={['dataMin - 100', 'dataMax + 400']} 
                    />
                    <Tooltip 
                      contentStyle={{backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)', padding: '12px'}}
                      itemStyle={{color: '#10b981'}}
                      formatter={(value) => [`€ ${value.toLocaleString(undefined, {minimumFractionDigits: 2})}`, 'Capitale Totale']}
                      labelStyle={{fontWeight: 'bold', marginBottom: '4px', color: '#94a3b8'}}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="valoreTotale" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorGreen)" 
                      animationDuration={800}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recap Scadenza */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-8 border border-slate-800 overflow-hidden relative">
              <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-8">
                <div className="text-center sm:text-left">
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Restituzione alla fine (2032)</p>
                  <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                    <span className="text-4xl font-black text-white">€ {investimento.toLocaleString()}</span>
                    <span className="text-emerald-400 font-bold text-lg">+ Bonus</span>
                  </div>
                  <p className="text-slate-600 text-[10px] mt-2 italic font-medium">Garantito dallo Stato Italiano al 100%</p>
                </div>
                <div className="h-px w-full sm:h-12 sm:w-px bg-slate-800" />
                <div className="text-center sm:text-right">
                  <p className="text-xs uppercase text-slate-500 font-bold mb-1 tracking-wider">Saldo Finale Complessivo</p>
                  <p className="text-3xl font-black text-emerald-400">€ {(riepilogoFinale.valoreTotale).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                </div>
              </div>
              <div className="absolute -right-10 -top-10 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl" />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default App;