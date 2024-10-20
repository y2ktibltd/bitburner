/** @param {NS} ns */
export async function main(ns) {
    list;
  }
export function list(ns) {
  let hosts = new Set(["home"]);
  hosts.forEach(h => (ns.scan(h).forEach(n => hosts.add(n))));
  return Array.from(hosts);
}
