import {list} from "list.js"
/** @param {NS} ns */
export async function main(ns) {
  var servers = list(ns);
  var target = ns.args[0];
  for (let server of servers) {
    if (server!="home") {
      ns.killall(server);
      ns.scp("swarm.js", server, "home");
      var threads = Math.floor(ns.getServerMaxRam(server)/ns.getScriptRam("swarm.js"));
        if (threads>=1 && ns.hasRootAccess(server)) {
          ns.exec("swarm.js", server, threads, target,ns.getServerMinSecurityLevel(target),ns.getServerMaxMoney(target));
        }
    }
  }
}
