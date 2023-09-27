import _ from "underscore";
import Translate from "@google-cloud/translate";

import pg from "./db/pg-query";
import SQL from "./db/sql";
import { meteredPromise } from "./utils/metered";
import Utils from "./utils/common";

import Config from "./config";
import Conversation from "./conversation";
import User from "./user";
import { CommentType } from "./d";

// TODO should this be a number instead?
type Id = string;

type Row = {
  tid: Id;
  disagree_count: number;
  agree_count: number;
  vote: any;
  count: number;
  pass_count: number;
};

type UidToSocialInfo = {
  [key: string]: any;
};

const useTranslateApi: boolean = Config.shouldUseTranslationAPI;
const translateClient = useTranslateApi ? Translate() : null;

function getComment(zid: Id, tid: Id) {
  return (
    pg
      .queryP("select * from comments where zid = ($1) and tid = ($2);", [
        zid,
        tid,
      ])

      // Argument of type '(rows: Row[]) => Row' is not assignable to parameter of type '(value: unknown) => Row | PromiseLike<Row>'.
      // Types of parameters 'rows' and 'value' are incompatible.
      // Type 'unknown' is not assignable to type 'Row[]'.ts(2345)
      // @ts-ignore
      .then((rows: Row[]) => {
        return (rows && rows[0]) || null;
      })
  );
}

function getComments(o: CommentType) {
  let commentListPromise = o.moderation
    ? _getCommentsForModerationList(o)
    : _getCommentsList(o);
  let convPromise = Conversation.getConversationInfo(o.zid);
  let conv: { is_anon: any } | null = null;
  return Promise.all([convPromise, commentListPromise])
    .then(function ([conv, rows_]) {
      let rows = rows_ as Row[];
      let cols = [
        "txt",
        "tid",
        "created",
        "uid",
        "tweet_id",
        "quote_src_url",
        "anon",
        "is_seed",
        "is_meta",
        "lang",
        "pid",
      ];
      if (o.moderation) {
        cols.push("velocity");
        cols.push("zid");
        cols.push("mod");
        cols.push("active");
        cols.push("agree_count"); //  in  moderation queries, we join in the vote count
        cols.push("disagree_count"); //  in  moderation queries, we join in the vote count
        cols.push("pass_count"); //  in  moderation queries, we join in the vote count
        cols.push("count"); //  in  moderation queries, we join in the vote count
      }
      return rows.map(function (row) {
        let x = _.pick(row, cols);
        if (!_.isUndefined(x.count)) {
          x.count = Number(x.count);
        }
        return x;
      });
    })
    .then(function (comments) {
      let include_social = !conv?.is_anon && o.include_social;

      if (include_social) {
        // TODO: missing fields in Row type?
        // @ts-ignore
        let nonAnonComments = comments.filter(function (c: {
          anon: any;
          is_seed: any;
        }) {
          return !c.anon && !c.is_seed;
        });
        let uids = _.pluck(nonAnonComments, "uid");
        return User.getSocialInfoForUsers(uids, o.zid).then(function (
          socialInfos: any[]
        ) {
          let uidToSocialInfo: UidToSocialInfo = {};
          socialInfos.forEach(function (info: {
            verified: any;
            followers_count: any;
            uid: string | number;
          }) {
            // whitelist properties to send
            const infoToReturn = {
              // @ts-ignore
              x_profile_image_url: info.x_profile_image_url,
              // @ts-ignore
              x_name: info.x_name
            };

            uidToSocialInfo[info.uid] = infoToReturn;
          });
          // @ts-ignore
          return comments.map(function (c: {
            uid: string | number;
            anon: any;
            social: any;
          }) {
            let s = uidToSocialInfo[c.uid];
            if (s) {
              if (!c.anon) {
                // s should be undefined in this case, but adding a double-check here in case.
                c.social = s;
              }
            }
            return c;
          });
        });
      } else {
        return comments;
      }
    })
    .then(function (comments) {
      // @ts-ignore
      comments.forEach(function (c: { uid: any; anon: any }) {
        delete c.uid;
        delete c.anon;
      });
      return comments;
    });
}

