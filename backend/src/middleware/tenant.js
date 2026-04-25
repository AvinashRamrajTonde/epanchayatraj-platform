import prisma from '../config/db.js';
import { config } from '../config/env.js';
import { SUPERADMIN_SUBDOMAINS } from '../config/constants.js';

export const tenantMiddleware = async (req, res, next) => {
  try {
    const host = req.headers.host || '';
    const hostname = host.split(':')[0];
    const platformDomain = config.platformDomain;

    // Extract subdomain
    let subdomain = null;
    if (hostname.endsWith(`.${platformDomain}`)) {
      subdomain = hostname.replace(`.${platformDomain}`, '');
    }

    // Defaults
    req.tenant = null;
    req.tenantType = null;

    if (!subdomain || subdomain === 'www' || subdomain === 'api') {
      req.tenantType = 'platform';
      return next();
    }

    if (SUPERADMIN_SUBDOMAINS.includes(subdomain)) {
      req.tenantType = 'superadmin';
      return next();
    }

    // Look up village by subdomain, slug, or custom domain
    const village = await prisma.village.findFirst({
      where: {
        OR: [
          { subdomain: subdomain },
          { slug: subdomain },
          { customDomain: hostname },
        ],
      },
      include: { tehsil: true },
    });

    if (village) {
      req.tenant = village;
      req.tenantType = 'village';
    } else {
      req.tenantType = 'unknown';
    }

    next();
  } catch (error) {
    next(error);
  }
};
