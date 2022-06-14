// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

struct Season {
    uint startBlock;
    uint totalSupply;
    uint totalUsed;
}

struct CarbonInfo {
    uint claimed;
    uint used;
    uint buyed;
    uint locked;
}

struct SwapOrder {
    address from;
    uint amount;
    //uint value;
    address to;
    bool onSale;
}

struct Certificate {
    address issuer;
    string  ipfs;
    int    quota;
}

contract Carbon {
    address public governer;
    Season public carbonSeason;
    Season[] public carbonLedger;

    address[] public issuers;
    mapping(address => bool) public isIssuer;

    address[] public companies;
    mapping(address => Certificate[]) public companyCertificate;
    mapping(address => uint) public companyQuota;
    mapping(address => CarbonInfo) public companySeasonCarbon;
    mapping(address => int) public companyScore;
    SwapOrder[] public swapOrders;

    constructor(address _governer) {
        governer = _governer;
    }

    modifier onlyGoverner() {
        require(msg.sender == governer, "Only governer!");
        _;
    }

    modifier onlyIssuer() {
        require(isIssuer[msg.sender] == true, "Only issuer!");
        _;
    }

    event NewCarbonSeason(uint supply);
    event UploadCertificate(address company, int quota);
    event CarbonClaim(uint amount);
    event CarbonUse(uint amount);
    event OrderMake(uint amount);
    event OrderCancel(uint index, address from);
    event OrderBuy(uint index, address buyer, address from, uint amount);

    function addIssurers(address[] calldata _issuers) external onlyGoverner {
        for (uint i=0; i<_issuers.length; i++) {
            issuers.push(_issuers[i]);
            isIssuer[_issuers[i]] = true;
        }
    }


    function newCarbonSeason(uint _supply) external onlyGoverner {
        for (uint i=0; i<companies.length; i++) {
            scoreAndResetSeason(companies[i]);
        }
        delete swapOrders; // clear
        carbonLedger.push(carbonSeason);
        carbonSeason = Season(block.number, _supply, 0);
        emit NewCarbonSeason(_supply);
    }

    function scoreAndResetSeason(address company) internal {
        CarbonInfo memory carbon = companySeasonCarbon[company];
        if (carbon.claimed > 0) {
            companyScore[company] += int(carbon.claimed);
            companyScore[company] -= int(carbon.used);
            companySeasonCarbon[company] = CarbonInfo(0, 0, 0, 0);
        }
    }

    function uploadCertificate(address company, int quota, string calldata ipfs) external onlyIssuer {
        uint cq = companyQuota[company];
        if (quota < 0) {
            require(int(cq) - quota >= 0, "Negative quota!");
            companyQuota[company] = companyQuota[company] - uint(-quota);
        } else {
            companyQuota[company] = companyQuota[company] + uint(quota);
        }
        companyCertificate[company].push(Certificate(msg.sender, ipfs, quota));
        emit UploadCertificate(company, quota);
    }

    function claimCarbon(uint amount) external {
        require(carbonSeason.totalSupply >= carbonSeason.totalUsed + amount, "Exceed totalSupply");
        require(companyQuota[msg.sender] >= companySeasonCarbon[msg.sender].claimed + amount, "Exceed quota");
        companySeasonCarbon[msg.sender].claimed = companySeasonCarbon[msg.sender].claimed + amount;
        emit CarbonClaim(amount);
    }

    function useCarbon(uint amount) external {
        CarbonInfo memory carbon = companySeasonCarbon[msg.sender];
        require(carbon.claimed + carbon.buyed >= carbon.used + carbon.locked + amount, "Exceed claimed");
        companySeasonCarbon[msg.sender].used = companySeasonCarbon[msg.sender].used + amount;
        emit CarbonUse(amount);
    }

    function makeOrder(uint amount) external {
        CarbonInfo memory carbon = companySeasonCarbon[msg.sender];
        require(carbon.locked == 0, "Cannot make 2 orders!");
        require(carbon.claimed + carbon.buyed >= carbon.used + amount, "Exceed claimed");
        companySeasonCarbon[msg.sender].locked = amount;
        swapOrders.push(SwapOrder(msg.sender, amount, address(0), true));

        emit OrderMake(amount);
    }

    function cancelOrder(uint index) external {
        require(swapOrders.length > index, "Index overflow");
        require(swapOrders[index].from == msg.sender, "Not order maker");
        
        swapOrders[index].onSale = false;
        companySeasonCarbon[swapOrders[index].from].locked = 0;
        emit OrderCancel(index, msg.sender);
    }

    function buyCarbon(uint index) external {
        require(swapOrders.length > index, "Index overflow");
        require(swapOrders[index].onSale == true, "Not on sale");
        swapOrders[index].to = msg.sender;
        swapOrders[index].onSale = false;
        SwapOrder memory order = swapOrders[index];
        companySeasonCarbon[order.from].locked = 0;
        companySeasonCarbon[order.from].used  = companySeasonCarbon[order.from].used + order.amount;
        companySeasonCarbon[msg.sender].buyed = companySeasonCarbon[msg.sender].buyed + order.amount;
        emit OrderBuy(index, msg.sender, order.from, order.amount);
    }

    function GetOrders() external view returns (SwapOrder[] memory) {
        return swapOrders;
    }

}