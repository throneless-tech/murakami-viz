import Router from '@koa/router';
import moment from 'moment';
import Joi from '@hapi/joi';
import { BadRequestError } from '../../common/errors.js';
import { validateCreation, validateUpdate } from '../../common/schemas/note.js';
import { getLogger } from '../log.js';

const log = getLogger('backend:controllers:note');

const query_schema = Joi.object({
  start: Joi.number()
    .integer()
    .greater(-1),
  end: Joi.number()
    .integer()
    .positive(),
  asc: Joi.boolean(),
  sort_by: Joi.string(),
  from: Joi.string(),
  to: Joi.string(),
  author: Joi.number().integer(),
  library: Joi.number().integer(),
});

async function validate_query(query) {
  try {
    const value = await query_schema.validateAsync(query);
    return value;
  } catch (err) {
    throw new BadRequestError('Unable to validate query: ', err);
  }
}

// eslint-disable-next-line no-unused-vars
export default function controller(notes, thisUser) {
  const router = new Router();

  router.post('/notes', thisUser.can('view this library'), async ctx => {
    log.debug('Adding new note.');
    let note, lid;

    if (ctx.params.lid) {
      lid = ctx.params.lid;
    }

    try {
      const data = await validateCreation(ctx.request.body.data);
      note = await notes.create(data, lid);
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse note schema: ${err}`);
    }

    ctx.response.body = { statusCode: 201, status: 'created', data: note };
    ctx.response.status = 201;
  });

  router.get('/notes', thisUser.can('view this library'), async ctx => {
    log.debug(`Retrieving notes.`);
    let res, library;
    try {
      const query = await validate_query(ctx.query);
      let from, to;

      if (query.from) {
        const timestamp = moment(query.from);
        if (timestamp.isValid()) {
          log.error('HTTP 400 Error: Invalid timestamp value.');
          ctx.throw(400, 'Invalid timestamp value.');
        }
        from = timestamp.toISOString();
      }
      if (query.to) {
        const timestamp = moment(query.to);
        if (timestamp.isValid()) {
          log.error('HTTP 400 Error: Invalid timestamp value.');
          ctx.throw(400, 'Invalid timestamp value.');
        }
        to = timestamp.toISOString();
      }

      if (ctx.params.lid) {
        library = ctx.params.lid;
      } else {
        library = query.library;
      }

      res = await notes.find({
        start: query.start,
        end: query.end,
        asc: query.asc,
        sort_by: query.sort_by,
        from: from,
        to: to,
        author: query.author,
        library: library,
      });
      ctx.response.body = {
        statusCode: 200,
        status: 'ok',
        data: res,
      };
      ctx.response.status = 200;
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse query: ${err}`);
    }
  });

  router.get('/notes/:id', thisUser.can('view this library'), async ctx => {
    log.debug(`Retrieving note ${ctx.params.id}.`);
    let note, lid;

    if (ctx.params.lid) {
      lid = ctx.params.lid;
    }

    try {
      note = await notes.findById(ctx.params.id, lid);
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse query: ${err}`);
    }

    if (note.length) {
      ctx.response.body = { statusCode: 200, status: 'ok', data: note };
      ctx.response.status = 200;
    } else {
      log.error(
        `HTTP 404 Error: That note with ID ${ctx.params.id} does not exist.`,
      );
      ctx.throw(404, `That note with ID ${ctx.params.id} does not exist.`);
    }
  });

  router.put('/notes/:id', thisUser.can('access admin pages'), async ctx => {
    log.debug(`Updating note ${ctx.params.id}.`);
    let created, updated;

    try {
      if (ctx.params.lid) {
        await notes.addToLibrary(ctx.params.lid, ctx.params.id);
        updated = true;
      } else {
        const [data] = await validateUpdate(ctx.request.body.data);
        ({ exists: updated = false, ...created } = await notes.update(
          ctx.params.id,
          data,
        ));
      }
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse query: ${err}`);
    }

    if (updated) {
      ctx.response.status = 204;
    } else {
      ctx.response.body = {
        statusCode: 201,
        status: 'created',
        data: [created],
      };
      ctx.response.status = 201;
    }
  });

  router.delete('/notes/:id', thisUser.can('edit this library'), async ctx => {
    log.debug(`Deleting note ${ctx.params.id}.`);
    let note = 0;

    try {
      if (ctx.params.lid) {
        note = await notes.removeFromLibrary(ctx.params.lid, ctx.params.id);
      } else {
        note = await notes.delete(ctx.params.id);
      }
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse query: ${err}`);
    }

    if (note > 0) {
      ctx.response.status = 204;
    } else {
      log.error(
        `HTTP 404 Error: That note with ID ${ctx.params.id} does not exist.`,
      );
      ctx.throw(404, `That note with ID ${ctx.params.id} does not exist.`);
    }
  });

  return router;
}
