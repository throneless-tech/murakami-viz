import Router from '@koa/router';
import moment from 'moment';
import Joi from '@hapi/joi';
import { BadRequestError } from '../../common/errors.js';
import {
  validateCreation,
  validateUpdate,
} from '../../common/schemas/library.js';
import { getLogger } from '../log.js';

const log = getLogger('backend:controllers:library');

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
  of_user: Joi.number()
    .integer()
    .positive(),
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
export default function controller(libraries, thisUser) {
  const router = new Router();

  router.get(
    '/libraries/:id/ip/:address',
    thisUser.can('edit this library'),
    async ctx => {
      log.debug(
        `Retrieving IP ${ctx.params.address} for library ${ctx.params.id}.`,
      );
      let ip;

      try {
        ip = await libraries.findIp(ctx.params.id, ctx.params.address);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (ip.length) {
        ctx.response.status = 204;
      } else {
        log.error(
          `HTTP 404 Error: Library with ID ${ctx.params.id} does not have IP ${
            ctx.params.address
          } or does not exist.`,
        );
        ctx.throw(
          404,
          `Library with ID ${ctx.params.id} does not have IP ${
            ctx.params.address
          } or does not exist.`,
        );
      }
    },
  );

  router.get(
    '/libraries/:id/ip',
    thisUser.can('view this library'),
    async ctx => {
      log.debug(`Retrieving IPs for library ${ctx.params.id}.`);
      let ip;

      try {
        ip = await libraries.findIp(ctx.params.id);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (ip.length >= 0) {
        ctx.response.body = {
          statusCode: 200,
          status: 'ok',
          data: ip,
        };
        ctx.response.status = 200;
      } else {
        log.error(
          `HTTP 404 Error: Library with ID ${ctx.params.id} does not have IP ${
            ctx.params.address
          } or does not exist.`,
        );
        ctx.throw(
          404,
          `Library with ID ${ctx.params.id} does not have IP ${
            ctx.params.address
          } or does not exist.`,
        );
      }
    },
  );

  router.post(
    '/libraries/:id/ip/:address',
    thisUser.can('edit this library'),
    async ctx => {
      log.debug(`Adding IP ${ctx.params.address} to library ${ctx.params.id}.`);
      let ip;

      try {
        ip = await libraries.createIp(ctx.params.id, ctx.params.address);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse library schema: ${err}`);
      }

      ctx.response.body = { statusCode: 201, status: 'created', data: ip };
      ctx.response.status = 201;
    },
  );

  router.delete(
    '/libraries/:id/ip/:address',
    thisUser.can('edit this library'),
    async ctx => {
      log.debug(
        `Deleting IP address ${ctx.params.address} from library ${
          ctx.params.id
        }.`,
      );
      let address;

      try {
        if (ctx.params.id) {
          address = await libraries.deleteIp(ctx.params.id, ctx.params.address);
        }
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (address) {
        ctx.response.status = 204;
      } else {
        log.error(
          `HTTP 404 Error: The IP address ${
            ctx.params.address
          } does not exist.`,
        );
        ctx.throw(404, `The IP address ${ctx.params.address} does not exist.`);
      }
    },
  );

  router.post('/libraries', thisUser.can('access admin pages'), async ctx => {
    log.debug('Adding new library.');
    let library;

    try {
      const data = await validateCreation(ctx.request.body.data);
      library = await libraries.create(data);

      // workaround for sqlite
      if (Number.isInteger(library[0])) {
        library = await libraries.findById(library[0]);
      }
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse library schema: ${err}`);
    }

    ctx.response.body = { statusCode: 201, status: 'created', data: library };
    ctx.response.status = 201;
  });

  router.get('/libraries', thisUser.can('access private pages'), async ctx => {
    log.debug(`Retrieving libraries.`);
    let res;
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
      res = await libraries.find({
        start: query.start,
        end: query.end,
        asc: query.asc,
        sort_by: query.sort_by,
        from: from,
        to: to,
        of_user: query.of_user,
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

  router.get(
    '/libraries/:id',
    thisUser.can('access private pages'),
    async ctx => {
      log.debug(`Retrieving library ${ctx.params.id}.`);
      let library;

      try {
        library = await libraries.findById(ctx.params.id);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (library.length) {
        ctx.response.body = { statusCode: 200, status: 'ok', data: library };
        ctx.response.status = 200;
      } else {
        log.error(
          `HTTP 404 Error: That library with ID ${
            ctx.params.id
          } does not exist.`,
        );
        ctx.throw(404, `That library with ID ${ctx.params.id} does not exist.`);
      }
    },
  );

  router.put(
    '/libraries/:id',
    thisUser.can('access admin pages'),
    async ctx => {
      log.debug(`Updating libraries ${ctx.params.id}.`);
      let created, updated;

      try {
        const [data] = await validateUpdate(ctx.request.body.data);
        ({ exists: updated = false, ...created } = await libraries.update(
          ctx.params.id,
          data,
        ));
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
    },
  );

  router.delete(
    '/libraries/:id',
    thisUser.can('access admin pages'),
    async ctx => {
      log.debug(`Deleting library ${ctx.params.id}.`);
      let library;

      try {
        library = await libraries.delete(ctx.params.id);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (library > 0) {
        ctx.response.status = 204;
      } else {
        log.error(
          `HTTP 404 Error: That library with ID ${
            ctx.params.id
          } does not exist.`,
        );
        ctx.throw(404, `That library with ID ${ctx.params.id} does not exist.`);
      }
    },
  );

  return router;
}
