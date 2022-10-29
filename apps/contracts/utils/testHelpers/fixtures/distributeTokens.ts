import { ethers } from 'hardhat';
import {
  MIC_ADDRESS,
  MIC_WHALE,
  USDC_ADDRESS,
  USDC_WHALE,
  WETH_ADDRESS,
  WETH_WHALE,
} from '../../constants';

const ONE_THOUSAND = ethers.utils.parseUnits('1000', 'ether');
const ONE_HUNDRED = ethers.utils.parseUnits('100', 'ether');

export async function distributeTokens() {
  const [user1, user2] = await ethers.getSigners();
  const micToken = await ethers.getContractAt('IERC20', MIC_ADDRESS);
  const usdcToken = await ethers.getContractAt('IERC20', USDC_ADDRESS);
  const wethToken = await ethers.getContractAt('IERC20', WETH_ADDRESS);

  const micWhale = await ethers.getImpersonatedSigner(MIC_WHALE);
  await micToken.connect(micWhale).transfer(user1.address, ONE_THOUSAND);
  await micToken.connect(micWhale).transfer(user2.address, ONE_THOUSAND);
  const usdcWhale = await ethers.getImpersonatedSigner(USDC_WHALE);
  await usdcToken
    .connect(usdcWhale)
    .transfer(user1.address, ethers.utils.parseUnits('1000', 6));
  await usdcToken
    .connect(usdcWhale)
    .transfer(user2.address, ethers.utils.parseUnits('1000', 6));

  const wethWhale = await ethers.getImpersonatedSigner(WETH_WHALE);
  await wethToken.connect(wethWhale).transfer(user1.address, ONE_HUNDRED);
  await wethToken.connect(wethWhale).transfer(user2.address, ONE_HUNDRED);

  return {
    micToken,
    usdcToken,
    wethToken,
  };
}
