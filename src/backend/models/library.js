import knex from 'knex';
import { validate } from '../../common/schemas/library.js';
import { UnprocessableError } from '../../common/errors.js';
import { getLogger } from '../log.js';

const log = getLogger('backend:model:library');

export default class LibraryManager {
  constructor(db) {
    this._db = db;
  }

  async createIp(lid, ips) {
    let value;
    if (Array.isArray(ips)) {
      value = ips.map(ip => ({ lid: lid, ip: ip }));
    } else {
      value = { lid: lid, ip: ips };
    }
    return this._db
      .table('library_ips')
      .insert(value)
      .returning('*');
  }

  async findIp(lid, ip) {
    const rows = await this._db
      .table('library_ips')
      .select('*')
      .modify(queryBuilder => {
        if (lid) {
          queryBuilder.where({ lid: parseInt(lid) });
          if (ip) {
            queryBuilder.andWhere({ ip: ip });
          }
        } else {
          if (ip) {
            queryBuilder.where({ ip: ip });
          }
        }
      });

    return rows || [];
  }

  async findAllIps() {
    const rows = await this._db.table('library_ips').select('ip');

    return rows || [];
  }

  async deleteIp(lid, ip) {
    if (!(lid || ip)) {
      throw new UnprocessableError('Need to specify either library id or IP.');
    }
    return this._db
      .table('library_ips')
      .del()
      .modify(queryBuilder => {
        if (lid) {
          queryBuilder.where({ lid: parseInt(lid) });
          if (ip) {
            queryBuilder.andWhere({ ip: ip });
          }
        } else {
          if (ip) {
            queryBuilder.where({ ip: ip });
          }
        }
      })
      .returning('*');
  }

  async create(library) {
    try {
      await validate(library);
    } catch (err) {
      throw new UnprocessableError('Failed to create library: ', err);
    }
    return this._db
      .table('libraries')
      .insert(library)
      .returning('*');
  }

  async update(id, library) {
    try {
      await validate(library);
    } catch (err) {
      throw new UnprocessableError('Failed to update library: ', err);
    }
    return this._db
      .table('libraries')
      .update(library)
      .where({ id: parseInt(id) })
      .update(
        {
          physical_address: library.physical_address,
          shipping_address: library.shipping_address,
          timezone: library.timezone,
          coordinates: library.coordinates,
          primary_contact_name: library.primary_contact_name,
          primary_contact_email: library.primary_contact_email,
          it_contact_name: library.it_contact_name,
          it_contact_email: library.it_contact_email,
          opening_hours: library.opening_hours,
          network_name: library.network_name,
          isp: library.isp,
          contracted_speed_upload: library.contracted_speed_upload,
          contracted_speed_download: library.contracted_speed_download,
          bandwith_cap_upload: library.bandwith_cap_upload,
          bandwith_cap_download: library.bandwith_cap_download,
        },
        [
          'id',
          'physical_address',
          'shipping_address',
          'timezone',
          'coordinates',
          'primary_contact_name',
          'primary_contact_email',
          'it_contact_name',
          'it_contact_email',
          'opening_hours',
          'network_name',
          'isp',
          'contracted_speed_upload',
          'contracted_speed_download',
          'bandwith_cap_upload',
          'bandwith_cap_download',
        ],
      )
      .returning('*');
  }

  async delete(id) {
    return this._db
      .table('libraries')
      .del()
      .where({ id: parseInt(id) })
      .returning('*');
  }

  async find({
    start: start = 0,
    end: end,
    asc: asc = true,
    sort_by: sort_by = 'id',
    from: from,
    to: to,
    of_user: of_user,
  }) {
    const rows = await this._db
      .select({
        id: 'libraries.id',
        name: 'libraries.name',
        physical_address: 'libraries.physical_address',
        shipping_address: 'libraries.shipping_address',
        timezone: 'libraries.timezone',
        coordinates: 'libraries.coordinates',
        primary_contact_name: 'libraries.primary_contact_name',
        primary_contact_email: 'libraries.primary_contact_email',
        it_contact_name: 'libraries.it_contact_name',
        it_contact_email: 'libraries.it_contact_email',
        opening_hours: 'libraries.opening_hours',
        network_name: 'libraries.network_name',
        isp: 'libraries.isp',
        contracted_speed_upload: 'libraries.contracted_speed_upload',
        contracted_speed_download: 'libraries.contracted_speed_download',
        bandwidth_cap_upload: 'libraries.bandwidth_cap_upload',
        bandwidth_cap_download: 'libraries.bandwidth_cap_download',
      })
      .from('libraries')
      .modify(queryBuilder => {
        if (from) {
          queryBuilder.where('created_at', '>', from);
        }

        if (to) {
          queryBuilder.where('created_at', '<', to);
        }

        if (asc) {
          queryBuilder.orderBy(sort_by, 'asc');
        } else {
          queryBuilder.orderBy(sort_by, 'desc');
        }

        if (start > 0) {
          queryBuilder.offset(start);
        }

        if (end && end > start) {
          queryBuilder.limit(end - start);
        }

        if (of_user) {
          queryBuilder.join('library_users', {
            'libraries.id': 'library_users.lid',
            'library_users.uid': knex.raw('?', [of_user]),
          });
        }
      });

    return rows || [];
  }

  async findById(id) {
    return this._db
      .table('libraries')
      .select('*')
      .where({ id: parseInt(id) });
  }

  async findAll() {
    return this._db.table('libraries').select('*');
  }

  async isMemberOf(lid, uid) {
    log.debug(`Checking if user w/ id ${uid} is a member of library ${lid}.`);
    const matches = await this._db
      .table('library_users')
      .select('*')
      .where({ lid: parseInt(lid), uid: parseInt(uid) });

    log.debug('Matching libraries: ', matches);

    return matches.length > 0;
  }
}
