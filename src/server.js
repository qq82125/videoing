import { createAppServer } from "./server/http.js";
import { host, port, envValue } from "./server/workflow.js";

export * from "./server/workflow.js";

const server = createAppServer();

if (envValue("NO_LISTEN") !== "1") {
  server.listen(port, host, () => {
    console.log(`IVD video workflow running at http://${host}:${port}`);
  });
}
