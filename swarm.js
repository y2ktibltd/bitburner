/** @param {NS} ns */
export async function main(ns) {
 while (true) {
   let server = ns.args[0];
   if (ns.getServerSecurityLevel(server) > ns.args[1] + 5) {
     await ns.weaken(server);
   }
   else if (ns.getServerMoneyAvailable(server) < ns.args[2]) {
     await ns.grow(server);
   }
   else {
    await ns.sleep(10);
   }
 }
}
