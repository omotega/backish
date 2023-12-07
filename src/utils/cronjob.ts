import cron from "node-cron";
import folderservices from "../services/folderservices";

const scheduleCleanupFolders = () => {
  cron.schedule("*/2 * * * *", async () => {
    try {
      const result = await folderservices.cleanupFolders();
      console.log(result);
    } catch (error: any) {
      console.error(error.message);
    }
  });
};

scheduleCleanupFolders();
