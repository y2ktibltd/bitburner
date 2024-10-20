import {list} from "list.js"
/** @param {NS} ns */
export async function main(ns) {
  getTarget;
}

export function getTarget(ns) {
  var score = 0;
  var target = "";
  var servers = list(ns);
  for (let server of servers) {
    if (ns.hasRootAccess(server)) {
      var chance = ns.getServerMaxMoney(server)/ns.getWeakenTime(server)*ns.hackAnalyzeChance(server);
      if (score < chance) {
        score = chance;
        target = server;
      }
    }
  }
  return target;
}
