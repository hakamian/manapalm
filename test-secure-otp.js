
async function testSecureOtp() {
    console.log("Testing Production Secure OTP at https://manapalm.com/api/secure/otp...");

    try {
        const response = await fetch('https://manapalm.com/api/secure/otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'send',
                mobile: '09222453571'
            })
        });

        const text = await response.text();
        console.log("Response status:", response.status);
        console.log("Response headers:", [...response.headers.entries()]);
        console.log("Response body:", text);

    } catch (err) {
        console.error("Test failed with error:", err);
    }
}

testSecureOtp();
