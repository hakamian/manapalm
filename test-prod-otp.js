
async function testProdOtp() {
    console.log("Testing Production OTP Send at https://manapalm.com/api/auth/otp...");

    try {
        const response = await fetch('https://manapalm.com/api/auth/otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'send',
                mobile: '09222453571'
            })
        });

        const data = await response.json();
        console.log("Response status:", response.status);
        console.log("Response data:", JSON.stringify(data, null, 2));

    } catch (err) {
        console.error("Test failed with error:", err);
    }
}

testProdOtp();
