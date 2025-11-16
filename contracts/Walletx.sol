// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract WalletX {
    enum EscrowStatus { Pending, Claimed, Refunded }

    struct Escrow {
        address sender;
        address receiver;
        uint256 amount;
        EscrowStatus status;
        uint256 createdAt;
        uint256 claimedAt;
        uint256 refundedAt;
    }

    uint256 public escrowCount;
    mapping(uint256 => Escrow) public escrows;
    mapping(address => uint256[]) public sentEscrows;
    mapping(address => uint256[]) public receivedEscrows;

    event EscrowCreated(uint256 indexed escrowId, address indexed sender, address indexed receiver, uint256 amount);
    event Claimed(uint256 indexed escrowId, address indexed receiver, uint256 at);
    event Refunded(uint256 indexed escrowId, address indexed sender, uint256 at);

    // Create a new escrow (send ETH directly)
    function createEscrow(address receiver) external payable returns (uint256) {
        require(msg.value > 0, "Amount must be >0");
        require(receiver != address(0), "Receiver required");

        escrowCount += 1;
        escrows[escrowCount] = Escrow({
            sender: msg.sender,
            receiver: receiver,
            amount: msg.value,
            status: EscrowStatus.Pending,
            createdAt: block.timestamp,
            claimedAt: 0,
            refundedAt: 0
        });

        sentEscrows[msg.sender].push(escrowCount);
        receivedEscrows[receiver].push(escrowCount);

        emit EscrowCreated(escrowCount, msg.sender, receiver, msg.value);
        return escrowCount;
    }

    function claim(uint256 escrowId) external {
        Escrow storage esc = escrows[escrowId];
        require(esc.status == EscrowStatus.Pending, "Not claimable");
        require(msg.sender == esc.receiver, "Only receiver can claim");

        esc.status = EscrowStatus.Claimed;
        esc.claimedAt = block.timestamp;

        (bool success, ) = payable(esc.receiver).call{value: esc.amount}("");
        require(success, "Claim transfer failed");

        emit Claimed(escrowId, esc.receiver, esc.claimedAt);
    }

    function refund(uint256 escrowId) external {
        Escrow storage esc = escrows[escrowId];
        require(esc.status == EscrowStatus.Pending, "Not refundable");
        require(msg.sender == esc.sender, "Only sender can refund");

        esc.status = EscrowStatus.Refunded;
        esc.refundedAt = block.timestamp;

        (bool success, ) = payable(esc.sender).call{value: esc.amount}("");
        require(success, "Refund transfer failed");

        emit Refunded(escrowId, esc.sender, esc.refundedAt);
    }

    function getUserSentEscrows(address user) external view returns (uint256[] memory) {
        return sentEscrows[user];
    }

    function getUserReceivedEscrows(address user) external view returns (uint256[] memory) {
        return receivedEscrows[user];
    }

    function getEscrowDetails(uint256 escrowId) external view returns (
        address sender,
        address receiver,
        uint256 amount,
        EscrowStatus status,
        uint256 createdAt,
        uint256 claimedAt,
        uint256 refundedAt
    ) {
        Escrow memory esc = escrows[escrowId];
        return (esc.sender, esc.receiver, esc.amount, esc.status, esc.createdAt, esc.claimedAt, esc.refundedAt);
    }

    function getPendingActions(address user) external view returns (uint256[] memory claimable, uint256[] memory refundable) {
        uint256 sentLength = sentEscrows[user].length;
        uint256 receivedLength = receivedEscrows[user].length;
        uint256[] memory tmpClaim = new uint256[](receivedLength);
        uint256[] memory tmpRefund = new uint256[](sentLength);
        uint256 c = 0;
        uint256 r = 0;

        for (uint256 i = 0; i < receivedLength; i++) {
            uint256 eid = receivedEscrows[user][i];
            if (escrows[eid].status == EscrowStatus.Pending) {
                tmpClaim[c] = eid;
                c++;
            }
        }
        for (uint256 i = 0; i < sentLength; i++) {
            uint256 eid = sentEscrows[user][i];
            if (escrows[eid].status == EscrowStatus.Pending) {
                tmpRefund[r] = eid;
                r++;
            }
        }
        uint256[] memory claimableResult = new uint256[](c);
        uint256[] memory refundableResult = new uint256[](r);
        for (uint256 i = 0; i < c; i++) {
            claimableResult[i] = tmpClaim[i];
        }
        for (uint256 i = 0; i < r; i++) {
            refundableResult[i] = tmpRefund[i];
        }
        return (claimableResult, refundableResult);
    }
}