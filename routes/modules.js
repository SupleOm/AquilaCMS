/*
 * Product    : AQUILA-CMS
 * Author     : Nextsourcia - contact@aquila-cms.com
 * Copyright  : 2021 © Nextsourcia - All rights reserved.
 * License    : Open Software License (OSL 3.0) - https://opensource.org/licenses/OSL-3.0
 * Disclaimer : Do not edit or add to this file if you wish to upgrade AQUILA CMS to newer versions in the future.
 */

const showdown                    = require('showdown');
const {authentication, adminAuth} = require('../middleware/authentication');
const serviceModule               = require('../services/modules');

module.exports = function (app) {
    app.post('/v2/modules',          authentication, adminAuth, getAllModules);
    app.post('/v2/module',           authentication, adminAuth, getModule);
    app.post('/v2/modules/upload',   authentication, adminAuth, uploadModule);
    app.post('/v2/modules/toggle',   authentication, adminAuth, toggleActiveModule);
    app.post('/v2/modules/md',       authentication, adminAuth, getModuleMd);
    app.delete('/v2/modules/:id',    authentication, adminAuth, removeModule);
    app.put('/v2/module/config/:id',  authentication, adminAuth, setModuleConfigById);
};

/**
 * Permet de recupérer les modules en fonction du PostBody
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @param {Function} next
 */
async function getAllModules(req, res, next) {
    try {
        const result = await serviceModule.getModules(req.body.PostBody);
        return res.json(result);
    } catch (error) {
        return next(error);
    }
}
/**
 * Permet de recupérer un module en fonction du PostBody
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @param {Function} next
 */
async function getModule(req, res, next) {
    try {
        const result = await serviceModule.getModule(req.body.PostBody);
        return res.json(result);
    } catch (error) {
        return next(error);
    }
}

const uploadModule = async (req, res, next) => {
    req.setTimeout(300000);
    try {
        const moduleInstalled = await serviceModule.initModule(req.files);
        return res.json(moduleInstalled);
    } catch (error) {
        return next(error);
    }
};

const toggleActiveModule = async (req, res, next) => {
    req.setTimeout(300000);
    try {
        const {idModule, active} = req.body;
        let modules              = [];
        if (active) {
            modules = await serviceModule.activateModule(idModule);
        } else {
            modules = await serviceModule.deactivateModule(idModule);
        }
        return res.json(modules);
    } catch (error) {
        return next(error);
    }
};

const removeModule = async (req, res, next) => {
    try {
        await serviceModule.removeModule(req.params.id);
        res.send({status: true});
    } catch (error) {
        return next(error);
    }
};

const getModuleMd = async (req, res, next) => {
    try {
        const result    = await serviceModule.getModuleMd(req.body);
        const converter = new showdown.Converter();
        res.json({html: converter.makeHtml(result)});
    } catch (error) {
        next(error);
    }
};

/**
 * Permet de mettre a jour la configuration du module dont l'id est passé en parametre
 */
async function setModuleConfigById(req, res, next) {
    try {
        const result = await serviceModule.setModuleConfigById(req.params.id, req.body);
        return res.json(result);
    } catch (error) {
        return next(error);
    }
}