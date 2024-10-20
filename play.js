import {getTarget} from "target.js"
/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.tail();
  if (ns.args[0]==null) {
    var target = getTarget(ns);
  } else {
    var target = ns.args[0];
  }
  var home = ns.getHostname();
  ns.killall(home);
  var minSecurity = ns.getServerMinSecurityLevel(target);
  var maxMoney = ns.getServerMaxMoney(target);
  await pauseAfterScript(ns,"root.js",home,target);
  await pauseAfterScript(ns,"deploy.js",home,target);
  ns.print("Attacking " + target + " with swarm");
  while (true) {
    if (ns.getServerSecurityLevel(target) > minSecurity + 5) {
      await pauseAfterScript(ns,"weak.js",home,target);
    }
    else if (ns.getServerMoneyAvailable(target) < maxMoney * 0.85) {
      await pauseAfterScript(ns,"grow.js",home,target);
    }
    else {
      await pauseAfterScript(ns,"hack.js",home,target);
    }
    while (ns.peek(69420)!="NULL PORT DATA") {
      ns.print(ns.readPort(69420));
    }
  }
}

async function pauseAfterScript(ns,script,home,target) {
  var threads = Math.floor((ns.getServerMaxRam(home)-ns.getServerUsedRam(home))/ns.getScriptRam(script))-4;
  if (threads > 0) {
    ns.exec(script,home,threads,target);
    while (ns.scriptRunning(script,home)) {
      await ns.sleep(50);
    }
  }
}
