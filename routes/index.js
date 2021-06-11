/*
 * Product    : AQUILA-CMS
 * Author     : Nextsourcia - contact@aquila-cms.com
 * Copyright  : 2021 © Nextsourcia - All rights reserved.
 * License    : Open Software License (OSL 3.0) - https://opensource.org/licenses/OSL-3.0
 * Disclaimer : Do not edit or add to this file if you wish to upgrade AQUILA CMS to newer versions in the future.
 */

const path     = require('path');
const fs       = require('../utils/fsp');
const NSErrors = require('../utils/errors/NSErrors');

const InitRoutes = (express, server) => {
    const apiRouter        = express.Router(); // Route api for the front for client
    const adminFrontRouter = express.Router(); // Route for serving the front of the admin
    server.use('/api', apiRouter, (req, res, next) => next(NSErrors.ApiNotFound));
    server.use(`/${global.envConfig.environment.adminPrefix}`, adminFrontRouter);
    loadDynamicRoutes(apiRouter, adminFrontRouter);

    return apiRouter;
};

/**
 * Dynamically load all routes from the routes folder
 */
const loadDynamicRoutes = (app, adminFront) => {
    console.log('Loading routes');
    fs.readdirSync('./routes').forEach((file) => {
        // Do not load the index file or the installer routes
        if (file === path.basename(__filename) || path.extname(file) !== '.js' || file === 'install.js') {
            return;
        }

        // Load route files
        if (file === 'admin.js') {
            require(`./${file}`)(app, adminFront);
        } else {
            require(`./${file}`)(app);
        }
    });
};

/**
 * Route exceptions
 */
const manageExceptionsRoutes = async (req, res, next) => {
    if (['.jpg', '.jpeg', '.png', '.css', '.js', '.json', '.txt', '.ico'].includes(path.extname(req.url).toLowerCase())) {
        res.setHeader('Cache-Control', 'public, max-age=2592000');

        const dt = new Date(Date.now());
        dt.setMonth( dt.getMonth() + 1 );
        res.setHeader('Expires', dt.toUTCString());
    }
    // Exception BO React
    if (req.url.startsWith('/bo/') && !req.url.startsWith('/bo/api')) {
        if (path.basename(req.url).indexOf('.') > -1) {
            const url = req.url.replace('/bo', '/bo/build');
            res.sendFile(path.join(global.appRoot, url));
        } else {
            res.sendFile(path.join(global.appRoot, 'bo/build/index.html'));
        }
    } else if (req.url.startsWith('/google')) {
        res.sendFile(path.join(global.appRoot, req.url));
    } else if (req.url && req.url.startsWith('/images') && req.url.split('/').length === 6) {
        await require('../services/medias').getImageStream(req, res);
    } else if (
        global.envConfig
        && req.url.length > global.envConfig.environment.adminPrefix.length + 2
        && req.url.indexOf(`/${global.envConfig.environment.adminPrefix}/`)  > -1
        && req.url.split('/')[req.url.split('/').length - 1].indexOf('.') > -1
    ) {
        let url = req.url.replace(global.envConfig.environment.adminPrefix, 'backoffice').split('?')[0];
        if (fs.existsSync(path.join(global.appRoot, url))) {
            res.sendFile(path.join(global.appRoot, url));
        } else {
            url = url.replace('backoffice', global.envConfig.environment.photoPath || 'uploads');
            if (fs.existsSync(path.join(global.appRoot, url))) {
                res.sendFile(path.join(global.appRoot, url));
            } else {
                res.end();
            }
        }
    } else {
        require('../services/stats').addUserVisitReq(req);

        // We add the port to req so that it is available in the req of the getInitialProps of next
        req.port = global.port;
        next();
    }
};

module.exports = {
    manageExceptionsRoutes,
    loadDynamicRoutes,
    InitRoutes
};