/** @param {NS} ns */
export async function main(ns) {
  await ns.weaken(ns.args[0]);
  ns.writePort(69420,ns.getScriptLogs()[0]);
  ns.writePort(69420,ns.getScriptLogs()[1]);
}
