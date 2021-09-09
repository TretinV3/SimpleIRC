///*
const net = require('net');
const readline = require('readline');
const util = require('util');
const fs = require("fs");

let client = new net.Socket();
const rl = readline.createInterface({ input: process.stdin, output: null });
const question = util.promisify(rl.question).bind(rl);

let nbPing = 0;

let ip, port, name, serverId;

let startMode;

start();

function start() {
    clear();
    console.log(
        "\t┌────────────────────────┐\n" +
        "\t│                        │\n" +
        "\t│    SIMPLE IRC CLIENT   │\n" +
        "\t│                        │\n" +
        "\t│            by TretinV3 │\n" +
        "\t└────────────────────────┘\n" +
        "\n\n\t\tpress [ENTER]\n\n\n\n"
    )
    startMode = 0;
    client = new net.Socket();
}

function choseUser(pseudo) {
    if (!pseudo) {
        startMode = 1;
        clear();
        console.log(
            "Chose your username :\n" +
            "\n\n\n\n\n\n"
        )
    } else {
        name = pseudo;
        choseServeur();
    }
}

function choseServeur(input) {
    const db = JSON.parse(fs.readFileSync("./db.json"));
    startMode = 2;
    if (!input || isNaN(input) || input > db.servers.length) {
        clear();
        console.log(
            "Chose the IRC server to connect :\n"
        );
        for (let i = 0; i < db.servers.length; i++) {
            console.log(`(${i + 1}) ${db.servers[i]}`);
        }
        console.log(
            "\n" +
            "Type 0 for add a new IRC server\n" +
            "\n\n\n\n\n"
        )
    } else {
        if (input == 0) {
            addServeur();
        } else {
            serverId = input;
            selectServeur(serverId);
        }
    }
}

function selectServeur(i) {
    const db = JSON.parse(fs.readFileSync("./db.json"));
    port = db.servers[i - 1].split(":")[1];
    ip = db.servers[i - 1].split(":")[0];
    client.connect(port, ip, () => {
        console.log('Connecting to server');
        console.log("try to log in...")
        client.write(`NICK ${name}\r\n`);
        client.write(`USER ${name} toto toto :${name}\r\n`);
    });
    startMode = 10;
}

function addServeur(input) {
    startMode = 3;
    const db = JSON.parse(fs.readFileSync("./db.json"));
    if (!input) {
        clear();
        console.log(
            "Type the address of the server (the default port is 6667) :\n" +
            "\n\n\n\n\n\n"
        )
    } else {
        if (!input.split(":")[1]) input += ":6667";
        db.servers.push(input);
        fs.writeFileSync("./db.json", JSON.stringify(db, null, 3))
        choseServeur();
    }
}

let channel = "";
function run(input) {
    //process.stdout.write(`\rtest`);
    if (input.startsWith("/")) {
        if (input.startsWith("/join")) {
            client.write(`JOIN ${input.split(" ")[1]}\r\n`)
            channel = input.split(" ")[1];
        }
    } else {
        client.write(`PRIVMSG ${channel} :${input}\r\n`);
        console.log(`<${name}> ${input}`)
    }
}

function clear() {
    const blank = '\n'.repeat(process.stdout.rows)
    console.log(blank)
}

/*rl.question('IRC server name : ', (addr) => {
    ip = addr;
    rl.question('IRC port number : (default: 6667) ', (number) => {
        port = number || 6667;
        rl.question('Username : ', (user) => {
            name = user;

            client.connect(port, ip, () => {
                console.log('Connected to server');
                console.log("try to log in...")
                client.write(`NICK ${name}\r\n`);
                client.write(`USER ${name} toto toto :${name}\r\n`);
            });
        });
    });
});*/

/*client.connect(6667, "drlazor.be", () => {
    console.log('Connected to server');
    console.log("try to log in...")
    client.write(`PASS toto\r\n`);
    client.write(`NICK TretinV3\r\n`);
    client.write(`USER TretinV3 toto toto :TrétinV3\r\n`);
});*/

client.on('end', () => {
    console.log(`connection closed ${nbPing >= 5 ? "for AFK " : ""}!`)
})

client.on('data', (data) => {
    data = data.toString('utf-8');
    if (data.startsWith("PING")) {
        client.write(`PONG\r\n`);
        if (nbPing >= 5) {
            client.end();
        }
        //console.log(nbPing)
        nbPing++;
    } else {
        nbPing = 0;

        if (data.startsWith(':') && !data.startsWith(`:${ip}`)) {
            const args = data.split(" ");
            if (args[1] == "PRIVMSG") {
                console.log(`<${args[0].slice(1)}> ${data.split(":")[2].slice(0,-2)}`)
            }
        } else {
            console.log("server : " + data);
        }
    }
});

rl.on('line', (line) => {

    switch (startMode) {
        case 0:
            choseUser();
            break;
        case 1:
            choseUser(line);
            break;
        case 2:
            choseServeur(line);
            break;
        case 3:
            addServeur(line);
            break;
        case 10:
            nbPing = 0;
            run(line);
            break;
        default:
            break;
    }

    /*
    console.log("line")
    nbPing = 0;
    if (line.startsWith("/")) {
        client.write(`${line.slice(1)}\r\n`);
    } else {
        client.write(`PRIVMSG #defi :${line}\r\n`);
    }*/
});
rl.on('close', () => {
    client.end();
});


//*/
