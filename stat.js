import {list} from "list.js"
/** @param {NS} ns */
export async function main(ns) {
  if (ns.args[0]!=null) {
    var targets = [ns.args[0]];
  } else {
    var targets = list(ns);
  }
  var servers = [];
  for (let target of targets) {
    if (ns.hasRootAccess(target) && ns.getServerMaxMoney(target)>0) {
      servers.push(ns.getServer(target));
    }
  }
  if (targets.length > 1) {
    var sortChoice = await ns.prompt("What item do you want to sort by.",{type: "select", choices: Object.keys(servers[0])});
    var ascendDescend = await ns.prompt("In ascending or descending order.",{type: "select", choices: ["ascend","descend"]});
    if (ascendDescend=="ascend") {
      servers.sort((a,b)=> a[sortChoice] - b[sortChoice]);
    } else {
      servers.sort((a,b)=> b[sortChoice] - a[sortChoice]);
    }
  }
  for (var server of servers) {
    for (let key in server) {
      if (key.includes("money")) {
        ns.tprint(key + ": " + ns.nFormat(Number(server[key]),"$0.000a"));
      } else {
        ns.tprint(key + ": " + server[key]);
      }
    }
    ns.tprint("Hack chance: " + Math.floor(ns.hackAnalyzeChance(server["hostname"])*100) + "%");
    ns.tprint("Hack time: " + Math.floor(ns.getHackTime(server["hostname"])/1000) + " seconds");
    ns.tprint("Grow time: " + Math.floor(ns.getGrowTime(server["hostname"])/1000) + " seconds");
    ns.tprint("Weak time: " + Math.floor(ns.getWeakenTime(server["hostname"])/1000) + " seconds");
    ns.tprint("");
  }
  ns.tprint("Total number of servers with root access and money avail: " + servers.length);
}
