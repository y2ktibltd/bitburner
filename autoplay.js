/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.killall(home);
  ns.tail();
  var home = ns.getHostname();
  getRoot(ns, home);

  if (ns.args[0] == null) {
    var numberTargets = 3;
    var targets = getTargets(ns, home, numberTargets);
  } else if (ns.args[0]=="ALL") {
    var numberTargets = ns.args[1];
    var targets = getTargets(ns, home, numberTargets);
  } else if (ns.args[0]!=null && ns.args[1]==null) {
    var targets = [ns.args[0]];
  } else {
    ns.tprint("improper use of arguments!")
    ns.exit();
  }

  var script = "swarm.js";
  runDeploy(ns, home, script, targets[0]);

  ns.print("Attacking " + targets + " with swarm");

  while (true) {
    for (let target of targets) {
      var minSecurity = ns.getServerMinSecurityLevel(target);
      var maxMoney = ns.getServerMaxMoney(target);
      var freeRam = Math.floor(ns.getServerMaxRam(home) - ns.getServerUsedRam(home));
      if (freeRam > 0) {
        if (ns.getServerSecurityLevel(target) > minSecurity + 5) {
          await runScripts(ns, "weak.js", home, target);
        }
        else if (ns.getServerMoneyAvailable(target) < maxMoney * 0.9) {
          await runScripts(ns, "grow.js", home, target);
        }
        else {
          await runScripts(ns, "hack.js", home, target);
        }
        while (ns.peek(69420) != "NULL PORT DATA") {
          ns.print(ns.readPort(69420));
        }
      }
      await ns.sleep(10);
    }
    ns.tail
  }
}

async function runScripts(ns, script, home, target) {
  var maxThreads = Math.floor((ns.getServerMaxRam(home) - ns.getServerUsedRam(home)) / ns.getScriptRam(script));
  switch (script) {
    case "hack.js": {
      var scrptThreads = Math.floor(ns.hackAnalyzeThreads(target, ns.getServerMoneyAvailable(target) * 0.1));
      break;
    }
    case "grow.js": {
      var scrptThreads = Math.floor(ns.growthAnalyze(target, 100 - ((ns.getServerMoneyAvailable(target) / ns.getServerMaxMoney(target)) * 100), ns.getServer(home)["cpuCores"]));
      break;
    }
    case "weak.js": {
      var scrptThreads = Math.floor((ns.getServerSecurityLevel(target) - ns.getServerMinSecurityLevel(target)) / ns.weakenAnalyze(1, ns.getServer(home)["cpuCores"]));;
      break;
    }
  }
  if (scrptThreads > maxThreads) {
    scrptThreads = maxThreads;
  } 
  if (scrptThreads <= 0) {
    await ns.sleep(10);
    return;
  }
  if (!ns.isRunning(script, home, target)) {
    ns.print("Running " + script + " with " + scrptThreads + "/" + maxThreads + " threads against " + target);
    ns.exec(script, home, scrptThreads, target);
  } else {
    await ns.sleep(10);
  }
}

async function pauseAfterScript(ns, script, home, target) {
  var threads = Math.floor((ns.getServerMaxRam(home) - ns.getServerUsedRam(home)) / ns.getScriptRam(script));
  ns.exec(script, home, threads, target);
  while (ns.scriptRunning(script, home)) {
    await ns.sleep(50);
  }
}

export function getList(ns, home) {
  let hosts = new Set([home]);
  hosts.forEach(h => (ns.scan(h).forEach(n => hosts.add(n))));
  return Array.from(hosts);
}

export function getTargets(ns, home, numberTargets) {
  var servers = getList(ns, home);
  var targets = [];
  for (let server of servers) {
    if (ns.hasRootAccess(server) && server != home && ns.getServerMaxMoney(server) > 0) {
      var score = Math.floor(ns.getServerMaxMoney(server) / ns.getWeakenTime(server) * ns.hackAnalyzeChance(server));
      targets.push({ server, score });
    }
  }
  targets.sort((a, b) => a.score - b.score);
  targets = targets.slice(-numberTargets).map(name => name.server);
  return targets;
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
    if (!ns.hasRootAccess(target) && (ns.getHackingLevel() >= ns.getServer(target)["requiredHackingSkill"]) && target != home) {
      try { ns.brutessh(target); } catch (Error) { }
      try { ns.ftpcrack(target); } catch (Error) { }
      try { ns.relaysmtp(target); } catch (Error) { }
      try { ns.httpworm(target); } catch (Error) { }
      try { ns.sqlinject(target); } catch (Error) { }
      try { ns.nuke(target); } catch (Error) { }
    }
  }
}
