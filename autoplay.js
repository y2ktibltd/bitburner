/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.tail();

  var home = ns.getHostname();
  var target = getTarget(ns,home);
  var minSecurity = ns.getServerMinSecurityLevel(target);
  var maxMoney = ns.getServerMaxMoney(target);
  var script = "swarm.js";

  ns.killall(home);
  getRoot(ns,home);
  runDeploy(ns,home,script);

  ns.print("Attacking " + target + " with swarm");
  
  while (true) {
    if (ns.getServerSecurityLevel(target) > minSecurity + 5) {
      await pauseAfterScript(ns,"weak.js",home,target);
    }
    else if (ns.getServerMoneyAvailable(target) < maxMoney * 0.9) {
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
  var threads = Math.floor((ns.getServerMaxRam(home)-ns.getServerUsedRam(home))/ns.getScriptRam(script))-10;
  if (threads > 0) {
    ns.exec(script,home,threads,target);
    while (ns.scriptRunning(script,home)) {
      await ns.sleep(50);
    }
  }
}

export function getList(ns,home) {
  let hosts = new Set([home]);
  hosts.forEach(h => (ns.scan(h).forEach(n => hosts.add(n))));
  return Array.from(hosts);
}

export function getTarget(ns,home) {
  var score = 0;
  var target = "";
  var servers = getList(ns,home);
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

export function runDeploy(ns,home,script) {
  var servers = getList(ns,home);
  var target = getTarget(ns,home);
  for (let server of servers) {
    if (server!=home) {
      ns.killall(server);
      ns.scp(script, server, home);
      var threads = Math.floor(ns.getServerMaxRam(server)/ns.getScriptRam(script));
      if (threads>=1 && ns.hasRootAccess(server)) {
        ns.exec(script, server, threads, target,ns.getServerMinSecurityLevel(target),ns.getServerMaxMoney(target));
      }
    }
  }
}

export function getRoot(ns,home) {
  var targets = getList(ns,home);
  for (let i = 0; i < targets.length; i++) {
    var target = targets[i];
    if (ns.hasRootAccess(target) == false) {
      if (ns.getHackingLevel() >= ns.requiredHackingSkill(target)) {
        if (ns.numOpenPortsRequired(target) > ns.openPortCount(target)) {
          try {
            ns.brutessh(target);
            ns.ftpcrack(target);
            ns.relaysmtp(target);
            ns.httpworm(target);
            ns.sqlinject(target);
            ns.nuke(target);
          } catch(Error) {
            ns.print("Error: " + Error + " hacking " + target);
          }
        }
      }
    }
  }
}
