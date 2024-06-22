import { Manager } from "./manager.js";
import { ConfigDataService } from "./services/ConfigDataService.js";
const configData = new ConfigDataService().data;
configData.bot.TOKEN.forEach((token, index) => {
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
});
