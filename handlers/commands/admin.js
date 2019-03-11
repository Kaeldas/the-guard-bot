'use strict';

// Utils
const { isMaster } = require('../../utils/config');
const { link, scheduleDeletion } = require('../../utils/tg');
const { logError } = require('../../utils/log');
const { parse, strip } = require('../../utils/parse');

// Bot
const { replyOptions } = require('../../bot/options');

// DB
const {
	admin,
	getUser,
} = require('../../stores/user');

const adminHandler = async ({ from, message, reply }) => {
	if (!isMaster(from)) return null;

	const { targets } = parse(message);

	if (targets.length > 1) {
		return reply(
			'ℹ️ <b>Especifique o camarada a ser promovido.</b>',
			replyOptions
		).then(scheduleDeletion());
	}

	const userToAdmin = targets.length
		? await getUser(strip(targets[0]))
		: from;

	if (!userToAdmin) {
		return reply(
			'❓ <b>Camarada desconhecido.</b>\n' +
			'Por favor encaminhe uma mensagem e tente novamente.',
			replyOptions
		).then(scheduleDeletion());
	}

	if (userToAdmin.status === 'banned') {
		return reply('ℹ️ <b>Não posso promover usuários banidos.</b>', replyOptions);
	}

	if (userToAdmin.status === 'admin') {
		return reply(
			`⭐️ ${link(userToAdmin)} <b>já é um ceifador.</b>`,
			replyOptions
		);
	}

	try {
		await admin(userToAdmin);
	} catch (err) {
		logError(err);
	}

	return reply(`⭐️ ${link(userToAdmin)} <b>agora é um ceifador.</b>`, replyOptions);
};

module.exports = adminHandler;
