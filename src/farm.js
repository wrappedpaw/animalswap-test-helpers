const { contract } = require('@openzeppelin/test-environment');

// Setup Farm Contracts
const TreatTokenBuild = require('../build-animalswap/farm/contracts/TreatToken.json');
const TreatToken = contract.fromABI(TreatTokenBuild.abi, TreatTokenBuild.bytecode);
const TreatSplitBarBuild = require('../build-animalswap/farm/contracts/TreatSplitBar.json');
const TreatSplitBar = contract.fromABI(TreatSplitBarBuild.abi, TreatSplitBarBuild.bytecode);
const MasterAnimalBuild = require('../build-animalswap/farm/contracts/MasterAnimal.json');
const MasterAnimal = contract.fromABI(MasterAnimalBuild.abi, MasterAnimalBuild.bytecode);

/**
 * @typedef {Object} FarmDetails
 * @property {Contract} treatToken The deployed TreatToken contract.
 * @property {Contract} treatSplitBar The deployed TreatSplitBar contract.
 * @property {Contract} masterAnimal The deployed MasterAnimal contract.
 */

/**
 * Deploy a mock farm.
 *
 * @param {Array(string)} accounts Pass in the accounts array provided from @openzeppelin/test-environment
 * @returns {FarmDetails}
 */
async function deployMockFarm ([owner, feeTo], {
  initialMint = '25000' + '000000000000000000',
  treatPerBlock = '10' + '000000000000000000',
}) {
  // Setup TreatToken
  const treatToken = await TreatToken.new({ from: owner });
  await treatToken.mint(owner, initialMint, { from: owner });
  // Setup TreatSplitBar
  const treatSplitBar = await TreatSplitBar.new(treatToken.address, { from: owner });

  // Setup MasterAnimal
  const masterAnimal = await MasterAnimal.new(
    treatToken.address,
    treatSplitBar.address,
    feeTo, // Dev fee getter
    treatPerBlock, // TREAT per block
    0, // Starting block number
    1, // multiplier
    { from: owner }
  );

  await treatToken.transferOwnership(masterAnimal.address, { from: owner });
  await treatSplitBar.transferOwnership(masterAnimal.address, { from: owner });

  return {
    treatToken,
    treatSplitBar,
    masterAnimal,
  };
}

/**
 * Add tokens to farms with an allocation of 100.
 *
 * @param {Array(string)} accounts Pass in the accounts array provided from @openzeppelin/test-environment
 * @param {Contract} masterAnimal MasterAnimal contract to add pairs to
 * @param {Array(string)} dexPairs Array of pairs to add to the MasterAnimal
 */
async function addPoolsToFarm ([owner], masterAnimal, dexPairs = []) {
  const BASE_ALLOCATION = 100;
  for (const dexPair of dexPairs) {
    await masterAnimal.add(BASE_ALLOCATION, dexPair.address, false, { from: owner });
  }
}

module.exports = { deployMockFarm, addPoolsToFarm };
