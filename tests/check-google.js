
// Using native fetch in Node 24+
async function checkGoogle() {
    console.log("Checking connectivity to https://generativelanguage.googleapis.com...");
    try {
        const res = await fetch('https://generativelanguage.googleapis.com', { method: 'HEAD' });
        console.log(`Status: ${res.status} ${res.statusText}`);
        console.log("Connectivity confirmed.");
    } catch (err) {
        console.error("Connectivity check failed:");
        console.error(err.message);
        if (err.cause) console.error("Cause:", err.cause);
    }
}
checkGoogle();
