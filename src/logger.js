const chalk = require("chalk");

function getTime() {
    return new Date().toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
}

function write(label, color, message, output = console.log) {
    output(`${chalk.gray(`[${getTime()}]`)} ${color.bold(`[${label}]`)} ${message}`);
}

const log = {
    info: message => write("INFO", chalk.cyan, message),
    login: message => write("LOGIN", chalk.blue, message),
    wait: message => write("WARTE", chalk.yellow, message),
    command: message => write("BEFEHL", chalk.magenta, message),
    success: message => write("ERFOLG", chalk.green, message),
    reconnect: message => write("RECONNECT", chalk.yellowBright, message),
    error: message => write("FEHLER", chalk.red, message, console.error)
};

module.exports = { log };
