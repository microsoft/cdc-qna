/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require("chalk");
const rp = require("request-promise");
const sleep = (ms) => new Promise((resolve, reject) => setTimeout(resolve, ms));
class Client {
    constructor() {
        this.alterations = ["COVID-19", "COVID19", "Coronavirus", "Coron", "CoV19", "CoV-19"];
        this.endpoint = "westus.api.cognitive.microsoft.com";
        this.blobURI = "https://hastoragedevops.blob.core.windows.net/public/cdc_covid19_qna.html";
    }
    /**
     * API for creating this KB class instance
     */
    async create() {
        await this.createKnowledgeBase();
        await this.replaceAlterations();
        await this.publishKnowledgeBase(this.kbid);
        const details = await this.getKBDetails(this.kbid);
        const endpointKeys = await this.getEndpointKeys();
        this.summary({ details, endpointKeys });
    }
    /**
     * API for updating this KB class instance (and publishing)
     * @param kbid
     */
    async update() {
        await this.updateKnowledgeBase(this.kbid);
        const details = await this.getKBDetails(this.kbid);
        const endpointKeys = await this.getEndpointKeys();
        this.summary({ details, endpointKeys });
    }
    async getKnowledgeBases() {
        console.log(chalk.cyan("Fetching knowledgebase list"));
        try {
            const data = await rp({
                url: `https://${this.endpoint}/qnamaker/v4.0/knowledgebases/`,
                method: "get",
                json: true,
                headers: {
                    "Ocp-Apim-Subscription-Key": this.subscriptionKey
                }
            });
            return data.knowledgebases;
        }
        catch (e) {
            console.error("Failed deleting knowledge base - " + e.message);
            throw e;
        }
    }
    /**
     * Creating the knowledge base
     */
    async createKnowledgeBase() {
        let createOperationResult;
        const body = {
            name: this.kbName,
            urls: [this.blobURI]
        };
        try {
            console.log(chalk.cyan("Creating new knowledge base stated"));
            const operation = await rp({
                url: `https://${this.endpoint}/qnamaker/v4.0/knowledgebases/create`,
                method: "post",
                json: true,
                headers: {
                    "Ocp-Apim-Subscription-Key": this.subscriptionKey
                },
                body
            });
            createOperationResult = await this.pollingOperation(operation.operationId);
            if (createOperationResult.operationState !== "Succeeded") {
                throw new Error('Failed to create knowledge base');
            }
            this.kbid = createOperationResult.resourceLocation.split("/").pop();
        }
        catch (e) {
            console.error("Failed creating new knowledge base - " + e.message);
            throw e;
        }
    }
    /**
     * This method will replace knowledge base questions and answers
     */
    async updateKnowledgeBase(kbid) {
        let createOperationResult;
        try {
            console.log(chalk.cyan("Updating knowledge base started"));
            const operation = await rp({
                url: `https://${this.endpoint}/qnamaker/v4.0/knowledgebases/${kbid}`,
                method: "patch",
                json: true,
                headers: {
                    "Ocp-Apim-Subscription-Key": this.subscriptionKey
                },
                body: { add: { urls: [this.blobURI] }, update: { urls: [this.blobURI] } }
            });
            createOperationResult = await this.pollingOperation(operation.operationId);
            if (createOperationResult.operationState !== "Succeeded") {
                throw new Error('Failed to update knowledge base');
            }
        }
        catch (e) {
            console.error("Failed updating new knowledge base - " + e.message);
            throw e;
        }
    }
    /**
     * This method will replace alternations
     */
    async replaceAlterations() {
        if (!this.alterations || this.alterations.length === 0) {
            console.log(chalk.gray("QnA KB- No alterations to set"));
            return;
        }
        try {
            const wordAlterations = await this.downloadAlterations();
            if (wordAlterations.find((alts) => {
                return alts.alterations.indexOf(this.alterations[0]) >= 0;
            })) {
                console.log(chalk.gray("QnA KB- required alterations already exists for this knowledge base"));
                return;
            }
            wordAlterations.push({ alterations: this.alterations });
            console.log(chalk.cyan("Creating alterations for knowledge base started"));
            await rp({
                url: `https://${this.endpoint}/qnamaker/v4.0/alterations`,
                method: "put",
                json: true,
                headers: {
                    "Ocp-Apim-Subscription-Key": this.subscriptionKey
                },
                body: { wordAlterations }
            });
        }
        catch (e) {
            console.error("Failed creating alterations for knowledge base - " + e.message);
            throw e;
        }
    }
    /**
     * This method will download existing alternations
     */
    async downloadAlterations() {
        let response = null;
        try {
            console.log(chalk.cyan("Reading existing alterations for knowledge base started"));
            response = await rp({
                url: `https://${this.endpoint}/qnamaker/v4.0/alterations`,
                method: "get",
                json: true,
                headers: {
                    "Ocp-Apim-Subscription-Key": this.subscriptionKey
                }
            });
        }
        catch (e) {
            console.error("Failed downloading alterations for knowledge base - " + e.message);
            throw e;
        }
        return response.wordAlterations;
    }
    /**
     * This method will publish a knowledge base
     */
    async publishKnowledgeBase(kbid) {
        try {
            console.log(chalk.cyan("Publishing knowledge base started"));
            await rp({
                url: `https://${this.endpoint}/qnamaker/v4.0/knowledgebases/${kbid}`,
                method: "post",
                json: true,
                headers: {
                    "Ocp-Apim-Subscription-Key": this.subscriptionKey
                },
            });
        }
        catch (e) {
            console.error("Failed publishing knowledge base - " + e.message);
            throw e;
        }
    }
    /**
     * This method will return the knowledge base endpoint keys
     */
    async getEndpointKeys() {
        let endpointKeys;
        try {
            console.log(chalk.cyan(`Reading endpoint Keys`));
            endpointKeys = await rp({
                url: `https://${this.endpoint}/qnamaker/v4.0/endpointkeys`,
                method: "get",
                json: true,
                headers: {
                    "Ocp-Apim-Subscription-Key": this.subscriptionKey
                },
            });
        }
        catch (e) {
            console.error("Failed getting endpoint keys - " + e.message);
            throw e;
        }
        return endpointKeys;
    }
    /**
     * This method will return the knowledge base details
     */
    async getKBDetails(kbid) {
        let details;
        try {
            console.log(chalk.cyan(`Reading knowledge base details`));
            details = await rp({
                url: `https://${this.endpoint}/qnamaker/v4.0/knowledgebases/${kbid}`,
                method: "get",
                json: true,
                headers: {
                    "Ocp-Apim-Subscription-Key": this.subscriptionKey
                },
            });
        }
        catch (e) {
            console.error("Failed getting knowledge base details - " + e.message);
            throw e;
        }
        details.hostName = `${details.hostName}/qnamaker`;
        return details;
    }
    /**
     * This method will perform polling on a create operation
     */
    async pollingOperation(operationId) {
        let pollingResponse;
        try {
            do {
                await sleep(2000);
                pollingResponse = await rp({
                    url: `https://${this.endpoint}/qnamaker/v4.0/operations/${operationId}`,
                    method: "get",
                    json: true,
                    headers: {
                        "Ocp-Apim-Subscription-Key": this.subscriptionKey
                    }
                });
                if (pollingResponse.operationState === "Running") {
                    process.stdout.write(chalk.cyan("."));
                }
                else {
                    process.stdout.write(chalk.cyan("\n"));
                }
            } while (!pollingResponse || pollingResponse.operationState === "Running" || pollingResponse.operationState === "NotStarted");
        }
        catch (e) {
            console.error("Failed polling operation - " + e.message);
        }
        return pollingResponse;
    }
    summary(data) {
        console.table([
            {
                "Name": "Knowledge Base ID",
                "Value": data.details.id
            },
            {
                "Name": "Knowledge Base Name",
                "Value": data.details.name
            },
            {
                "Name": "QnA Endpoint",
                "Value": `${data.details.hostName}`
            },
            {
                "Name": "Endpoint Key",
                "Value": data.endpointKeys.primaryEndpointKey
            },
            {
                "Name": "Knowledge Base Editor",
                "Value": `https://www.qnamaker.ai/Edit/KnowledgeBase?kbId=${data.details.id}`
            }
        ]);
    }
}
exports.Client = Client;
//# sourceMappingURL=Client.js.map
