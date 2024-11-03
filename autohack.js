/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.killall(home);
  ns.clearPort(69420);
  ns.tail();
  var home = ns.getHostname();
  getRoot(ns, home);
  var autokill = false;

  if (ns.args[0] == null) {
    var numberTargets = 3;
    var targets = getTargets(ns, home, numberTargets);
  } else if (ns.args[0] == "ALL") {
    if (ns.args[1]==null) {
      var numberTargets = 99;  
    } else {
      var numberTargets = ns.args[1];
    }
    var targets = getTargets(ns, home, numberTargets);
  } else if (ns.args[0] != null && ns.args[1] == null) {
    var targets = [ns.args[0]];
    var autokill = true;
  } else {
    ns.tprint("improper use of arguments!")
    ns.exit();
  }

  runDeploy(ns, home, "swarm.js", targets[targets.length-1]);
  ns.print("Attacking " + targets + " with swarm");
    
  while (true) {
    for (let target of targets) {
      var minSecurity = ns.getServerMinSecurityLevel(target);
      var maxMoney = ns.getServerMaxMoney(target);
      var freeRam = Math.floor(ns.getServerMaxRam(home) - ns.getServerUsedRam(home));
      if (freeRam > 0) {
        if (ns.getServerSecurityLevel(target) > minSecurity + 5) {
          await runScripts(ns, "weak.js", home, target, autokill);
        }
        else if (ns.getServerMoneyAvailable(target) < maxMoney * 0.9) {
          await runScripts(ns, "grow.js", home, target, autokill);
        }
        else {
          await runScripts(ns, "hack.js", home, target, autokill);
        }
        while (ns.peek(69420) != "NULL PORT DATA") {
          var logs = ns.readPort(69420);
          for (let log of logs) {
            ns.print(log);
          }
        }
      }
      await ns.sleep(10);
    }
    ns.tail
  }
}

async function runScripts(ns, script, home, target, autokill) {
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
  if (scrptThreads > maxThreads || autokill) {
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

function getList(ns, home) {
  let hosts = new Set([home]);
  hosts.forEach(h => (ns.scan(h).forEach(n => hosts.add(n))));
  return Array.from(hosts);
}

function getTargets(ns, home, numberTargets) {
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

function runDeploy(ns, home, script, target) {
  ns.rm("weak.js");
  ns.rm("hack.js");
  ns.rm("grow.js");
  createFile(ns, "weak.js", weakScript);
  createFile(ns, "hack.js", hackScript);
  createFile(ns, "grow.js", growScript);
  createFile(ns, "swarm.js", swarmScript);
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
  ns.rm("swarm.js");
}

function getRoot(ns, home) {
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

function createFile(ns, filename, fileText) {
  ns.write(filename, fileText, "w");
}

var weakScript = "\
/** @param {NS} ns */\n\
export async function main(ns) {\n\
  await ns.weaken(ns.args[0]);\n\
  ns.writePort(69420,ns.getScriptLogs());\n\
}";

var hackScript = "\
/** @param {NS} ns */\n\
export async function main(ns) {\n\
  await ns.hack(ns.args[0]);\n\
  ns.writePort(69420,ns.getScriptLogs());\n\
}";

var growScript = "\
/** @param {NS} ns */\n\
export async function main(ns) {\n\
  await ns.grow(ns.args[0]);\n\
  ns.writePort(69420,ns.getScriptLogs());\n\
}";

var swarmScript = "\
/** @param {NS} ns */\n\
export async function main(ns) {\n\
  while (true) {\n\
    let server = ns.args[0];\n\
    if (ns.getServerSecurityLevel(server) > ns.args[1] + 5) {\n\
      await ns.weaken(server);\n\
    }\n\
    else if (ns.getServerMoneyAvailable(server) < ns.args[2]) {\n\
      await ns.grow(server);\n\
    }\n\
    else {\n\
      await ns.sleep(10);\n\
    }\n\
  }\n\
}";
