const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbpath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;
const initializedbandserver = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializedbandserver();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};
//API1
app.get("/players/", async (request, response) => {
  const query = `select player_id as playerId,player_name as playerName from player_details;`;
  const res = await db.all(query);
  response.send(res);
});
//API2
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const query = `select player_id as playerId,player_name as playerName from player_details where player_id=${playerId};`;
  const res = await db.get(query);
  response.send(res);
});
//API3
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const query = `update player_details 
    set player_name='${playerName}' where player_id=${playerId};`;
  const res = await db.run(query);
  response.send("Player Details Updated");
});
//API4
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const query = `select match_id as matchId,match,year from match_details where match_id=${matchId};`;
  const res = await db.get(query);
  response.send(res);
});
//API5
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const query = `select match_details.match_id as matchId,match,year
    from match_details inner join player_match_score on
    match_details.match_id=player_match_score.match_id
    where player_id=${playerId}; `;
  const res = await db.all(query);
  response.send(res);
});
//API6
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const query = `select player_details.player_id as playerId,player_details.player_name as playerName from player_details inner join player_match_score on
    player_details.player_id=player_match_score.player_id
    where match_id=${matchId}; `;
  const res = await db.all(query);
  response.send(res);
});
//API7
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const query = `select player_details.player_id as playerId,player_name as playerName,sum(score) as totalScore,sum(fours) as totalFours,sum(sixes) as totalSixes 
    from player_details inner join player_match_score on 
    player_details.player_id=player_match_score.player_id
    where player_details.player_id=${playerId}
    ;`;
  const res = await db.get(query);
  response.send(res);
});
module.exports = app;
