import { loadConfig, saveConfig } from './src/core/config.js';
import { setCredential } from './src/core/keychain.js';

async function migrate() {
    const config = await loadConfig();
    // Assuming a key named 'mistral-api-key' for illustration if it existed in the config
    // In this repo, it seems credentialRef is not even present.
    // If it were:
    if (config.credentialRef && !/^[A-Z][A-Z0-9_]*$/.test(config.credentialRef)) {
        console.log("Migrating credential...");
        await setCredential('ai-key', config.credentialRef);
        delete config.credentialRef;
        await saveConfig(config);
    }
}
migrate().catch(console.error);
