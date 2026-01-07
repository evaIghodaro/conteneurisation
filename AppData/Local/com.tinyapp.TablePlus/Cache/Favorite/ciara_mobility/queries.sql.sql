-- ============================================================
-- CIARA MOBILITY - Requêtes SQL
-- Objectif : analyse et exploitation des données
-- ============================================================

-- 1. Nombre de véhicules par station
SELECT
    s.nom_station,
    COUNT(v.id_vehicule) AS nb_vehicules
FROM station s
LEFT JOIN vehicule v ON v.id_station = s.id_station
GROUP BY s.id_station
ORDER BY nb_vehicules DESC;


-- 2. Répartition des statuts des véhicules
SELECT
    statut,
    COUNT(*) AS nb_vehicules
FROM vehicule
GROUP BY statut
ORDER BY nb_vehicules DESC;


-- 3. Liste des véhicules disponibles par station
SELECT
    s.nom_station,
    v.modele,
    v.autonomie_km
FROM vehicule v
JOIN station s ON s.id_station = v.id_station
WHERE v.statut = 'disponible'
ORDER BY s.nom_station, v.modele;


-- 4. Véhicules déjà loués au moins une fois
SELECT DISTINCT
    v.modele
FROM vehicule v
JOIN location l ON l.id_vehicule = v.id_vehicule;


-- 5. Nombre de locations par client
SELECT
    c.nom,
    c.prenom,
    COUNT(l.id_location) AS nb_locations
FROM client c
LEFT JOIN location l ON l.id_client = c.id_client
GROUP BY c.id_client
ORDER BY nb_locations DESC;


-- 6. Durée moyenne des locations (en heures)
SELECT
    ROUND(
        AVG(EXTRACT(EPOCH FROM (date_fin - date_debut)) / 3600),
        2
    ) AS duree_moyenne_heures
FROM location
WHERE date_fin IS NOT NULL;


-- 7. Revenus totaux générés par les locations
SELECT
    SUM(prix_total) AS revenus_totaux
FROM location;


-- 8. Top 5 des véhicules les plus loués
SELECT
    v.modele,
    COUNT(l.id_location) AS nb_locations
FROM location l
JOIN vehicule v ON v.id_vehicule = l.id_vehicule
GROUP BY v.modele
ORDER BY nb_locations DESC
LIMIT 5;


-- 9. Clients ayant effectué au moins 2 locations
SELECT
    c.nom,
    c.prenom,
    COUNT(l.id_location) AS nb_locations
FROM client c
JOIN location l ON l.id_client = c.id_client
GROUP BY c.id_client
HAVING COUNT(l.id_location) >= 2;


-- 10. Stations avec capacité restante
SELECT
    s.nom_station,
    s.capacite,
    COUNT(v.id_vehicule) AS nb_vehicules,
    s.capacite - COUNT(v.id_vehicule) AS places_restantes
FROM station s
LEFT JOIN vehicule v ON v.id_station = s.id_station
GROUP BY s.id_station
ORDER BY places_restantes DESC;
