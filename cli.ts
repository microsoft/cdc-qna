import * as chalk from "chalk";
const readline = require("readline");
import {Client} from "./classes/Client";

const defaultKnowledgebaseName = "Healthcare Bot CDC COVID-19 QnA";
const defaultblobURL = "https://hastoragedevops.blob.core.windows.net/public/cdc_covid19_qna.html";

enum ACTION { NONE, CREATE_KB, UPDATE_KB}

const rl = readline.createInterface({input: process.stdin, output: process.stdout});
rl.on("close", () => process.exit(0));
process
    .on('unhandledRejection', (reason, p) => rl.close())
    .on('uncaughtException', err => rl.close());

(async () => {
    /**
     * helper function for running input
     * @param question
     */
    console.log("################################################################");
    console.log("# Welcome to the COVID-19 Q&A Maker knowledge base manager CLI #");
    console.log("################################################################");
    const client = new Client();
    do {
        client.subscriptionKey = await getStringInput("Subscription Key: ")
    } while (client.subscriptionKey.length < 10);
    console.log(`(${ACTION.CREATE_KB}) Create a new knowledge base`);
    console.log(`(${ACTION.UPDATE_KB}) Update an existing knowledge base`);
    let action: ACTION = ACTION.NONE;
    while (action === ACTION.NONE) {
        action = await getNumericInput();
        switch (action) {
            case ACTION.CREATE_KB:
                client.kbName = await getStringInput(`Knownledge Base name [${chalk.gray(defaultKnowledgebaseName)}]: `) || defaultKnowledgebaseName;
                client.blobURI = await getStringInput(`QnA HTML URL [${chalk.gray(defaultblobURL)}]: `) || defaultblobURL;
                await client.create();
                break;
            case ACTION.UPDATE_KB:
                const knowledgeBases = await client.getKnowledgeBases();
                if (knowledgeBases.length === 0) {
                    return console.log('No Knowledge Bases found for this subscription key');
                }
                let kbIndex: number = 0;
                while (kbIndex  === 0) {
                    knowledgeBases.forEach((kb, i) => console.log(`(${i + 1}) [${chalk.gray(kb.id)}] ${kb.name}`));
                    kbIndex = await getNumericInput();
                    if (kbIndex < 1 || kbIndex > knowledgeBases.length) {
                        kbIndex = 0;
                    }
                }
                client.blobURI = await getStringInput(`QnA HTML URL [${chalk.gray(defaultblobURL)}]: `) || defaultblobURL;
                client.kbid = knowledgeBases[kbIndex - 1].id;
                await client.update();
                break;
            default:
                action = ACTION.NONE;
                console.log("Please select again");
                break
        }
    }
    console.log("Process completed, Thanks you");
    rl.close();
})();

/**
 * helper function to collect numeric input
 * @param str
 */
function getNumericInput(str = "> ") {
    return new Promise<number>((resolve, reject) => {
        rl.question(str, (response) => {
            resolve(Number(response));
        });
    })
}

/**
 * helper function to collect string input
 * @param str
 */
function getStringInput(str = "> ") {
    return new Promise<string>((resolve, reject) => {
        rl.question(str, (response) => {
            resolve(response);
        });
    })
}
