import path from "path";
import { promises as fs } from "fs";
import CyrillicToTranslit from "cyrillic-to-translit-js";

export const RATING_SELECTORS = {
  RATING_ROLE_CONTAINER:
    "#overview-section > div > div.u-max-width-container.row.content-box.gutter-18 > div > div > div.masthead-player > div > div.competitive-rank",
  FIRST_RATING_ROLE:
    "#overview-section > div > div.u-max-width-container.row.content-box.gutter-18 > div > div > div.masthead-player > div > div.competitive-rank > div:nth-child(1) > div:nth-child(2) > div.competitive-rank-tier.competitive-rank-tier-tooltip",
  SECOND_RATING_ROLE:
    "#overview-section > div > div.u-max-width-container.row.content-box.gutter-18 > div > div > div.masthead-player > div > div.competitive-rank > div:nth-child(2) > div:nth-child(2) > div.competitive-rank-tier.competitive-rank-tier-tooltip",
  THIRD_RATING_ROLE:
    "#overview-section > div > div.u-max-width-container.row.content-box.gutter-18 > div > div > div.masthead-player > div > div.competitive-rank > div:nth-child(3) > div:nth-child(2) > div.competitive-rank-tier.competitive-rank-tier-tooltip",
  PLAYER_NAME:
    "#overview-section > div > div.u-max-width-container.row.content-box.gutter-18 > div > div > div.masthead-player > h1",
  PLAYER_AVATAR:
    "#overview-section > div > div.u-max-width-container.row.content-box.gutter-18 > div > div > div.masthead-player > img"
};

type PlayerData = {
  tank: null | string;
  dps: null | string;
  heal: null | string;
  name: string;
  avatarUrl: string;
};

export function extractPlayerData($: CheerioStatic, bTag: string): PlayerData {
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

export async function renameAvatar(
  firstName: string,
  lastName: string,
  file: Express.Multer.File
) {
  const ruRegex = /[А-Яа-я]/;
  let first = firstName;
  let last = lastName;
  if (ruRegex.test(firstName) || ruRegex.test(lastName)) {
    const toTranslit = new CyrillicToTranslit({ preset: "ru" });
    first = toTranslit.transform(firstName);
    last = toTranslit.transform(lastName);
  }
  const newFileName = `${first}-${last}-${Date.now().toString()}${path.extname(
    file.filename
  )}`;
  const newFilePath = path.join(file.destination, newFileName);
  await fs.rename(file.path, newFilePath);
  return {
    newFileName,
    newFilePath
  };
}
