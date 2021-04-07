pragma solidity ^0.4.17;

contract CampaignFactory {
    address[] public deployedCampaigns;

    function createCampaign(uint256 minimum) public {
        address newCampaign = new Campaign(minimum, msg.sender);
        deployedCampaigns.push(newCampaign);
    }

    function getDeployedCampaigns() public view returns (address[]) {
        return deployedCampaigns;
    }
}

contract Campaign {
    struct Request {
        string description;
        uint256 value;
        address recipient;
        bool complete;
        uint256 approvalCount;
        mapping(address => bool) approvals;
    }

    address public manager;
    uint256 public minContribution;
    mapping(address => bool) public approvers;
    uint256 public approversCount;
    Request[] public requests;

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    function Campaign(uint256 minimum, address creator) public {
        manager = creator;
        minContribution = minimum;
    }

    function contribute() public payable {
        require(msg.value >= minContribution);
        approvers[msg.sender] = true;
        approversCount++;
    }

    function createRequest(
        string description,
        uint256 value,
        address recipient
    ) public restricted {
        require(value < this.balance);
        requests.push(
            Request({
                description: description,
                value: value,
                recipient: recipient,
                complete: false,
                approvalCount: 0
            })
        );
    }

    function approveRequest(uint256 reqIndex) public {
        Request storage req = requests[reqIndex];

        require(approvers[msg.sender]);
        require(!req.approvals[msg.sender]);

        req.approvals[msg.sender] = true;
        req.approvalCount++;
    }

    function finalizeRequest(uint256 reqIndex) public restricted {
        Request storage req = requests[reqIndex];

        require(req.approvalCount > approversCount / 2);
        require(!req.complete);

        req.recipient.transfer(req.value);
        req.complete = true;
    }

    function getSummary()
        public
        view
        returns (
            uint256,
            uint256,
            uint256,
            uint256,
            address
        )
    {
        return (
            minContribution,
            this.balance,
            requests.length,
            approversCount,
            manager
        );
    }

    function getRequestsCount() public view returns (uint256) {
        return requests.length;
    }
}
