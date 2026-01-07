CREATE TABLE "marques"(
    "id" SERIAL NOT NULL,
    "nom" VARCHAR(100) NOT NULL
);
ALTER TABLE
    "marques" ADD PRIMARY KEY("id");
ALTER TABLE
    "marques" ADD CONSTRAINT "marques_nom_unique" UNIQUE("nom");
COMMENT
ON COLUMN
    "marques"."id" IS 'identifiant unique';
COMMENT
ON COLUMN
    "marques"."nom" IS 'Nom de la marque';
CREATE TABLE "modeles"(
    "id" SERIAL NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "marque_id" INTEGER NOT NULL
);
ALTER TABLE
    "modeles" ADD PRIMARY KEY("id");
COMMENT
ON COLUMN
    "modeles"."id" IS 'Identifiant unique';
COMMENT
ON COLUMN
    "modeles"."nom" IS 'Nom du modèle';
COMMENT
ON COLUMN
    "modeles"."marque_id" IS 'Référence à la marque';
CREATE TABLE "localisations"(
    "id" SERIAL NOT NULL,
    "ville" VARCHAR(100) NOT NULL
);
ALTER TABLE
    "localisations" ADD PRIMARY KEY("id");
ALTER TABLE
    "localisations" ADD CONSTRAINT "localisations_ville_unique" UNIQUE("ville");
COMMENT
ON COLUMN
    "localisations"."id" IS 'Identifiant unique';
COMMENT
ON COLUMN
    "localisations"."ville" IS 'Nom de la ville';
CREATE TABLE "etats"(
    "id" SERIAL NOT NULL,
    "nom" VARCHAR(50) NOT NULL
);
ALTER TABLE
    "etats" ADD PRIMARY KEY("id");
ALTER TABLE
    "etats" ADD CONSTRAINT "etats_nom_unique" UNIQUE("nom");
COMMENT
ON COLUMN
    "etats"."id" IS 'Identifiant unique';
COMMENT
ON COLUMN
    "etats"."nom" IS 'Nom de l''état';
CREATE TABLE "vehicules"(
    "id" SERIAL NOT NULL,
    "marque_id" INTEGER NOT NULL,
    "modele_id" INTEGER NOT NULL,
    "annee" INTEGER NOT NULL DEFAULT 'CHECK (annee BETWEEN 2000 AND 2010)',
    "energie" VARCHAR(50) NOT NULL,
    "autonomie_km" INTEGER NOT NULL DEFAULT 'CHECK (autonomie_km > 0)',
    "immatriculation" VARCHAR(20) NOT NULL,
    "etat_id" INTEGER NOT NULL,
    "localisation_id" INTEGER NOT NULL
);
ALTER TABLE
    "vehicules" ADD PRIMARY KEY("id");
ALTER TABLE
    "vehicules" ADD CONSTRAINT "vehicules_immatriculation_unique" UNIQUE("immatriculation");
COMMENT
ON COLUMN
    "vehicules"."id" IS 'Identifiant unique';
COMMENT
ON COLUMN
    "vehicules"."marque_id" IS 'Référence à la marque';
COMMENT
ON COLUMN
    "vehicules"."modele_id" IS 'Référence au modèle';
COMMENT
ON COLUMN
    "vehicules"."annee" IS 'Année du véhicule';
COMMENT
ON COLUMN
    "vehicules"."energie" IS 'Type d''énergie';
COMMENT
ON COLUMN
    "vehicules"."autonomie_km" IS 'Autonomie en km';
COMMENT
ON COLUMN
    "vehicules"."immatriculation" IS 'Plaque d''immatriculation';
COMMENT
ON COLUMN
    "vehicules"."etat_id" IS 'Référence à l''état';
COMMENT
ON COLUMN
    "vehicules"."localisation_id" IS 'Référence à la localisation';
ALTER TABLE
    "vehicules" ADD CONSTRAINT "vehicules_localisation_id_foreign" FOREIGN KEY("localisation_id") REFERENCES "localisations"("id");
ALTER TABLE
    "vehicules" ADD CONSTRAINT "vehicules_modele_id_foreign" FOREIGN KEY("modele_id") REFERENCES "modeles"("id");
ALTER TABLE
    "modeles" ADD CONSTRAINT "modeles_marque_id_foreign" FOREIGN KEY("marque_id") REFERENCES "marques"("id");
ALTER TABLE
    "vehicules" ADD CONSTRAINT "vehicules_etat_id_foreign" FOREIGN KEY("etat_id") REFERENCES "etats"("id");
ALTER TABLE
    "vehicules" ADD CONSTRAINT "vehicules_marque_id_foreign" FOREIGN KEY("marque_id") REFERENCES "marques"("id");