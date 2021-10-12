App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
    App.web3Provider = window.ethereum;
    try {
      // request account access (modern dapp browsers or MetaMask will inject
      // an ethereum provider on the window object
      await window.ethereum.enable();
    } catch(error) {
      // user denied account access
      console.error('User does not have access rights');
    } else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Adoption.json', function(data) {
      // obtain adoption artifact and instantiate a truffle contract
      // - the artifact includes info about the deployed address and ABI
      App.contracts.Adoption = TruffleContract(data);
      // set the provider for the contract
      App.contracts.Adoption.setProvider(App.web3Provider);
      // use the contract to retrieve and mark the adopted pets
      return App.markAdopted();
    });
    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  markAdopted: function() {
    var adoptionInstance;
    App.contracts.Adoption.deployed().then(function(instance) {
      return instance.getAdopters.call() // read data from blockchain without sending a transaction
    }).then(function(adopters) {
      adopters.forEach(function(adopter, idx) {
        if (adopter != '0x0000000000000000000000000000000000000000') {
          $('.panel-pet').eq(idx).find('button').text('Success').attr('disabled', true);
        }
      })
    }).catch(function(err) {
      console.error(err.message)
    });
  },

  handleAdopt: function(event) {
    event.preventDefault();
    var petId = parseInt($(event.target).data('id'));
    var adoptionInstance;
    web3.eth.getAccounts(function(err, accounts) {
      if (err) console.error(err);
      var account = accounts[0];
      App.contracts.Adoption.deployed().then(function(instance) {
        // execute adopt as a transaction by sending account
        return instance.adopt(petId, { from: account });
      }).then(function(result) {
        return App.markAdopted();
      }).catch(function(err) {
        console.error(err.message);
      });
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
