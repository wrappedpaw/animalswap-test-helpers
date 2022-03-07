const { contract } = require('@openzeppelin/test-environment');

// Setup DEX Contracts
const AnimalFactoryBuild = require('../build-animalswap/dex/contracts/AnimalFactory.json');
const AnimalFactory = contract.fromABI(AnimalFactoryBuild.abi, AnimalFactoryBuild.bytecode);
const AnimalPairBuild = require('../build-animalswap/dex/contracts/AnimalPair.json');
const AnimalPair = contract.fromABI(AnimalPairBuild.abi, AnimalPairBuild.bytecode);

// Setup Token Contracts
const ERC20MockBuild = require('../build-animalswap/token/contracts/ERC20Mock.json');
const ERC20Mock = contract.fromABI(ERC20MockBuild.abi, ERC20MockBuild.bytecode);

/**
 * @typedef {Object} DexDetails
 * @property {Contract} dexFactory The deployed AnimalFactory contract.
 * @property {Contract} mockWBNB The deployed MockWBNB contract.
 * @property {Array(Contract)} mockTokens Array of deployed mock token contracts.
 * @property {Array(Contract)} dexPairs Array of deployed pair token contracts.
 */

/**
 * Deploy a mock dex.
 *
 * @param {Array(string)} accounts Pass in the accounts array provided from @openzeppelin/test-environment
 * @param {number} numPairs Number of pairs to create
 * @returns {DexDetails}
 */
// NOTE: Currently does not create a TREAT/WBNB pair
async function deployMockDex ([owner, feeTo, alice], numPairs = 2) {
  const BASE_BALANCE = '1000' + '000000000000000000';
  // Setup DEX factory
  const dexFactory = await AnimalFactory.new(feeTo, { from: owner });

  // Setup pairs
  const mockWBNB = await ERC20Mock.new('Wrapped Native', 'WNative', { from: owner });
  const mockTokens = [];
  const dexPairs = [];
  for (let index = 0; index < numPairs; index++) {
    const mockToken = await ERC20Mock.new(`Mock Token ${index}`, `MOCK${index}`, { from: owner });

    // Mint pair tokens
    await mockWBNB.mint(BASE_BALANCE, { from: owner });
    await mockToken.mint(BASE_BALANCE, { from: owner });

    // Create an initial pair
    await dexFactory.createPair(mockWBNB.address, mockToken.address);
    const pairCreated = await AnimalPair.at(await dexFactory.allPairs(index));

    // Obtain LP Tokens
    await mockWBNB.transfer(pairCreated.address, BASE_BALANCE, { from: owner });
    await mockToken.transfer(pairCreated.address, BASE_BALANCE, { from: owner });
    await pairCreated.mint(alice);

    dexPairs.push(pairCreated);
    mockTokens.push(mockToken);
  }

  return {
    dexFactory,
    mockWBNB,
    mockTokens,
    dexPairs,
  };
}

module.exports = { deployMockDex };
