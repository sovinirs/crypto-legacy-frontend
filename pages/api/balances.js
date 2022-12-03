// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default async function handler(req, res) {
  if (req.method == "GET") {
    const baseUrl = `https://api.covalenthq.com/v1/${req.query.chainId}/address`;
    //const baseUrl = `https://api.covalenthq.com/v1/137/address`;
    const keyPrefix = "balances_v2/?key=ckey_b1a3a6791c044383bcf962a3948";

    try {
      const covalentBalances = await fetch(
        `${baseUrl}/${req.query.ethAddress}/${keyPrefix}`
      );
      const balanceData = await covalentBalances.json();
      res.status(200).json(balanceData);
    } catch (e) {
      res.status(500).json({ error: e });
    }
  }
}
