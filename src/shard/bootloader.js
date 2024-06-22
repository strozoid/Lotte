import { Manager } from "../manager.js";
import { ConfigDataService } from "../services/ConfigDataService.js";
const configData = new ConfigDataService().data;
const index = Number(process.env.LOTTE_CURRENT_INDEX);
const token = String(process.env.LOTTE_CURRENT_TOKEN);
const lotte = new Manager(
  configData,
  index,
  configData.utilities.MESSAGE_CONTENT.enable
);
// Anti crash handling
process
  .on("unhandledRejection", (error) =>
    lotte.logger.unhandled("AntiCrash", error)
  )
  .on("uncaughtException", (error) =>
    lotte.logger.unhandled("AntiCrash", error)
  )
  .on("uncaughtExceptionMonitor", (error) =>
    lotte.logger.unhandled("AntiCrash", error)
  )
  .on("exit", () =>
    lotte.logger.info(
      "ClientManager",
      `Successfully Powered Off Lotte, Good Bye!`
    )
  )
  .on("SIGINT", () => {
    lotte.logger.info("ClientManager", `Powering Down Lotte...`);
    process.exit(0);
  });
lotte.start();
lotte.login(token);
