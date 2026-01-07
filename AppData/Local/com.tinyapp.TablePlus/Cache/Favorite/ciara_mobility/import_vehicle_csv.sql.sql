-- ========================
-- IMPORT CSV
-- ========================
\copy vehicule_brut FROM 'C:/Ccsv/vehicules_cIara_2025.csv' CSV HEADER;

-- ========================
-- STATIONS
-- ========================
INSERT INTO station (nom_station, adresse, capacite)
SELECT DISTINCT
    station_nom,
    station_adresse,
    50
FROM vehicule_brut
WHERE station_nom IS NOT NULL
ON CONFLICT (nom_station) DO NOTHING;

-- ========================
-- VEHICULES
-- ========================
INSERT INTO vehicule (type_vehicule, modele, statut, autonomie_km, id_station)
SELECT
    vb.type_vehicule,
    vb.modele,
    'disponible',
    vb.autonomie_km,
    s.id_station
FROM vehicule_brut vb
JOIN station s ON s.nom_station = vb.station_nom;
