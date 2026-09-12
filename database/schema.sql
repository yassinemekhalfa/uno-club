CREATE TABLE IF NOT EXISTS users (
 id uuid PRIMARY KEY, email text UNIQUE NOT NULL, username varchar(24) UNIQUE NOT NULL,
 password_hash text NOT NULL, avatar text NOT NULL DEFAULT '😎', background text NOT NULL DEFAULT 'classic',
 xp integer NOT NULL DEFAULT 0, wins integer NOT NULL DEFAULT 0, games_played integer NOT NULL DEFAULT 0,
 streak integer NOT NULL DEFAULT 0, best_streak integer NOT NULL DEFAULT 0, banned boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sessions (token_hash text PRIMARY KEY, user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS password_resets (token_hash text PRIMARY KEY, user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS games (id uuid PRIMARY KEY, mode text NOT NULL, started_at timestamptz NOT NULL, finished_at timestamptz NOT NULL DEFAULT now(), ranked boolean NOT NULL);
CREATE TABLE IF NOT EXISTS participants (game_id uuid REFERENCES games(id) ON DELETE CASCADE, user_id uuid REFERENCES users(id), result text NOT NULL, score integer NOT NULL, PRIMARY KEY(game_id,user_id));
CREATE TABLE IF NOT EXISTS friendships (requester_id uuid REFERENCES users(id) ON DELETE CASCADE, receiver_id uuid REFERENCES users(id) ON DELETE CASCADE, status text NOT NULL DEFAULT 'pending', PRIMARY KEY(requester_id,receiver_id), CHECK(requester_id<>receiver_id));
CREATE TABLE IF NOT EXISTS achievements (id text PRIMARY KEY, name text NOT NULL, description text NOT NULL);
CREATE TABLE IF NOT EXISTS user_achievements (user_id uuid REFERENCES users(id) ON DELETE CASCADE, achievement_id text REFERENCES achievements(id), unlocked_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(user_id,achievement_id));
CREATE INDEX IF NOT EXISTS users_ranking ON users(xp DESC);
CREATE INDEX IF NOT EXISTS participant_history ON participants(user_id);
INSERT INTO achievements VALUES ('first-win','First of many','Win your first game'),('ten-wins','On a roll','Win 10 games'),('hundred-games','Table regular','Play 100 games'),('five-streak','Unstoppable','Win 5 games in a row') ON CONFLICT DO NOTHING;
