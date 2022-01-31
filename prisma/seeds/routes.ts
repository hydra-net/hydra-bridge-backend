export const routes = [
  {
    // id: 1,
    chain_from_id: 1, // Mainnet
    chain_to_id: 2, // Polygon
    bridge_id: 1,
  },
  {
    // id: 2,
    chain_from_id: 2, // Polygon
    chain_to_id: 1, // Mainnet,
    bridge_id: 1,
  },
  {
    // id: 3,
    chain_from_id: 1, // Mainnet
    chain_to_id: 2, // Polygon
    bridge_id: 2,
  },
  {
    // id: 4,
    chain_from_id: 2, // Polygon
    chain_to_id: 1, // Mainnet,
    bridge_id: 2,
  },
  {
    // id: 5,
    chain_from_id: 3, // Polygon mumbai
    chain_to_id: 4, // Goerli
    bridge_id: 3,
  },
  {
    // id: 6,
    chain_from_id: 4, // Goerli
    chain_to_id: 3, // Poygon mumbai
    bridge_id: 3,
  },
  {
    // id: 7,
    chain_from_id: 3, // Polygon mumbai
    chain_to_id: 4, // Goerli
    bridge_id: 4,
  },
  {
    // id: 8,
    chain_from_id: 4, // Goerli
    chain_to_id: 3, // Poygon mumbai
    bridge_id: 4,
  },
  {
    // id: 9,
    chain_from_id: 1, // Mainnet
    chain_to_id: 5, // Arbitrum
    bridge_id: 2,
  },
  {
    // id: 10,
    chain_from_id: 1, // Mainnet
    chain_to_id: 6, // Optimism
    bridge_id: 2,
  },
];
