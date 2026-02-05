
const BASE_URL = 'http://localhost:3000';

async function checkUrl(url, expectedContent) {
    try {
        const res = await fetch(`${BASE_URL}${url}`);
        if (!res.ok) {
            // If it's the deed page and we don't have ID, it might 404, which is expected behavior for invalid ID.
            if (url.includes('/deed/') && res.status === 404) {
                console.log(`✅ ${url} returned 404 (Expected for invalid ID)`);
                return true;
            }
            console.error(`❌ ${url} returned ${res.status}`);
            return false;
        }
        const text = await res.text();
        if (expectedContent && !text.includes(expectedContent)) {
            console.error(`❌ ${url} missing expected content: "${expectedContent}"`);
            return false;
        }
        console.log(`✅ ${url} verified`);
        return true;
    } catch (e) {
        console.error(`❌ ${url} failed: ${e.message}`);
        return false;
    }
}

async function verify() {
    console.log('🚀 Starting SEO Verification...');

    await checkUrl('/robots.txt', 'User-agent: *');
    // Sitemap might need build/start to work dynamically on some nextjs versions but we check route
    await checkUrl('/sitemap.xml', 'xml');

    await checkUrl('/manifesto', 'مانیفست معنا');
    await checkUrl('/gift/wedding', 'نخل پیوند');
    await checkUrl('/gift/birthday', 'نخل میلاد');

    // For Deed, we need a valid ID to verify 200, otherwise 404 is correct.
    // We can't easily guess a valid ID without DB access.
    await checkUrl('/deed/invalid-id', '');

    console.log('🏁 Verification Complete.');
}

verify();
