import axios from "axios";
import { Buffer } from "buffer";
import { DefaultAzureCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";
import nconf from "nconf";
import findup from "findup-sync";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Secure Azure DevOps Client
 * Fetches secrets from Azure Key Vault instead of .env file
 */
export class AzureDevOpsClient {
    constructor() {
        this.config = null;
        this.pat = null;
        this.auth = null;
        this.baseHeaders = null;
    }

    /**
     * Initialize the client by loading config and fetching secrets from Key Vault
     */
    async initialize() {
        console.log('Initializing Azure DevOps Client with Key Vault authentication...');
        
        // Load configuration using nconf (same as TestContext.ts)
        this._loadConfig();
        
        // Fetch PAT from Key Vault
        await this._fetchSecrets();
        
        // Set up authentication headers
        this._setupAuth();
        
        console.log('Azure DevOps Client initialized successfully');
    }

    /**
     * Load configuration using nconf (same pattern as TestContext._loadConfig)
     */
    _loadConfig() {
        try {
            // Use findup to find config.json (same as TestContext)
            const configPath = findup('config.json');
            
            if (!configPath) {
                throw new Error('Cannot find the config file config.json');
            }

            console.log(`Loading config from: ${configPath}`);
            
            // Load config using nconf (same as TestContext)
            nconf.argv().env().file(configPath);

            // Get required configuration values
            const keyVaultUrl = nconf.get('keyVaultUrl');
            const azureDevOpsPatSecretName = nconf.get('azureDevOpsPatSecretName');
            const azureDevOpsOrgUrl = nconf.get('azureDevOpsOrgUrl');
            const azureDevOpsProject = nconf.get('azureDevOpsProject');
            const azureDevOpsPlanId = nconf.get('azureDevOpsPlanId');
            const azureDevOpsSuiteId = nconf.get('azureDevOpsSuiteId');

            // Validate required configuration
            const requiredFields = {
                keyVaultUrl,
                azureDevOpsPatSecretName,
                azureDevOpsOrgUrl,
                azureDevOpsProject,
                azureDevOpsPlanId,
                azureDevOpsSuiteId
            };

            for (const [field, value] of Object.entries(requiredFields)) {
                if (!value) {
                    throw new Error(`Missing required configuration: ${field}`);
                }
            }

            // Store config
            this.config = requiredFields;

            console.log('Configuration loaded successfully');
            console.log(`  Key Vault URL: ${this.config.keyVaultUrl}`);
            console.log(`  Azure DevOps Org: ${this.config.azureDevOpsOrgUrl}`);
            console.log(`  Project: ${this.config.azureDevOpsProject}`);
            
        } catch (error) {
            console.error(`Failed to load configuration: ${error.message}`);
            throw error;
        }
    }

    /**
     * Fetch secrets from Azure Key Vault (same pattern as TestContext._setCredentials)
     */
    async _fetchSecrets() {
        try {
            console.log(`Connecting to Key Vault: ${this.config.keyVaultUrl}`);
            
            // Use DefaultAzureCredential (same as ArmClient.ts getSecretClient)
            const credential = new DefaultAzureCredential();
            const secretClient = new SecretClient(this.config.keyVaultUrl, credential);

            // Fetch PAT from Key Vault
            console.log(`Fetching secret: ${this.config.azureDevOpsPatSecretName}`);
            const patSecret = await secretClient.getSecret(this.config.azureDevOpsPatSecretName);
            this.pat = patSecret?.value;

            if (!this.pat) {
                throw new Error('Failed to retrieve Azure DevOps PAT from Key Vault');
            }

            console.log('Secrets fetched successfully from Key Vault');
        } catch (error) {
            console.error(`Failed to fetch secrets from Key Vault: ${error.message}`);
            console.error('\nMake sure you have the following:');
            console.error('1. Azure CLI installed and logged in (az login)');
            console.error('2. Appropriate permissions to access the Key Vault');
            console.error('3. Key Vault secret exists with the correct name');
            console.error('\nTo check your access:');
            console.error(`   az keyvault secret show --vault-name antuxdev --name ${this.config.azureDevOpsPatSecretName}`);
            throw error;
        }
    }

    /**
     * Set up authentication headers
     */
    _setupAuth() {
        this.auth = Buffer.from(`:${this.pat}`).toString("base64");
        this.baseHeaders = {
            Authorization: `Basic ${this.auth}`,
            "Content-Type": "application/json-patch+json",
            Accept: "application/json"
        };
    }

    /**
     * Get Azure DevOps organization URL
     */
    getOrgUrl() {
        return this.config.azureDevOpsOrgUrl;
    }

    /**
     * Get Azure DevOps project name
     */
    getProject() {
        return this.config.azureDevOpsProject;
    }

    /**
     * Get Azure DevOps plan ID
     */
    getPlanId() {
        return this.config.azureDevOpsPlanId;
    }

    /**
     * Get Azure DevOps suite ID
     */
    getSuiteId() {
        return this.config.azureDevOpsSuiteId;
    }

    /**
     * Get authentication headers
     */
    getHeaders() {
        return this.baseHeaders;
    }

    /**
     * Get basic auth string
     */
    getAuth() {
        return this.auth;
    }

    /**
     * Create a test case in Azure DevOps
     */
    async createTestCase(testCase) {
        const url = `${this.getOrgUrl()}${this.getProject()}/_apis/wit/workitems/$Test%20Case?api-version=7.0`;
        
        try {
            const response = await axios.post(url, testCase, { headers: this.getHeaders() });
            return response.data.id;
        } catch (error) {
            console.error(`Failed to create test case: ${error.message}`);
            if (error.response) {
                console.error('Response data:', JSON.stringify(error.response.data, null, 2));
            }
            throw error;
        }
    }

    /**
     * Add test case to suite
     */
    async addToSuite(workItemId) {
        const url = `${this.getOrgUrl()}${this.getProject()}/_apis/test/Plans/${this.getPlanId()}/Suites/${this.getSuiteId()}/TestCases/${workItemId}?api-version=7.0`;
        
        try {
            await axios.post(url, {}, { 
                headers: { 
                    Authorization: `Basic ${this.getAuth()}`, 
                    Accept: "application/json" 
                } 
            });
        } catch (error) {
            console.error(`Failed to add test case ${workItemId} to suite: ${error.message}`);
            if (error.response) {
                console.error('Response data:', JSON.stringify(error.response.data, null, 2));
            }
            throw error;
        }
    }
}