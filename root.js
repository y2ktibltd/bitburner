import {list} from "list.js"
/** @param {NS} ns */
export async function main(ns) {
  var targets = list(ns);
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
