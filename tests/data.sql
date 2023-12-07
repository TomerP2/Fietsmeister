-- 3 users. 
-- 2 points:
--  - point 1 created by user 1
--  - point 2 created by user 2
-- markings:
--  - point 1:
--     - marked as TRUE by user 1
--     - marked as TRUE by user 2
--  - point 2:
--     - marked as FALSE by user 2
--     - marked as FALSE by user 3

INSERT INTO users (username, password)
VALUES
  ('test', 'pbkdf2:sha256:50000$TCI4GzcX$0de171a4f4dac32e3364c7ddc7c14f3e2fa61f2d17574483f7ffbb431b4acb2f'),
  ('other', 'pbkdf2:sha256:50000$kJPKsz6N$d2d4784f1b030a9761f5ccaeeaca413f27f2ecb76d6168407af962ddce849f79'),
  ('other2', 'pbkdf2:sha256:50000$kJPKsz6N$d2d4784f1b030a9761f5ccaeeaca413f27f2ecb76d6168407af962ddce849f79');

INSERT INTO blokkages (geom, created_by)
VALUES 
  (ST_SetSRID(ST_MakePoint(-71.1043443253471, 42.3150676015829),4326), 1),
  (ST_SetSRID(ST_MakePoint(-71.104344325343, 42.315067601585),4326), 2);

INSERT INTO marked_true (blokkage_id, created_by)
VALUES
  (1, 1),
  (1, 2);

INSERT INTO marked_false (blokkage_id, created_by)
VALUES
  (2, 2),
  (2, 3);