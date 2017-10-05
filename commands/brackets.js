// brackets : 0-100-300     Number separated by dashes. This example creates two brackets, 0-100 and 100-300. Prices are always USD.

let permissionHelper = require('./../utils/permissionHelper'),
    codes = require('./../utils/codes'),
    messages = require('./../utils/messages'),
    infoLog = require('./../utils/logger').info,
    hi = require('./../utils/highlight'),
    settings = require('./../utils/settings').instance();

module.exports = async function (client, message, messageText){
    let isAdmin = await permissionHelper.isAdmin(client, message.author);
    if (!isAdmin){
        message.author.send(messages.permissionError);
        return codes.MESSAGE_REJECTED_PERMISSION;
    }

    let args = messageText.split(' ');

    // list brackets
    if (args.length === 1){
        let reply = '';

        if (!settings.values.brackets || !settings.values.brackets.length){
            reply = 'No brackets set.';
        } else {
            reply += 'Current brackets :\n';
            for (let bracket of settings.values.brackets)
                reply += `${bracket.min} to ${bracket.max}\n`;
        }

        message.author.send(reply);
        return codes.MESSAGE_ACCEPTED_BRACKETSLIST;
    }

    if (args.length > 2){
        message.author.send(`Invalid brackets command. Expected : ${hi('brackets [price]-[price]..')}. \n` +
            `Example ${hi('brackets 0-50-100-200')} creates 3 brackets 0-50, 50-100, & 100-200.`);
        return codes.MESSAGE_REJECTED_INVALIDARGUMENTS;
    }

    let bracketParts = args[1].split('-').filter(function(part){ return part.length ? part : null; });
    if (bracketParts.length < 2){
        message.author.send(`You should specify at least one bracket, ex, ${hi('brackets 0-100')}.`);
        return codes.MESSAGE_REJECTED_INVALIDBRACKET;
    }

    let brackets = [];
    for (let i = 0 ; i < bracketParts.length ; i ++){
        let bracket = bracketParts[i];

        if (isNaN(bracket)){
            message.author.send(`${hi(bracket)} is not number.`);
            return codes.MESSAGE_REJECTED_INVALIDBRACKET;
        }

        bracket = parseInt(bracket);
        if (brackets.length > 0)
            brackets[brackets.length - 1].max = bracket;
        if (i !== bracketParts.length - 1)
            brackets.push({min : bracket});
    }

    settings.values.brackets = brackets;
    settings.save();

    message.author.send(`${hi(brackets.length)} brackets were set.`);
    infoLog.info(`User ${message.author.username} set brackets to ${args[1]}.`);
    return codes.MESSAGE_ACCEPTED;

};