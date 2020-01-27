import { Request, Response } from "express";
import winston from "winston";
import superagent from "superagent";
import { load } from "cheerio";
import _ from "lodash";
import { validateCareerSearch } from "./validators";
import { RATING_SELECTORS } from "./utils";
import db from "../db";

type PlayerData = {
  tank: null | string;
  dps: null | string;
  heal: null | string;
  name: string;
  avatarUrl: string;
};

function extractPlayerData($: CheerioStatic, bTag: string): PlayerData {
  const {
    RATING_ROLE_CONTAINER,
    FIRST_RATING_ROLE,
    SECOND_RATING_ROLE,
    THIRD_RATING_ROLE,
    PLAYER_AVATAR
  } = RATING_SELECTORS;
  // const roleExtractor = /\((.*?)\)/;
  const result = {
    tank: null,
    dps: null,
    heal: null,
    name: bTag,
    avatarUrl: $(PLAYER_AVATAR).attr("src")
  };
  const availableRoles = $(RATING_ROLE_CONTAINER).children().length;
  const tooltips: string[] = [];
  const ratings: string[] = [];
  if (availableRoles >= 1) {
    tooltips.push($(FIRST_RATING_ROLE).attr("data-ow-tooltip-text"));
    ratings.push(
      $(FIRST_RATING_ROLE)
        .next()
        .text()
    );
  }
  if (availableRoles >= 2) {
    tooltips.push($(SECOND_RATING_ROLE).attr("data-ow-tooltip-text"));
    ratings.push(
      $(SECOND_RATING_ROLE)
        .next()
        .text()
    );
  }
  if (availableRoles === 3) {
    tooltips.push($(THIRD_RATING_ROLE).attr("data-ow-tooltip-text"));
    ratings.push(
      $(THIRD_RATING_ROLE)
        .next()
        .text()
    );
  }
  tooltips.forEach((el, idx) => {
    if (el.includes("танк")) {
      result.tank = ratings[idx];
    } else if (el.includes("урон")) {
      result.dps = ratings[idx];
    } else if (el.includes("поддержка")) {
      result.heal = ratings[idx];
    }
  });
  return result;
}

type ProfileToUpdate = {
  id: string;
  btag: string;
};
async function updateProfiles(profiles: ProfileToUpdate[]) {
  try {
    if (profiles.length >= 1) {
      winston.info("Updating old profiles");
      for await (const profile of profiles) {
        const careerPage = await superagent.get(
          `https://playoverwatch.com/ru-ru/career/pc/${profile.btag}`
        );
        const $ = load(careerPage.text);
        const playerProfile = extractPlayerData($, profile.btag);
        await db.query(
          `UPDATE 
          career_profile
        SET 
          ow_avatar = $1,
          rating_tank = $2,
          rating_dps = $3,
          rating_heal = $4
        WHERE
          career_id = $5`,
          [
            playerProfile.avatarUrl,
            playerProfile.tank,
            playerProfile.dps,
            playerProfile.heal,
            profile.id
          ]
        );
        winston.info("profile updated");
      }
    }
  } catch (error) {
    winston.error(error.message, [error]);
  }
}

export const checkPlayer = async (req: Request, res: Response) => {
  try {
    const { error, value } = validateCareerSearch(req.body);
    if (error)
      return res.status(400).send({
        status: "ERROR",
        message: error.message
      });
    const { rows } = await db.query(
      `SELECT career_id
      FROM career_profile
      WHERE name = $1`,
      [value.btag]
    );
    if (rows[0])
      return res.send({
        message: "OK",
        playerExists: true
      });
    const careerPage = await superagent.get(
      `https://playoverwatch.com/ru-ru/career/pc/${value.btag}`
    );
    const $ = load(careerPage.text);
    const playerExists = !$("body").hasClass("ErrorPage");
    res.send({
      message: "OK",
      playerExists
    });
  } catch (error) {
    winston.error(error.message, [error]);
    res.sendStatus(500);
  }
};

export const addPlayer = async (req: Request, res: Response) => {
  try {
    const { error, value } = validateCareerSearch(req.body);
    if (error)
      return res.status(400).send({
        status: "ERROR",
        message: error.message
      });
    const { rows: playerProfile } = await db.query(
      `SELECT updated_at, career_id
      FROM career_profile
      WHERE name = $1`,
      [value.btag]
    );

    if (!playerProfile[0]) {
      const careerPage = await superagent.get(
        `https://playoverwatch.com/ru-ru/career/pc/${value.btag}`
      );
      const $ = load(careerPage.text);
      const playerExists = !$("body").hasClass("ErrorPage");
      if (!playerExists)
        return res.status(400).send({
          status: "ERROR",
          message: "Player not found"
        });
      const playerData = extractPlayerData($, req.body.btag);
      const client = await db.getClient();
      try {
        await client.query("BEGIN");
        const { rows: careerRows } = await client.query(
          `INSERT INTO career_profile 
          (name, ow_avatar, rating_tank, rating_dps, rating_heal)
          VALUES 
          ($1, $2, $3, $4, $5)
          RETURNING career_id`,
          [
            playerData.name,
            playerData.avatarUrl,
            playerData.tank,
            playerData.dps,
            playerData.heal
          ]
        );
        await client.query(
          `INSERT INTO user_favorites
          (career_id, user_id)
          VALUES
          ($1, $2)`,
          [careerRows[0].career_id, req.user.toString()]
        );
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        winston.error(err.message, [err]);
        res.sendStatus(500);
      } finally {
        client.release();
      }
    } else {
      const { rows: favoritesRows } = await db.query(
        `SELECT *
        FROM user_favorites
        WHERE career_id = $1
        AND user_id = $2`,
        [playerProfile[0].career_id, req.user.toString()]
      );
      if (!favoritesRows[0]) {
        await db.query(
          `INSERT INTO user_favorites
          (career_id, user_id)
          VALUES
          ($1, $2)`,
          [playerProfile[0].career_id, req.user.toString()]
        );
      } else {
        return res.send({
          status: "ERROR",
          message: "Player already in user favorites"
        });
      }
    }
    res.send({
      message: "OK"
    });
  } catch (error) {
    winston.error(error.message, [error]);
    res.sendStatus(500);
  }
};

export const getPlayers = async (req: Request, res: Response) => {
  try {
    const { rows } = await db.query(
      `SELECT 
        user_favorites.career_id,
        career_profile.name,
        career_profile.ow_avatar,
        career_profile.rating_tank,
        career_profile.rating_dps,
        career_profile.rating_heal,
        career_profile.updated_at
      FROM user_favorites
      INNER JOIN career_profile 
      ON career_profile.career_id = user_favorites.career_id
      WHERE user_favorites.user_id = $1`,
      [req.user.toString()]
    );
    const profilesToUpdate: ProfileToUpdate[] = [];
    const currentTime = Date.now();
    rows.forEach(profile => {
      // 1 Hour = 3,600,000 Milliseconds
      const needsToUpdate =
        currentTime - profile.updated_at.valueOf() >= 4 * 3600000;
      if (needsToUpdate)
        profilesToUpdate.push({
          id: profile.career_id.toString(),
          btag: profile.name
        });
    });
    updateProfiles(profilesToUpdate);
    res.send({
      message: "OK",
      profiles: rows.map(el =>
        _.pick(el, [
          "name",
          "ow_avatar",
          "rating_tank",
          "rating_dps",
          "rating_heal"
        ])
      )
    });
  } catch (error) {
    winston.error(error.message);
    res.sendStatus(500);
  }
};
