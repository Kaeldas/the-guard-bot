'use strict';

const dedent = require('dedent-js');
const ms = require('millisecond');

const { context } = require('../bot');
const { link } = require('../utils/tg');
const {
	expireWarnsAfter = Infinity,
	numberOfWarnsToBan,
} = require('../config');
const { warn } = require('../stores/user');
const ban = require('./ban');

const isNewerThan = date => warning => warning.date >= date;

module.exports = async ({ admin, reason, userToWarn }) => {
	const by_id = admin.id;
	const date = new Date();

	const { warns } = await warn(userToWarn, { by_id, date, reason });
	const recentWarns = warns.filter(isNewerThan(date - ms(expireWarnsAfter)));

	const isLastWarn = ', <b>last warning!</b>'
		.repeat(recentWarns.length === numberOfWarnsToBan - 1);

	const warnMessage = dedent(`
		⚠️ ${link(admin)} <b>advertiu</b> ${link(userToWarn)} <b>por</b>:

		${reason} (${recentWarns.length}/${numberOfWarnsToBan}${isLastWarn})`);

	if (recentWarns.length >= numberOfWarnsToBan) {
		await ban({
			admin: context.botInfo,
			reason: 'Atingiu o número máximo de advertências',
			userToBan: userToWarn,
		});
		return warnMessage +
			'\n\n' +
			'🚫 O usuário foi <b>ceifado</b> ' +
			`por receber ${numberOfWarnsToBan} advertência(s)!`;
	}

	return warnMessage;
};
