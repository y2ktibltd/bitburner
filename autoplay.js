/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.tail();

  var target = getTarget(ns);
  var home = ns.getHostname();
  var minSecurity = ns.getServerMinSecurityLevel(target);
  var maxMoney = ns.getServerMaxMoney(target);

  ns.killall(home);

  getRoot(ns);
  runDeploy(ns);

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
  var threads = Math.floor((ns.getServerMaxRam(home)-ns.getServerUsedRam(home))/ns.getScriptRam(script))-4;
  if (threads > 0) {
    ns.exec(script,home,threads,target);
    while (ns.scriptRunning(script,home)) {
      await ns.sleep(50);
    }
  }
}

export function getList(ns) {
  let hosts = new Set(["home"]);
  hosts.forEach(h => (ns.scan(h).forEach(n => hosts.add(n))));
  return Array.from(hosts);
}

export function getTarget(ns) {
  var score = 0;
  var target = "";
  var servers = getList(ns);
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

export function runDeploy(ns) {
  var servers = getList(ns);
  var target = getTarget(ns);
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

export function getRoot(ns) {
  var targets = getList(ns);
  for (let i = 0; i < targets.length; i++) {
    var target = targets[i];
    if (ns.hasRootAccess(target) == false) {
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
