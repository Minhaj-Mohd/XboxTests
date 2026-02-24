import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { AzureDevOpsClient } from "./AzureDevOpsClient.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------- UTIL: XML Escaping ----------
function xmlEscape(str = "") {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

// ---------- BUILD STEPS XML ----------
function buildStepsXml(steps) {
    const inner = steps
        .map(
            (s, i) => `<step id="${i + 1}" type="ActionStep">
  <parameterizedString isformatted="true">${xmlEscape(s.action)}</parameterizedString>
  <parameterizedString isformatted="true">${xmlEscape(s.expected)}</parameterizedString>
</step>`
        )
        .join("");
    return `<steps id="0">${inner}</steps>`;
}

// ---------- BUILD TEST CASE BODY ----------
function buildTestCaseBody(tc) {
    const stepsXml = buildStepsXml(tc.steps || []);
    const tagParts = [
        ...(tc.tags || []),
        tc.id ? `LogicalID:${tc.id}` : null,
        tc.category ? `Category:${tc.category}` : null
    ].filter(Boolean);
    const tags = tagParts.join("; ");

    const body = [
        { op: "add", path: "/fields/System.Title", value: tc.title },
        { op: "add", path: "/fields/Microsoft.VSTS.TCM.Steps", value: stepsXml },
        { op: "add", path: "/fields/System.Tags", value: tags }
    ];

    if (tc.priority) {
        body.push({ 
            op: "add", 
            path: "/fields/Microsoft.VSTS.Common.Priority", 
            value: tc.priority 
        });
    }

    return body;
}

// ---------- MAIN ----------
(async () => {
    console.log('========================================');
    console.log('Azure DevOps Test Case Creator');
    console.log('Using Key Vault for secure authentication');
    console.log('========================================\n');

    try {
        // Initialize Azure DevOps client with Key Vault authentication
        const adoClient = new AzureDevOpsClient();
        await adoClient.initialize();

        // Load test cases from JSON
        const jsonFile = process.env.TESTCASE_JSON || 
            path.resolve(__dirname, "xboxsearchbartestcases.json");

        console.log(`\nLoading test cases from: ${jsonFile}`);
        
        let payload;
        try {
            const rawData = fs.readFileSync(jsonFile, "utf-8");
            payload = JSON.parse(rawData);
        } catch (e) {
            console.error(`Unable to read/parse test case JSON file: ${e.message}`);
            process.exit(1);
        }

        if (!Array.isArray(payload.testCases)) {
            console.error("JSON missing 'testCases' array.");
            process.exit(1);
        }

        console.log(`Loaded ${payload.testCases.length} test cases\n`);
        console.log('========================================');
        console.log('Creating test cases in Azure DevOps...');
        console.log('========================================\n');

        let successCount = 0;
        let failedCount = 0;
        const failedTestCases = [];

        for (const tc of payload.testCases) {
            // Basic validation
            if (!tc.title || !Array.isArray(tc.steps) || tc.steps.length === 0) {
                console.warn(`⚠️  Skipping test case missing title/steps: ${tc.id || tc.title}\n`);
                failedCount++;
                failedTestCases.push({
                    id: tc.id,
                    title: tc.title,
                    reason: 'Missing title or steps'
                });
                continue;
            }

            try {
                console.log(`Creating: ${tc.title}`);
                console.log(`  ID: ${tc.id}`);
                console.log(`  Priority: ${tc.priority}`);
                console.log(`  Steps: ${tc.steps.length}`);

                const testCaseBody = buildTestCaseBody(tc);
                const workItemId = await adoClient.createTestCase(testCaseBody);

                console.log(`  ✓ Created with Azure DevOps ID: ${workItemId}`);

                await adoClient.addToSuite(workItemId);
                console.log(`  ✓ Added to test suite\n`);

                successCount++;
            } catch (error) {
                console.error(`  ✗ Failed: ${error.message}\n`);
                failedCount++;
                failedTestCases.push({
                    id: tc.id,
                    title: tc.title,
                    reason: error.message
                });
            }
        }

        // Final summary
        console.log('========================================');
        console.log('Execution Summary');
        console.log('========================================');
        console.log(`Total test cases: ${payload.testCases.length}`);
        console.log(`✓ Successfully created: ${successCount}`);
        console.log(`✗ Failed: ${failedCount}`);
        
        if (failedTestCases.length > 0) {
            console.log('\nFailed Test Cases:');
            failedTestCases.forEach(tc => {
                console.log(`  - ${tc.id}: ${tc.title}`);
                console.log(`    Reason: ${tc.reason}`);
            });
        }

        console.log('\n========================================\n');

        // Exit with appropriate code
        process.exit(failedCount > 0 ? 1 : 0);

    } catch (error) {
        console.error('\n========================================');
        console.error('FATAL ERROR');
        console.error('========================================');
        console.error(error.message);
        console.error('\nPlease ensure:');
        console.error('1. You are logged in with Azure CLI: az login');
        console.error('2. You have access to the Key Vault');
        console.error('3. All required secrets exist in Key Vault');
        console.error('4. config.json has the correct Key Vault URL');
        console.error('========================================\n');
        process.exit(1);
    }
})();