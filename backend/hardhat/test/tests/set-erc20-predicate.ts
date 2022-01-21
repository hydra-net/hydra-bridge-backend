import { expect } from "chai";
import { Contract } from "ethers";
import { erc20Predicate } from "../shared/constants";

export async function shouldSetErc20Predicate(hydraBridge: Contract) {
  const setErc20Predicate = await hydraBridge.setErc20Predicate(erc20Predicate);

  // wait until the transaction is mined
  await setErc20Predicate.wait();
  const _erc20Predicate = await hydraBridge._erc20Predicate();
  expect(_erc20Predicate).to.equal(erc20Predicate);
}