function _getCommentsForModerationList(o: {
  include_voting_patterns: any;
  modIn: boolean;
  zid: any;
  strict_moderation: any;
  mod: any;
  mod_gt: any;
}) {
  let strictCheck = Promise.resolve(null);
  const include_voting_patterns = o.include_voting_patterns;

  if (o.modIn) {
    strictCheck = pg
      .queryP("select strict_moderation from conversations where zid = ($1);", [
        o.zid,
      ])
      .then(() => {
        return o.strict_moderation;
      });
  }

  return strictCheck.then((strict_moderation) => {
    let modClause = "";
    let params = [o.zid];
    if (!_.isUndefined(o.mod)) {
      modClause = " and comments.mod = ($2)";
      params.push(o.mod);
    } else if (!_.isUndefined(o.mod_gt)) {
      modClause = " and comments.mod > ($2)";
      params.push(o.mod_gt);
    } else if (!_.isUndefined(o.modIn)) {
      if (o.modIn === true) {
        if (strict_moderation) {
          modClause = " and comments.mod > 0";
        } else {
          modClause = " and comments.mod >= 0";
        }
      } else if (o.modIn === false) {
        if (strict_moderation) {
          modClause = " and comments.mod <= 0";
        } else {
          modClause = " and comments.mod < 0";
        }
      }
    }
    if (!include_voting_patterns) {
      return pg.queryP_metered_readOnly(
        "_getCommentsForModerationList",
        "select * from comments where comments.zid = ($1)" + modClause,
        params
      );
    }

    return pg
      .queryP_metered_readOnly(
        "_getCommentsForModerationList",
        "select * from (select tid, vote, count(*) from votes_latest_unique where zid = ($1) group by tid, vote) as foo full outer join comments on foo.tid = comments.tid where comments.zid = ($1)" +
          modClause,
        params
      )
      .then((rows_) => {
        let rows = rows_ as Row[];
        // each comment will have up to three rows. merge those into one with agree/disagree/pass counts.
        let adp: { [key: string]: Row } = {};
        for (let i = 0; i < rows.length; i++) {
          let row = rows[i];
          let o = (adp[row.tid] = adp[row.tid] || {
            agree_count: 0,
            disagree_count: 0,
            pass_count: 0,
          });
          if (row.vote === Utils.polisTypes.reactions.pull) {
            o.agree_count = Number(row.count);
          } else if (row.vote === Utils.polisTypes.reactions.push) {
            o.disagree_count = Number(row.count);
          } else if (row.vote === Utils.polisTypes.reactions.pass) {
            o.pass_count = Number(row.count);
          }
        }
        rows = _.uniq(rows, false, (row: { tid: Id }) => {
          return row.tid;
        });

        for (let i = 0; i < rows.length; i++) {
          let row = rows[i];
          row.agree_count = adp[row.tid].agree_count;
          row.disagree_count = adp[row.tid].disagree_count;
          row.pass_count = adp[row.tid].pass_count;
          row.count = row.agree_count + row.disagree_count + row.pass_count;
        }
        return rows;
      });
  });
}

