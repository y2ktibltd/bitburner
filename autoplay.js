/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.killall(home);
  ns.tail();
  var home = ns.getHostname();
  getRoot(ns, home);

  if (ns.args[0] == null) {
    var target = getTarget(ns, home);
  } else {
    var target = ns.args[0];
  }

  var script = "swarm.js";
  var minSecurity = ns.getServerMinSecurityLevel(target);
  var maxMoney = ns.getServerMaxMoney(target);
  runDeploy(ns, home, script, target);
  ns.print("Attacking " + target + " with swarm");

  while (true) {
    if (ns.getServerSecurityLevel(target) > minSecurity + 5) {
      await pauseAfterScript(ns, "weak.js", home, target);
    }
    else if (ns.getServerMoneyAvailable(target) < maxMoney * 0.9) {
      await pauseAfterScript(ns, "grow.js", home, target);
    }
    else {
      await pauseAfterScript(ns, "hack.js", home, target);
    }
    while (ns.peek(69420) != "NULL PORT DATA") {
      ns.print(ns.readPort(69420));
    }
  }
}
//WIP
async function runScriptsSequentially(ns, script, home, target) {
  switch (script) {
    case "hack.js": {
      var threads = Math.floor(ns.hackAnalyzeThreads(target, ns.getServerMoneyAvailable(target) * 0.1));
      break;
    }
    case "grow.js": {
      var grwThreads = Math.floor(ns.growthAnalyze(target, 100 - ((ns.getServerMoneyAvailable(target) / ns.getServerMaxMoney(target)) * 100), ns.getServer(home)["cpuCores"]));
      if (grwThreads < threads) {
        var threads = grwThreads;
      }
      break;
    }
    case "weak.js": {
      var wkThreads = Math.floor((ns.getServerSecurityLevel(target) - ns.getServerMinSecurityLevel(target)) / ns.weakenAnalyze(1, ns.getServer(home)["cpuCores"]));;
      if (wkThreads < threads) {
        var threads = wkThreads;
      } else if (wkThreads < 0) {
        var threads = 1;
      }
      break;
    }
  }
  var scriptRam = threads * ns.getScriptRam(script);
  if (scriptRam < ns.getServerMaxRam(home)-ns.getServerUsedRam(home) && threads > 0) {
    ns.exec(script, home, threads, target);
  }
}


async function pauseAfterScript(ns, script, home, target) {
  var threads = Math.floor((ns.getServerMaxRam(home) - ns.getServerUsedRam(home)) / ns.getScriptRam(script));
  if (threads > 0) {
    switch (script) {
      case "hack.js": {
        threads = Math.floor(ns.hackAnalyzeThreads(target, ns.getServerMoneyAvailable(target) * 0.1));
        break;
      }
      case "grow.js": {
        var grwThreads = Math.floor(ns.growthAnalyze(target, 100 - ((ns.getServerMoneyAvailable(target) / ns.getServerMaxMoney(target)) * 100), ns.getServer(home)["cpuCores"]));
        if (grwThreads < threads) {
          threads = grwThreads;
        }
        break;
      }
      case "weak.js": {
        var wkThreads = Math.floor((ns.getServerSecurityLevel(target) - ns.getServerMinSecurityLevel(target)) / ns.weakenAnalyze(1, ns.getServer(home)["cpuCores"]));;
        if (wkThreads < threads) {
          threads = wkThreads;
        } else if (wkThreads < 0) {
          threads = 1;
        }
        break;
      }
    }
    ns.exec(script, home, threads, target);
    while (ns.scriptRunning(script, home)) {
      await ns.sleep(50);
    }
  }
}

export function getList(ns, home) {
  let hosts = new Set([home]);
  hosts.forEach(h => (ns.scan(h).forEach(n => hosts.add(n))));
  return Array.from(hosts);
}

export function getTarget(ns, home) {
  var servers = getList(ns, home);
  var score = 0;
  var target = "";
  for (let server of servers) {
    if (ns.hasRootAccess(server) && ns.getServerMaxRam(server) > 0 && server != home) {
      var chance = ns.getServerMaxMoney(server) / ns.getWeakenTime(server) * ns.hackAnalyzeChance(server);
      if (score < chance) {
        score = chance;
        target = server;
      }
    }
  }
  return target;
}

export function runDeploy(ns, home, script, target) {
  var servers = getList(ns, home);
  for (let server of servers) {
    if (server != home) {
      ns.killall(server);
      ns.scp(script, server, home);
      var threads = Math.floor(ns.getServerMaxRam(server) / ns.getScriptRam(script));
      if (threads >= 1 && ns.hasRootAccess(server)) {
        ns.exec(script, server, threads, target, ns.getServerMinSecurityLevel(target), ns.getServerMaxMoney(target));
      }
    }
  }
}

export function getRoot(ns, home) {
  var targets = getList(ns, home);
  for (let target of targets) {
    if (!ns.hasRootAccess(target) && ns.getServerMaxRam(target) > 0 && target != home) {
      if (ns.getHackingLevel() >= ns.getServer(target)["requiredHackingSkill"]) {
        if (ns.getServer(target)["numOpenPortsRequired"] > ns.getServer(target)["openPortCount"]) {
          if (ns.fileExists('BruteSSH.exe')) {
            ns.brutessh(target);
          }
          if (ns.fileExists('FTPCrack.exe')) {
            ns.ftpcrack(target);
          }
          if (ns.fileExists('relaySMTP.exe')) {
            ns.relaysmtp(target);
          }
          if (ns.fileExists('HTTPWorm.exe')) {
            ns.httpworm(target);
          }
          if (ns.fileExists('SQLInject.exe')) {
            ns.sqlinject(target);
          }
        }
        if (ns.getServer(target)["openPortCount"] >= ns.getServer(target)["numOpenPortsRequired"]) {
          ns.nuke(target);
        }
      }
    }
  }
}
