-- ========================
-- DONNÉES DE TEST
-- ========================

INSERT INTO station (nom_station, adresse, capacite)
VALUES ('Test Station', '123 rue du test', 10);

INSERT INTO client (nom, prenom, email)
VALUES ('Test', 'Client', 'test@client.com');

INSERT INTO vehicule (type_vehicule, modele, statut, autonomie_km, id_station)
SELECT 'voiture', 'TestCar', 'disponible', 250, id_station
FROM station
WHERE nom_station = 'Test Station';

-- ========================
-- TEST DU TRIGGER
-- ========================
WITH v AS (
    SELECT id_vehicule FROM vehicule
    WHERE statut = 'disponible'
    LIMIT 1
)
INSERT INTO location (date_debut, id_client, id_vehicule)
SELECT NOW(), 1, id_vehicule FROM v;

-- Vérification
SELECT id_vehicule, statut FROM vehicule;

-- ========================
-- FINALISER LA LOCATION
-- ========================
UPDATE location
SET date_fin = NOW() + INTERVAL '2 hours',
    prix_total = 12.50
WHERE id_location = (SELECT MAX(id_location) FROM location);
-- ========================
-- DONNÉES DE TEST
-- ========================

INSERT INTO station (nom_station, adresse, capacite)
VALUES ('Test Station', '123 rue du test', 10);

INSERT INTO client (nom, prenom, email)
VALUES ('Test', 'Client', 'test@client.com');

INSERT INTO vehicule (type_vehicule, modele, statut, autonomie_km, id_station)
SELECT 'voiture', 'TestCar', 'disponible', 250, id_station
FROM station
WHERE nom_station = 'Test Station';

-- ========================
-- TEST DU TRIGGER
-- ========================
INSERT INTO location (date_debut, id_client, id_vehicule)
VALUES (NOW(), 1, 1);

-- Vérification
SELECT id_vehicule, statut
FROM vehicule
WHERE id_vehicule = 1;
