const { accounts } = require('@openzeppelin/test-environment');
const { farm } = require('../../index');
const { assert } = require('chai');

describe('MasterAnimal', function () {
//   const [owner, feeTo, alice, bob, carol] = accounts;

  beforeEach(async () => {
    const {
    //   treatToken,
    //   treatSplitBar,
      masterAnimal,
    } = await farm.deployMockFarm(accounts); // accounts passed will be used in the deployment
    this.masterAnimal = masterAnimal;
  });

  it('should have proper pool length', async () => {
    assert.equal((await this.masterAnimal.poolLength()).toString(), '1');
  });
});
