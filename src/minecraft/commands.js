require("mineflayer");
function sendChat(bot, message) {
    bot.chat(message);
}

function jump(bot){
    bot.setControlState("jump",true);
    setTimeout(() =>
    {
        bot.setControlState("jump",false);
    },500);
}

module.exports = {
    sendChat,
    jump,
};