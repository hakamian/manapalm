
async function testProdEnv() {
    console.log("Testing Production OTP Env at https://manapalm.com/api/secure/otp...");

    try {
        const response = await fetch('https://manapalm.com/api/secure/otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'send',
                mobile: '09222453571'
            })
        });

        const data = await response.json();
        console.log("Response status:", response.status);
        if (data.missing) {
            console.log("❌ EXPLICITLY MISSING VARIABLES:", data.missing);
        } else {
            console.log("Response data:", JSON.stringify(data, null, 2));
        }

    } catch (err) {
        console.error("Test failed with error:", err);
    }
}

testProdEnv();
