import math

def berechne_mit_fester_tilgung(kaufpreis, gesamt_eigenkapital, zins_prozent, tilgung_prozent, hausgeld, private_ruecklage):
    # 1. Kaufnebenkosten (München/Bayern)
    nebenkosten_satz = 0.035 + 0.015 + 0.0357  # 8,57%
    nebenkosten_betrag = kaufpreis * nebenkosten_satz
    
    # 2. Verfügbares EK nach Kosten
    netto_eigenkapital = gesamt_eigenkapital - nebenkosten_betrag
    
    # Kreditsumme
    kreditbetrag = kaufpreis - netto_eigenkapital
    
    if netto_eigenkapital < 0:
        return None, "Fehler: Eigenkapital deckt nicht einmal die Kaufnebenkosten!"

    # 3. Monatliche Bankrate berechnen (Klassische Annuität)
    # Formel: (Kreditsumme * (Zins% + Tilgung%)) / 12
    annuitaet_prozent = zins_prozent + tilgung_prozent
    bankrate_jahr = kreditbetrag * (annuitaet_prozent / 100)
    bankrate_monat = bankrate_jahr / 12
    zinsen_monat = kreditbetrag * (zins_prozent / 100) / 12
    tilgung_monat = kreditbetrag * (tilgung_prozent / 100) / 12

    # 4. Laufzeit berechnen (Wann ist der Kredit bei dieser Rate weg?)
    # Formel: n = -ln(1 - (i * K) / R) / ln(1 + i)
    monatszins_faktor = (zins_prozent / 100) / 12
    
    try:
        # Argument für Logarithmus
        log_arg = 1 - (monatszins_faktor * kreditbetrag) / bankrate_monat
        anzahl_monate = -math.log(log_arg) / math.log(1 + monatszins_faktor)
        laufzeit_jahre = anzahl_monate / 12
    except ValueError:
        laufzeit_jahre = 999 # Falls Zinsen > Rate (Tilgung zu klein), wird Kredit nie fertig

    # 5. Gesamtkosten
    gesamtbelastung = bankrate_monat + hausgeld + private_ruecklage

    return {
        "kreditbetrag": kreditbetrag,
        "zinsen_monat": zinsen_monat,
        "tilgung_monat": tilgung_monat,
        "bankrate": bankrate_monat,
        "laufzeit_jahre": laufzeit_jahre,
        "gesamtbelastung": gesamtbelastung,
        "restschuld_nach_10_jahren": berechne_restschuld(kreditbetrag, zins_prozent, tilgung_prozent, 10)
    }

def berechne_restschuld(k, zins, tilgung, jahre):
    # Hilfsfunktion für Restschuld nach X Jahren
    annuitaet = k * (zins + tilgung) / 100
    q = 1 + (zins / 100)
    # Formel: Restschuld = K * q^n - R * (q^n - 1) / (q - 1)
    rest = k * (q**jahre) - annuitaet * ((q**jahre) - 1) / (q - 1)
    return max(0, rest)

# --- Eingabewerte ---
preis = 800000        
kapital = 300000       
zins = 3.8             
tilgung_wunsch = 2.0   # FIX: 2% Tilgung
hausgeld = 500         
ruecklage = 150        

# --- Ausführen ---
erg = berechne_mit_fester_tilgung(preis, kapital, zins, tilgung_wunsch, hausgeld, ruecklage)

# --- Ausgabe ---
if erg:
    print(f"--- SZENARIO A (Feste Tilgung {tilgung_wunsch}%) ---")
    print(f"Kreditbetrag:           {erg['kreditbetrag']:,.2f} €")
    print(f"----------------------------------------")
    print(f"Monatliche Zinsen): {erg['zinsen_monat']:,.2f} € / Monat")
    print(f"Monatliche Tilgung): {erg['tilgung_monat']:,.2f} € / Monat")
    print(f"Bankrate (Zins+Tilgung): {erg['bankrate']:,.2f} € / Monat")
    print(f"+ Hausgeld:             {hausgeld:,.2f} €")
    print(f"+ Private Rücklage:     {ruecklage:,.2f} €")
    print(f"========================================")
    print(f"MONATLICHE GESAMTKOSTEN: {erg['gesamtbelastung']:,.2f} €")
    print(f"----------------------------------------")
    print(f"Voraussichtliche Laufzeit: {erg['laufzeit_jahre']:.1f} Jahre")
    print(f"Restschuld nach 10 Jahren: {erg['restschuld_nach_10_jahren']:,.2f} €")
else:
    print(erg[1])