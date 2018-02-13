// Copyright 2018 Energy Web Foundation
// This file is part of the Origin Application brought to you by the Energy Web Foundation,
// a global non-profit organization focused on accelerating blockchain technology across the energy sector, 
// incorporated in Zug, Switzerland.
//
// The Origin Application is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// This is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY and without an implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details, at <http://www.gnu.org/licenses/>.
//
// @authors: slock.it GmbH, Heiko Burkhardt, heiko.burkhardt@slock.it

var AssetRegistryLogic = artifacts.require("AssetRegistryLogic");
var AssetRegistryDB = artifacts.require("AssetRegistryDB");
var CoO = artifacts.require("CoO");

contract('AssetRegistryLogic', function (accounts) {

  var assetLog,
    assetDb,
    coo;

  it("should get the instances", async function () {
    assetLog = await AssetRegistryLogic.deployed();
    assetDb = await AssetRegistryDB.deployed();
    coo = await CoO.deployed()

    assert.isNotNull(assetLog)
    assert.isNotNull(assetDb)
    assert.isNotNull(coo)
  })

  it("should execute the constructor successfully", async function () { })

  it("should be initialized successfully", async function () {
    assert.equal(await assetLog.db.call(), AssetRegistryDB.address)
  })

  it("should register an asset with an existing owner", async function () {
    await assetLog.registerAsset(
      accounts[9],
      accounts[0],
      0,
      1234567890,
      100000,
      1,
      0,
      true,
      '0x0000000000000000000000000000000000000000000000000000000000000001',
      { from: accounts[2] }
    )

    const asset = await assetLog.getAsset.call(0)
    assert.equal(asset[0], accounts[9])
    assert.equal(asset[1], accounts[0])
    assert.equal(asset[2], 0)
    assert.equal(asset[3], 1234567890)
    assert.equal(asset[4], 100000)
    assert.equal(asset[5], 1)
    assert.equal(asset[6], 0)
    assert.equal(asset[7], true)
    assert.equal(asset[8], '0x0000000000000000000000000000000000000000000000000000000000000001')

  })

  it("should not register an asset with a non existing owner", async function () {
    let failed = false

    try {
      await assetLog.registerAsset(accounts[9], accounts[2], 0, 1234567890, 100000, 1, 0, true, { from: accounts[2] })
      if (tx.receipt.status == '0x00') failed = true

    } catch (ex) {
      failed = true
    }
    assert.isTrue(failed)
  })

  it("should log data", async function () {
    const tx = await assetLog.saveSmartMeterRead(
      0,
      201,
      '0x0000000000000000000000000000000000000000000000000000000000000001',
      { from: accounts[9] }
    )
    const asset = await assetLog.getAsset.call(0)
    assert.equal(asset[1], accounts[0])
    assert.equal(asset[2], 0)
    assert.equal(asset[3], 1234567890)
    assert.equal(asset[4], 100000)
    assert.equal(asset[5], 201)
    assert.equal(asset[6], 0)
    assert.equal(asset[7], true)
    assert.equal(asset[8], '0x0000000000000000000000000000000000000000000000000000000000000001')

  })

  it("other account than smart meter should not log data", async function () {
    let failed = false
    try {
      const tx = await assetLog.logData(0, 201, { from: accounts[8] })
      if (tx.receipt.status == '0x00') failed = true

    } catch (ex) {
      failed = true
    }
    assert.isTrue(failed)

  })


  it("should retire an asset", async function () {
    await assetLog.setActive(0, false, { from: accounts[2] })
    const asset = await assetLog.getAsset.call(0)
    assert.equal(asset[7], false)

  })

  it("smart meter should not be able to log data for a retired asset ", async function () {
    let failed = false
    try {
      const tx = await assetLog.logData(0, 401, { from: accounts[9] })
      if (tx.receipt.status == '0x00') failed = true

    } catch (ex) {
      failed = true
    }
    assert.isTrue(failed)

  })

  it("should update correctly", async function () { })

})