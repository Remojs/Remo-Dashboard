const cron = require('node-cron');
const websiteService = require('../services/websiteService');

/**
 * Monitoring cron job — runs every 5 minutes.
 * Checks all registered websites and persists results.
 */
const startMonitoringJob = () => {
  // '*/5 * * * *' → every 5 minutes
  const job = cron.schedule('*/5 * * * *', async () => {
    const timestamp = new Date().toISOString();
    console.log(`[Monitor] Running check at ${timestamp}`);

    try {
      const results = await websiteService.checkAndStore(null);
      console.log(`[Monitor] Checked ${results.length} website(s).`);
    } catch (err) {
      // Don't crash the server on check failures
      console.error('[Monitor] Error during scheduled check:', err.message);
    }
  });

  job.start();
  console.log('⏱  Website monitoring cron job started (every 5 minutes).');
  return job;
};

module.exports = { startMonitoringJob };