function _getCommentsList(o: {
  zid: any;
  pid: any;
  tids: any;
  mod: any;
  not_voted_by_pid: any;
  submitted_by_pid: any;
  withoutTids: any;
  moderation: any;
  random: any;
  limit: any;
}) {
  return meteredPromise("_getCommentsList",
  (async () => {
    const conv = await Conversation.getConversationInfo(o.zid) as {
      strict_moderation: any;
      prioritize_seed: any;
    };

    let q = SQL.sql_comments
      .select(SQL.sql_comments.star())
      .where(SQL.sql_comments.zid.equals(o.zid));
    if (!_.isUndefined(o.pid)) {
      q = q.and(SQL.sql_comments.pid.equals(o.pid));
    }
    if (!_.isUndefined(o.tids)) {
      q = q.and(SQL.sql_comments.tid.in(o.tids));
    }
    if (!_.isUndefined(o.mod)) {
      q = q.and(SQL.sql_comments.mod.equals(o.mod));
    }
    if (!_.isUndefined(o.not_voted_by_pid)) {
      // 'SELECT * FROM comments WHERE zid = 12 AND tid NOT IN (SELECT tid FROM votes WHERE pid = 1);'
      // Don't return comments the user has already voted on.
      q = q.and(
        SQL.sql_comments.tid.notIn(
          SQL.sql_votes_latest_unique
            .subQuery()
            .select(SQL.sql_votes_latest_unique.tid)
            .where(SQL.sql_votes_latest_unique.zid.equals(o.zid))
            .and(SQL.sql_votes_latest_unique.pid.equals(o.not_voted_by_pid))
        )
      );
    } else if (!_.isUndefined(o.submitted_by_pid)) {
      q = q.and(SQL.sql_comments.pid.equals(o.submitted_by_pid));
    }

    if (!_.isUndefined(o.withoutTids)) {
      q = q.and(SQL.sql_comments.tid.notIn(o.withoutTids));
    }
    if (!o.moderation) {
      q = q.and(SQL.sql_comments.active.equals(true));
      if (conv.strict_moderation) {
        q = q.and(SQL.sql_comments.mod.equals(Utils.polisTypes.mod.ok));
      } else {
        q = q.and(SQL.sql_comments.mod.notEquals(Utils.polisTypes.mod.ban));
      }
    }

    q = q.and(SQL.sql_comments.velocity.gt(0)); // filter muted comments

    if (!_.isUndefined(o.random)) {
      if (conv.prioritize_seed) {
        q = q.order("is_seed desc, random()");
      } else {
        q = q.order("random()");
      }
    } else {
      q = q.order(SQL.sql_comments.created);
    }
    if (!_.isUndefined(o.limit)) {
      q = q.limit(o.limit);
    } else {
      q = q.limit(999); // TODO paginate
    }

    return await pg.queryP(q.toString(), []) as Row[];
  })()
  );
}

function getNumberOfCommentsRemaining(zid: any, pid: any) {
  return pg.queryP(
    "with " +
      "v as (select * from votes_latest_unique where zid = ($1) and pid = ($2)), " +
      "c as (select * from get_visible_comments($1)), " +
      "remaining as (select count(*) as remaining from c left join v on c.tid = v.tid where v.vote is null), " +
      "total as (select count(*) as total from c) " +
      "select cast(remaining.remaining as integer), cast(total.total as integer), cast(($2) as integer) as pid from remaining, total;",
    [zid, pid]
  );
}

function translateAndStoreComment(zid: any, tid: any, txt: any, lang: any) {
  if (useTranslateApi) {
    return translateString(txt, lang).then((results: any[]) => {
      const translation = results[0];
      const src = -1; // Google Translate of txt with no added context
      return (
        pg
          .queryP(
            "insert into comment_translations (zid, tid, txt, lang, src) values ($1, $2, $3, $4, $5) returning *;",
            [zid, tid, translation, lang, src]
          )
          //       Argument of type '(rows: Row[]) => Row' is not assignable to parameter of type '(value: unknown) => Row | PromiseLike<Row>'.
          // Types of parameters 'rows' and 'value' are incompatible.
          //   Type 'unknown' is not assignable to type 'Row[]'.ts(2345)
          // @ts-ignore
          .then((rows: Row[]) => {
            return rows[0];
          })
      );
    });
  }
  return Promise.resolve(null);
}

function translateString(txt: any, target_lang: any) {
  if (useTranslateApi) {
    return translateClient.translate(txt, target_lang);
  }
  return Promise.resolve(null);
}

function detectLanguage(txt: any) {
  if (useTranslateApi) {
    return translateClient.detect(txt);
  }
  return Promise.resolve([
    {
      confidence: null,
      language: null,
    },
  ]);
}

export {
  getComment,
  getComments,
  _getCommentsForModerationList,
  getNumberOfCommentsRemaining,
  translateAndStoreComment,
  detectLanguage,
};

export default {
  getComment,
  getComments,
  _getCommentsForModerationList,
  getNumberOfCommentsRemaining,
  translateAndStoreComment,
  detectLanguage,
};
