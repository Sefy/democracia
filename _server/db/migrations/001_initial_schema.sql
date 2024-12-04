CREATE TYPE user_role AS ENUM ('ADMIN', 'MODERATOR', 'USER');
CREATE TYPE vote_type AS ENUM ('UP', 'DOWN');

CREATE TABLE users
(
  id          SERIAL PRIMARY KEY,
  email       VARCHAR(255) UNIQUE NOT NULL,
  username    VARCHAR(255) UNIQUE NOT NULL,

--   password    VARCHAR(255), -- Not needed for now ;x
  "googleId"  INTEGER,
  avatar      VARCHAR(255),

  role        user_role                DEFAULT 'USER',

  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rooms
(
  id              SERIAL PRIMARY KEY,
  title           VARCHAR(255) NOT NULL,
  description     TEXT,

  -- stored computed values
  "messagesCount" INTEGER,
  "trendingScore" INTEGER,

  "createdBy"     INTEGER REFERENCES users (id),
  "createdAt"     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tags
(
  id    SERIAL PRIMARY KEY,
  name  VARCHAR,
  color VARCHAR,
  icon  VARCHAR
);

CREATE TABLE room_tags
(
  id_room INTEGER REFERENCES rooms (id) ON DELETE CASCADE,
  id_tag  INTEGER REFERENCES tags (id) ON DELETE CASCADE,
  PRIMARY KEY (id_room, id_tag)
);

CREATE TABLE messages
(
  id         SERIAL PRIMARY KEY,
  room_id    INTEGER REFERENCES rooms (id) ON DELETE CASCADE,
  user_id    INTEGER REFERENCES users (id),
  content    TEXT NOT NULL,
--   parent_id INTEGER REFERENCES messages(id), -- pas pour l'instant, mais faudrait ouais ...
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE message_votes
(
  message_id INTEGER REFERENCES messages (id) ON DELETE CASCADE,
  user_id    INTEGER REFERENCES users (id),
  vote_type  vote_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (message_id, user_id)
);

CREATE INDEX idx_messages_room_id ON messages (room_id);
CREATE INDEX idx_messages_user_id ON messages (user_id);
-- CREATE INDEX idx_messages_parent_id ON messages(parent_id);
CREATE INDEX idx_votes_message_id ON message_votes (message_id);
-- CREATE INDEX idx_reactions_message_id ON reactions(message_id);
