import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { Keypair, SystemProgram } from '@solana/web3.js';
import { expect } from 'chai';
import { Puppet } from '../target/types/puppet';
import { PuppetMaster } from '../target/types/puppet_master';

describe('puppet', () => {
  anchor.setProvider(anchor.Provider.env());

  const puppetProgram = anchor.workspace.Puppet as Program<Puppet>;
  const puppetMasterProgram = anchor.workspace.PuppetMaster as Program<PuppetMaster>;

  const puppetKeypair = Keypair.generate();
  const authorityKeypair = Keypair.generate();

  it('Does CPI!', async () => {
    await puppetProgram.rpc.initialize(authorityKeypair.publicKey, {
      accounts: {
        puppet: puppetKeypair.publicKey,
        user: anchor.getProvider().wallet.publicKey,
        systemProgram: SystemProgram.programId
      },
      signers: [puppetKeypair]
    });

    await puppetMasterProgram.rpc.pullStrings(new anchor.BN(42),{
      accounts: {
        puppetProgram: puppetProgram.programId,
        puppet: puppetKeypair.publicKey,
        authority: authorityKeypair.publicKey
      },
      signers: [authorityKeypair]
    })

    expect((await puppetProgram.account.data
      .fetch(puppetKeypair.publicKey)).data.toNumber()).to.equal(42);
  });
});
