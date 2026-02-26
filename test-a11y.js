const puppeteer = require('puppeteer');
const { AxePuppeteer } = require('@axe-core/puppeteer');

(async () => {
    console.log("Launching browser for WCAG Scan...");
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    try {
        const routesToTest = [
            '/dashboard',
            '/organizer-dashboard',
            '/create',
            '/profile',
            '/my-schedule',
            '/settings'
        ];

        for (const route of routesToTest) {
            console.log(`\nTesting ${route}...`);
            await page.goto(`http://localhost:5173${route}`, { waitUntil: 'networkidle2' });

            const results = await new AxePuppeteer(page)
                // Disable rules that fire because we bypassed auth missing data context
                .disableRules(['page-has-heading-one'])
                .analyze();

            console.log(`- Violations: ${results.violations.length}`);
            if (results.violations.length > 0) {
                results.violations.forEach(v => {
                    console.log(`   * ${v.id} (${v.nodes.length} occurrences) - ${v.description}`);
                });
            }
        }

    } catch (err) {
        console.error("Test failed:", err);
    } finally {
        await browser.close();
        console.log("\nTesting complete.");
    }
})();
