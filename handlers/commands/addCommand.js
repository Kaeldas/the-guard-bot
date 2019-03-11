'use strict';

// DB
const { addCommand, getCommand } = require('../../stores/command');

// Bot
const { Markup } = require('telegraf');
const { replyOptions } = require('../../bot/options');

const { isMaster } = require('../../utils/config');

const preserved = require('../commands').handlers;

const addCommandHandler = async (ctx) => {
	const { chat, message, reply } = ctx;
	if (chat.type !== 'private') return null;
	const { id } = ctx.from;

	if (ctx.from.status !== 'admin') {
		return reply(
			'ℹ️ <b>Desculpe, só ceifadores podem acessar esse comando</b>',
			replyOptions
		);
	}

	const [ slashCommand, commandName = '' ] = message.text.split(' ');
	const isValidName = /^!?(\w+)$/.exec(commandName);
	if (!isValidName) {
		return reply(
			'<b>Envie um comando válido.</b>\n\nExemplo:\n' +
			'<code>/addcommand funk_comunista</code>',
			replyOptions
		);
	}
	const newCommand = isValidName[1].toLowerCase();
	if (preserved.has(newCommand)) {
		return reply('❗️ Desculpe você não pode usar esse nome, ele é reservado.\n\n' +
			'Tente outro.');
	}

	const replaceCmd = slashCommand.toLowerCase() === '/replacecommand';

	const cmdExists = await getCommand({ isActive: true, name: newCommand });

	if (!replaceCmd && cmdExists) {
		return ctx.replyWithHTML(
			'ℹ️ <b>Esse comando já existe.</b>\n\n' +
			'/commands - para ver a lista de comandos comunistas.\n' +
			'/addcommand <code>&lt;name&gt;</code> - para adicionar um comando.\n' +
			'/removecommand <code>&lt;name&gt;</code>' +
			' - para remover um comando.',
			Markup.keyboard([ [ `/replaceCommand ${newCommand}` ] ])
				.oneTime()
				.resize()
				.extra()
		);
	}
	if (cmdExists && cmdExists.role === 'master' && !isMaster(ctx.from)) {
		return ctx.reply(
			'ℹ️ <b>Desculpe, só o Ceifador-mor pode acessar esse comando.</b>',
			replyOptions
		);
	}
	await addCommand({ id, name: newCommand, state: 'role' });
	return reply('Quem pode usar esse comando?', Markup.keyboard([
		[ 'Ceifador-mor', 'Ceifadores', 'Camaradas' ]
	])
		.oneTime()
		.resize()
		.extra());
};

module.exports = addCommandHandler;
