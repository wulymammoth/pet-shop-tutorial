pragma solidity ^0.5.0;

import 'truffle/Assert.sol';
import 'truffle/DeployedAddresses.sol';
import '../contracts/Adoption.sol';

contract TestAdoption {
  // address of adoption contract subject to testing
  Adoption adoption = Adoption(DeployedAddresses.Adoption());

  // id of the pet that will be tested
  uint expectedPetId = 8;

  // expected owner of the adopted pet
  address expectedAdopter = address(this);

  function testUserCanAdopt() public {
    uint returnedId = adoption.adopt(expectedPetId);
    Assert.equal(returnedId, expectedPetId, 'identifiers do not match');
  }

  function testGetAdopterAddressByPetId() public {
    address adopter = adoption.adopters(expectedPetId);
    Assert.equal(adopter, expectedAdopter, 'the adopter identifiers do not match');
  }
}
