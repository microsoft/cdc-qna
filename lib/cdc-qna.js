#!/usr/bin/env node
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require("chalk");
const readline = require("readline");
const Client_1 = require("./classes/Client");
const defaultKnowledgebaseName = "Microsoft Healthcare Bot CDC COVID-19 QnA";
const defaultblobURL = "https://hastoragedevops.blob.core.windows.net/public/cdc_covid19_qna.html";
var ACTION;
(function (ACTION) {
    ACTION[ACTION["NONE"] = 0] = "NONE";
    ACTION[ACTION["CREATE_KB"] = 1] = "CREATE_KB";
    ACTION[ACTION["UPDATE_KB"] = 2] = "UPDATE_KB";
})(ACTION || (ACTION = {}));
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.on("close", () => process.exit(0));
process
    .on('unhandledRejection', (reason, p) => rl.close())
    .on('uncaughtException', err => rl.close());
(async () => {
    console.log("################################################################");
    console.log("# Welcome to the COVID-19 Q&A Maker knowledge base manager CLI #");
    console.log("################################################################");
    const client = new Client_1.Client();
    do {
        client.subscriptionKey = await getStringInput("Subscription Key: ");
    } while (client.subscriptionKey.length < 10);
    console.log(`(${ACTION.CREATE_KB}) Create a new knowledge base`);
    console.log(`(${ACTION.UPDATE_KB}) Update an existing knowledge base`);
    let action = ACTION.NONE;
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
                let kbIndex = 0;
                while (kbIndex === 0) {
                    knowledgeBases.forEach((kb, i) => console.log(`(${i + 1}) [${chalk.gray(kb.id)}] ${kb.name}`));
                    kbIndex = await getNumericInput();
                    kbIndex= (kbIndex < 1 || kbIndex > knowledgeBases.length) ? 0 : kbIndex;
                }
                client.blobURI = await getStringInput(`CDC QnA HTML URL [${chalk.gray(defaultblobURL)}]: `) || defaultblobURL;
                client.kbid = knowledgeBases[kbIndex - 1].id;
                await client.update();
                break;
            default:
                action = ACTION.NONE;
                console.log("Please select again");
                break;
        }
    }
    console.log("Process completed, Thanks you");
    rl.close();
})();
function getNumericInput(str = "> ") {
    return new Promise((resolve, reject) => {
        rl.question(str, (response) => {
            resolve(Number(response));
        });
    });
}
function getStringInput(str = "> ") {
    return new Promise((resolve, reject) => {
        rl.question(str, (response) => {
            resolve(response);
        });
    });
}
