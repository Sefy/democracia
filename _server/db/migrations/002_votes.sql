-- Votes tables
CREATE TABLE votes
(
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(100) NOT NULL,
  description TEXT         NOT NULL,
  created_by  INTEGER      REFERENCES users (id) ON DELETE SET NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at  TIMESTAMP WITH TIME ZONE
);

CREATE TABLE vote_options
(
  id         SERIAL PRIMARY KEY,
  vote_id    INTEGER REFERENCES votes (id) ON DELETE CASCADE,
  text       VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vote_choices
(
  vote_option_id INTEGER REFERENCES vote_options (id) ON DELETE CASCADE,
  user_id        INTEGER REFERENCES users (id) ON DELETE CASCADE,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (vote_option_id, user_id)
);

-- Indexes
CREATE INDEX idx_votes_created_by ON votes (created_by);
CREATE INDEX idx_vote_options_vote_id ON vote_options (vote_id);
CREATE INDEX idx_vote_choices_user_id ON vote_choices (user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS
$$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_votes_updated_at
  BEFORE UPDATE
  ON votes
  FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
