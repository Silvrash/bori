CREATE KEYSPACE IF NOT EXISTS bori WITH replication = {'class':'SimpleStrategy', 'replication_factor' : 1};

USE bori;

CREATE TABLE IF NOT EXISTS organization (
    id text PRIMARY KEY,
    name text,
    date_added timestamp,
    hierarchypath text
);
